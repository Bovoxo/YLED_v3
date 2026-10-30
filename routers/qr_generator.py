from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
import base64
from urllib.parse import quote

router = APIRouter()

class QRGenerateRequest(BaseModel):
    text: str
    velikost: int = 10 # box_size (velikost jednoho pixelu QR)
    ramecek: int = 3 # border (šířka tichého okraje)
    barva_popredi: str = "#ffffff"
    barva_pozadi: str = "#0f172a"
    korekce: str = "M" # "L" (7%), "M" (15%), "Q" (25%), "H" (30%)
    format_souboru: str = "png" # "png" nebo "svg"

def zkontrolovat_knihovny():
    try:
        import qrcode
        from PIL import Image
        return True, qrcode, Image
    except ImportError:
        return False, None, None

@router.post("/qr/generovat")
def generate_qr(req: QRGenerateRequest):
    """
    Vygeneruje QR kód na základě textu a barev.
    Vrací base64 data URL pro okamžité zobrazení v prohlížeči i SVG kód.
    """
    if not req.text.strip():
        return {"chyba": "Zadej text nebo odkaz pro vytvoření QR kódu."}

    dostupne, qrcode, Image = zkontrolovat_knihovny()
    if not dostupne:
        return {
            "chyba": "Knihovna 'qrcode' není na serveru nainstalována. Spusť v terminálu: pip install qrcode pillow",
            "potrebuje_instalaci": True
        }

    korekce_map = {
        "L": qrcode.constants.ERROR_CORRECT_L,
        "M": qrcode.constants.ERROR_CORRECT_M,
        "Q": qrcode.constants.ERROR_CORRECT_Q,
        "H": qrcode.constants.ERROR_CORRECT_H,
    }

    try:
        qr = qrcode.QRCode(
            version=None,
            error_correction=korekce_map.get(req.korekce.upper(), qrcode.constants.ERROR_CORRECT_M),
            box_size=max(2, min(req.velikost, 30)),
            border=max(0, min(req.ramecek, 10)),
        )
        qr.add_data(req.text.strip())
        qr.make(fit=True)

        # Generování PNG obrázku
        img = qr.make_image(
            fill_color=req.barva_popredi,
            back_color=req.barva_pozadi
        )

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        img_bytes = buffer.getvalue()
        base64_png = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

        # Generování SVG
        import qrcode.image.svg
        svg_factory = qrcode.image.svg.SvgPathImage
        svg_img = qr.make_image(
            image_factory=svg_factory,
            fill_color=req.barva_popredi,
            back_color=req.barva_pozadi
        )
        svg_buf = io.BytesIO()
        svg_img.save(svg_buf)
        svg_content = svg_buf.getvalue().decode("utf-8")

        return {
            "status": "ok",
            "data_url": base64_png,
            "svg": svg_content,
            "velikost_px": img.size[0],
            "text": req.text
        }

    except Exception as e:
        return {"chyba": f"Chyba při generování QR kódu: {str(e)}"}

@router.get("/qr/stahnout")
def download_qr(
    text: str,
    format: str = "png",
    barva_popredi: str = "#000000",
    barva_pozadi: str = "#ffffff",
    velikost: int = 12,
    ramecek: int = 3,
    korekce: str = "M"
):
    """
    Přímo stáhne vygenerovaný QR kód jako soubor (PNG nebo SVG).
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Chybí text pro QR kód.")

    dostupne, qrcode, Image = zkontrolovat_knihovny()
    if not dostupne:
        raise HTTPException(
            status_code=500,
            detail="Knihovna 'qrcode' není nainstalována. Spusť: pip install qrcode pillow"
        )

    korekce_map = {
        "L": qrcode.constants.ERROR_CORRECT_L,
        "M": qrcode.constants.ERROR_CORRECT_M,
        "Q": qrcode.constants.ERROR_CORRECT_Q,
        "H": qrcode.constants.ERROR_CORRECT_H,
    }

    try:
        qr = qrcode.QRCode(
            version=None,
            error_correction=korekce_map.get(korekce.upper(), qrcode.constants.ERROR_CORRECT_M),
            box_size=max(2, min(velikost, 40)),
            border=max(0, min(ramecek, 10)),
        )
        qr.add_data(text.strip())
        qr.make(fit=True)

        bezpecny_nazev = "qr_kod"

        if format.lower() == "svg":
            import qrcode.image.svg
            svg_factory = qrcode.image.svg.SvgPathImage
            svg_img = qr.make_image(
                image_factory=svg_factory,
                fill_color=barva_popredi,
                back_color=barva_pozadi
            )
            svg_buf = io.BytesIO()
            svg_img.save(svg_buf)
            svg_buf.seek(0)

            return Response(
                content=svg_buf.getvalue(),
                media_type="image/svg+xml",
                headers={"Content-Disposition": f"attachment; filename={bezpecny_nazev}.svg"}
            )
        else:
            img = qr.make_image(
                fill_color=barva_popredi,
                back_color=barva_pozadi
            )
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)

            return Response(
                content=buf.getvalue(),
                media_type="image/png",
                headers={"Content-Disposition": f"attachment; filename={bezpecny_nazev}.png"}
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
