# 🏕️ YLeventdeck 3.0 (VOL3)

Moderní multi-aplikace pro tábory, eventy a školy.

## 🚀 Rychlé lokální spuštění na tvém počítači

### 1. Krok: Spuštění Python Backendu (Terminál 1)
Otevři terminál v kořenové složce projektu:
```powershell
# Pokud ještě nemáš nainstalované knihovny:
pip install -r requirements.txt

# Spuštění serveru s automatickým reloadem:
uvicorn main:app --reload --port 8000
```
Backend ti poběží na `http://127.0.0.1:8000`. Dokumentaci API najdeš na `http://127.0.0.1:8000/docs`.

---

### 2. Krok: Spuštění React Frontendu (Terminál 2)
Otevři druhý terminál a přejdi do složky `frontend`:
```powershell
cd frontend

# Nainstaluj balíčky (pouze napoprvé):
npm install

# Spusť vývojový server:
npm run dev
```
Otevři prohlížeč na `http://localhost:3000`. 
Díky nastavenému proxy ve `vite.config.js` všechny požadavky na `/api` automaticky směřují do tvého lokálního Pythonu!

---

### 3. Zkopírování zvuků ze starší verze (VOL2)
Ve Windows Exploreru jednoduše překopíruj složku:
`ULTRA_CAMP_APP_VOL2\frontend\public\zvuky`  
$\rightarrow$ do:  
`ULTRA_CAMP_APP_VOL3\frontend\public\zvuky`

Také můžeš do kořenové složky `VOL3` zkopírovat `ffmpeg.exe` z `VOL2` pro lokální stahování videí z YouTube na Windows.

---

## 📁 Architektura projektu

* **`main.py`** – Vstupní bod FastAPI, načítání proměnných z `.env`, CORS a registrace modulů.
* **`routers/`** – Samostatné Python moduly:
  * `random_number.py` – Losovač náhodných čísel
  * `team_splitter.py` – Spravedlivé dělení do týmů
  * `lyrics_to_ppt.py` – Vyhledání na Genius.com a generování PowerPoint prezentací přímo v RAM
  * `youtube_downloader.py` – Stahování videa/audia přes yt-dlp a ffmpeg se sledováním průběhu
  * `imposter.py` – Společenská hra Imposter s databází slov
* **`frontend/`** – Moderní React 19 + Vite SPA:
  * `src/components/layout/` – Hlavička, kontrola spojení se serverem, navigace
  * `src/components/modules/` – Samostatné čisté komponenty pro každý nástroj
