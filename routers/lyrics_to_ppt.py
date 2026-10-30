import os
import re
import math
import io
from urllib.parse import quote
from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import lyricsgenius

router = APIRouter()

# Načtení tokenu z prostředí s fallbackem na výchozí token
DEFAULT_TOKEN = "YCvV3ZCX6orJkY9A4Jl6k6dl-fS55dbQTKhQ4XUIzjSqTwKy7Cbk69qhhxrKCkWv"
GENIUS_TOKEN = os.getenv("GENIUS_TOKEN", DEFAULT_TOKEN)

class SearchRequest(BaseModel):
    interpret: str
    pisen: str

class PPTXRequest(BaseModel):
    text_pisne: str
    max_radku: int = 4
    nazev_souboru: str = "Píseň"
    tema: str = "dark" # "dark", "light", "stage"

@router.post("/vyhledat-text")
def search_lyrics(req: SearchRequest):
    """
    Vyhledá text písně na Genius.com a vyčistí nežádoucí značky.
    """
    if not req.pisen.strip():
        return {"chyba": "Zadej název písně."}

    try:
        genius = lyricsgenius.Genius(GENIUS_TOKEN)
        song_data = genius.search_song(req.pisen.strip(), req.interpret.strip() if req.interpret else "")

        if song_data and song_data.lyrics:
            text = song_data.lyrics
            # Vyčištění typických artefaktů z Genius
            text = re.sub(r"^\d+ Contributors", "", text)
            text = re.sub(r"^.*?Lyrics", "", text, flags=re.DOTALL) if "Lyrics" in text[:60] else text
            text = re.sub(r"\[.*?\]", "", text) # Odstranění sekcí jako [Chorus], [Verse 1]
            text = re.sub(r"\d*Embed$", "", text)
            text = text.replace('\r\n', '\n')
            text = re.sub(r'\n{3,}', '\n\n', text)
            
            vycisteny = text.strip()
            if not vycisteny:
                return {"chyba": "Text písně byl nalezen, ale po vyčištění nezůstal žádný obsah."}

            return {
                "text": vycisteny,
                "nazev": song_data.title,
                "umelec": song_data.artist
            }
        else:
            return {"chyba": "Píseň nebyla na Genius.com nalezena."}
    except Exception as e:
        return {"chyba": f"Chyba při komunikaci s Genius: {str(e)}"}

@router.post("/vytvorit-prezentaci")
def create_pptx(req: PPTXRequest):
    """
    Převede zadaný text písně na PowerPoint prezentaci (.pptx) v poměru 16:9.
    Vytvoří se přímo v paměti RAM a odešle uživateli bez ukládání na disk.
    """
    blocks = req.text_pisne.split("\n\n")
    blocks = [b.strip() for b in blocks if b.strip()]

    if not blocks:
        return {"chyba": "Žádný text k převodu."}

    prs = Presentation()
    prs.slide_width = Inches(13.333) # 16:9 širokoúhlý formát
    prs.slide_height = Inches(7.5)

    # Barvy podle zvoleného tématu
    if req.tema == "light":
        bg_color = RGBColor(248, 250, 252)
        font_color = RGBColor(15, 23, 42)
    elif req.tema == "stage":
        bg_color = RGBColor(10, 10, 15)
        font_color = RGBColor(250, 204, 21) # Žluté pódium
    else: # dark default
        bg_color = RGBColor(0, 0, 0)
        font_color = RGBColor(255, 255, 255)

    def add_slide(text_content):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = bg_color
        
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(5.9))
        tf = txBox.text_frame
        tf.word_wrap = True
        
        lines = text_content.strip().splitlines()
        for idx, line in enumerate(lines):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            p.text = line
            p.font.size = Pt(42)
            p.font.name = 'Arial'
            p.font.bold = True
            p.font.color.rgb = font_color
            p.alignment = PP_ALIGN.CENTER

    for block in blocks:
        lines = block.splitlines()
        if len(lines) <= req.max_radku:
            add_slide("\n".join(lines))
        else:
            num_parts = math.ceil(len(lines) / req.max_radku)
            chunk_size = math.ceil(len(lines) / num_parts)
            for i in range(0, len(lines), chunk_size):
                chunk = lines[i: i + chunk_size]
                add_slide("\n".join(chunk))

    # Uložení do paměťového streamu
    ppt_stream = io.BytesIO()
    prs.save(ppt_stream)
    ppt_stream.seek(0)

    bezpecny_nazev = quote(f"{req.nazev_souboru}.pptx")

    return Response(
        content=ppt_stream.read(),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{bezpecny_nazev}"}
    )
