import os
import re
import uuid
import shutil
import threading
from urllib.parse import quote
from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp

router = APIRouter()

# Stav stahování pro jednotlivé úkoly v paměti:
# { "task_id": { "procenta": 45.5, "status": "stahuje_se"|"konverze"|"hotovo"|"chyba", "cesta": str, "chyba": str } }
STAVY_STAHOVANI = {}

class DownloadRequest(BaseModel):
    url: str
    mode: str = "video" # "video" nebo "audio"
    kvalita: str = "1080" # "max", "1080", "720", "nejnizsi"

def najdi_ffmpeg() -> str:
    """
    Inteligentně najde binárku ffmpeg na Windows i Linuxu.
    1. V kořenové složce projektu (ffmpeg.exe)
    2. V sousední složce VOL2 (pokud ještě nebyla zkopírována)
    3. V systémové proměnné PATH (shutil.which)
    4. Na standardní Linux cestě /usr/bin/ffmpeg
    """
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    local_ffmpeg = os.path.join(root_dir, "ffmpeg.exe")
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg

    vol2_ffmpeg = os.path.join(os.path.dirname(root_dir), "ULTRA_CAMP_APP_VOL2", "ffmpeg.exe")
    if os.path.exists(vol2_ffmpeg):
        return vol2_ffmpeg

    which_ffmpeg = shutil.which("ffmpeg")
    if which_ffmpeg:
        return which_ffmpeg

    if os.path.exists("/usr/bin/ffmpeg"):
        return "/usr/bin/ffmpeg"

    return "ffmpeg"

def smazat_soubor(cesta: str):
    """Bezpečně smaže dočasný soubor po odeslání uživateli."""
    try:
        if os.path.exists(cesta):
            os.remove(cesta)
    except Exception as e:
        print(f"Chyba při mazání souboru {cesta}: {e}")

def progress_hook(d, task_id):
    """Zpracovává průběh stahování z yt-dlp."""
    if d['status'] == 'downloading':
        percent_str = d.get('_percent_str', '0%').strip('\x1b[0;94m').strip('\x1b[0m').replace('%', '')
        try:
            STAVY_STAHOVANI[task_id]["procenta"] = float(percent_str)
        except Exception:
            pass
    elif d['status'] == 'finished':
        STAVY_STAHOVANI[task_id]["status"] = "konverze"

def stahnout_na_pozadi(req: DownloadRequest, task_id: str):
    """Běží v samostatném vlákně a stahuje zadané video/audio."""
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp_downloads")
    os.makedirs(temp_dir, exist_ok=True)

    ffmpeg_loc = najdi_ffmpeg()

    try:
        ydl_opts = {
            'outtmpl': os.path.join(temp_dir, f'%(title)s_{task_id[:8]}.%(ext)s'),
            'ffmpeg_location': ffmpeg_loc,
            'restrictfilenames': False,
            'windowsfilenames': True,
            'noplaylist': True,
            'progress_hooks': [lambda d: progress_hook(d, task_id)],
            'quiet': True,
            'no_warnings': True,
        }

        if req.mode == "audio":
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '320',
                }],
            })
        else:
            if req.kvalita in ("4k", "max", "2160"):
                format_str = 'bestvideo[height<=2160]+bestaudio/bestvideo+bestaudio/best'
            elif req.kvalita == "720":
                format_str = 'bestvideo[height<=720]+bestaudio/best'
            elif req.kvalita == "nejnizsi":
                format_str = 'bestvideo[height<=360]+bestaudio/best'
            else:
                format_str = 'bestvideo[height<=1080]+bestaudio/best'

            ydl_opts.update({
                'format': format_str,
                'merge_output_format': 'mp4',
            })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(req.url, download=True)
            cesta = ydl.prepare_filename(info_dict)

            if req.mode == "audio":
                cesta = cesta.rsplit('.', 1)[0] + '.mp3'
            elif req.mode == "video":
                cesta = cesta.rsplit('.', 1)[0] + '.mp4'

        if not os.path.exists(cesta):
            STAVY_STAHOVANI[task_id] = {
                "status": "chyba",
                "chyba": f"Soubor se nepodařilo vytvořit. Ffmpeg cesta: {ffmpeg_loc}"
            }
            return

        STAVY_STAHOVANI[task_id] = {
            "status": "hotovo",
            "cesta": cesta,
            "procenta": 100,
            "nazev": os.path.basename(cesta)
        }

    except Exception as e:
        STAVY_STAHOVANI[task_id] = {"status": "chyba", "chyba": str(e)}

@router.post("/stahnout-yt-start")
def start_download(req: DownloadRequest):
    """Zahájí proces stahování a vrátí unikátní task_id."""
    if not req.url or "http" not in req.url:
        return {"chyba": "Zadej platný odkaz na YouTube."}

    task_id = str(uuid.uuid4())
    STAVY_STAHOVANI[task_id] = {
        "status": "stahuje_se",
        "procenta": 0,
        "cesta": None,
        "chyba": None
    }

    vlakno = threading.Thread(target=stahnout_na_pozadi, args=(req, task_id))
    vlakno.daemon = True
    vlakno.start()

    return {"task_id": task_id}

@router.get("/stahnout-yt-stav/{task_id}")
def check_status(task_id: str):
    """Vrací aktuální průběh a stav pro daný task_id."""
    stav = STAVY_STAHOVANI.get(task_id)
    if not stav:
        return {"status": "chyba", "chyba": "Neznámý úkol nebo již vypršel."}
    return stav

@router.get("/stahnout-yt-soubor/{task_id}")
def get_file(task_id: str, background_tasks: BackgroundTasks):
    """Stáhne hotový soubor do prohlížeče a smaže jej ze serveru na pozadí."""
    stav = STAVY_STAHOVANI.get(task_id)
    if not stav or stav.get("status") != "hotovo" or not stav.get("cesta"):
        return {"chyba": "Soubor ještě není připraven nebo neexistuje."}

    cesta = stav["cesta"]
    if not os.path.exists(cesta):
        return {"chyba": "Soubor byl na serveru smazán."}

    # Naplánujeme smazání po odeslání odpovědi
    background_tasks.add_task(smazat_soubor, cesta)
    
    # Odstraníme ze sledování
    STAVY_STAHOVANI.pop(task_id, None)

    nazev = os.path.basename(cesta)
    # Odstranění unikátního ID z názvu souboru pro hezčí název při stažení
    cisty_nazev = re.sub(r'_[a-f0-9]{8}\.', '.', nazev) if 're' in globals() else nazev

    safe_name = quote(cisty_nazev)
    media_type = "audio/mpeg" if cesta.endswith(".mp3") else "video/mp4"

    return FileResponse(
        path=cesta,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe_name}"}
    )
