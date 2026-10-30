import os
import json
import shutil
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()

# Cesta ke složce se zvuky
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOUNDS_DIR = os.path.join(ROOT_DIR, "frontend", "public", "zvuky")
CONFIG_FILE = os.path.join(ROOT_DIR, "soundboard_config.json")

# Zajistíme, že složka pro zvuky existuje
os.makedirs(SOUNDS_DIR, exist_ok=True)

class SoundButton(BaseModel):
    url: Optional[str] = None
    name: str = "Prázdné"
    color: str = "#334155"
    icon: Optional[str] = None # 'bell', 'flame', 'music', 'alert', 'zap', 'trophy', 'smile', 'clock', 'sparkles', 'skull', 'volume'
    start: float = 0
    end: float = 0
    volume: float = 1.0 # 0.1 až 1.5
    mode: str = "restart" # "restart" | "overlap" | "hold"
    hotkey: Optional[str] = None
    playing: Optional[bool] = False

class SoundboardConfig(BaseModel):
    buttons: List[SoundButton]
    pageNames: Optional[List[str]] = ["Stránka 1", "Stránka 2", "Stránka 3"]
    masterVolume: Optional[float] = 1.0

@router.get("/zvuky")
def list_sounds():
    """
    Vrátí seznam všech zvukových souborů dostupných na serveru.
    """
    podporovane_pripony = {".mp3", ".wav", ".ogg", ".m4a", ".aac"}
    seznam = []

    if os.path.exists(SOUNDS_DIR):
        for soubor in sorted(os.listdir(SOUNDS_DIR)):
            cesta = os.path.join(SOUNDS_DIR, soubor)
            if os.path.isfile(cesta):
                ext = os.path.splitext(soubor)[1].lower()
                if ext in podporovane_pripony:
                    velikost_kb = round(os.path.getsize(cesta) / 1024, 1)
                    nazev = os.path.splitext(soubor)[0].replace("_", " ").title()
                    seznam.append({
                        "filename": soubor,
                        "name": nazev,
                        "url": f"/zvuky/{soubor}",
                        "size_kb": velikost_kb
                    })

    return {
        "celkem": len(seznam),
        "zvuky": seznam
    }

@router.post("/zvuky/nahrat")
async def upload_sound(file: UploadFile = File(...), custom_name: Optional[str] = Form(None)):
    """
    Nahraje nový zvukový soubor na server.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Chybí název souboru.")

    ext = os.path.splitext(file.filename)[1].lower()
    povolené = {".mp3", ".wav", ".ogg", ".m4a", ".aac"}
    if ext not in povolené:
        raise HTTPException(status_code=400, detail=f"Nepodporovaný formát. Povoleno: {', '.join(povolené)}")

    # Bezpečný název souboru
    cisty_nazev = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    cilova_cesta = os.path.join(SOUNDS_DIR, cisty_nazev)

    with open(cilova_cesta, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    zobrazovany_nazev = custom_name.strip() if custom_name else os.path.splitext(cisty_nazev)[0].replace("_", " ")

    return {
        "status": "ok",
        "zprava": "Zvuk byl úspěšně nahrán na server.",
        "filename": cisty_nazev,
        "name": zobrazovany_nazev,
        "url": f"/zvuky/{cisty_nazev}"
    }

@router.delete("/zvuky/{filename}")
def delete_sound(filename: str):
    """
    Smaže zvuk ze serveru.
    """
    cesta = os.path.join(SOUNDS_DIR, os.path.basename(filename))
    if os.path.exists(cesta):
        try:
            os.remove(cesta)
            return {"status": "ok", "zprava": f"Zvuk '{filename}' byl smazán."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Chyba při mazání: {str(e)}")
    raise HTTPException(status_code=404, detail="Zvuk nebyl nalezen.")

@router.get("/soundboard/konfigurace")
def get_config():
    """
    Načte uloženou konfiguraci tlačítek soundboardu ze serveru.
    Pokud soubor neexistuje, vrátí výchozí stav.
    """
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {"status": "ok", "config": data}
        except Exception:
            pass
    return {"status": "empty", "config": None}

@router.post("/soundboard/konfigurace")
def save_config(config: SoundboardConfig):
    """
    Uloží aktuální rozložení a nastavení soundboardu na server,
    aby bylo synchronizované napříč všemi zařízeními (mobil, PC, tablet).
    """
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config.dict(), f, ensure_ascii=False, indent=2)
        return {"status": "ok", "zprava": "Konfigurace soundboardu uložena."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chyba při ukládání: {str(e)}")

@router.get("/soundboard/export")
def export_config():
    """
    Stáhne kompletní konfigurační soubor soundboardu.
    """
    if os.path.exists(CONFIG_FILE):
        return FileResponse(
            path=CONFIG_FILE,
            media_type="application/json",
            filename="soundboard_backup.json"
        )
    raise HTTPException(status_code=404, detail="Na serveru zatím není uložena konfigurace.")
