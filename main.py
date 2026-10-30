import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Načtení proměnných prostředí z .env souboru
load_dotenv()

from routers import random_number
from routers import team_splitter
from routers import lyrics_to_ppt
from routers import youtube_downloader
from routers import imposter
from routers import soundboard
from routers import bracket
from routers import tictacboom
from routers import countdown
from routers import raffle
from routers import qr_generator

# Zapnutí lokálně:
# uvicorn main:app --reload --port 8000

app = FastAPI(
    title="YLeventdeck API (VOL3)",
    description="Backend API pro táborové a eventové nástroje",
    version="3.0.0",
    root_path="/api"
)

# Registrace jednotlivých modulů
app.include_router(random_number.router, tags=["Losovač"])
app.include_router(team_splitter.router, tags=["Rozdělovač týmů"])
app.include_router(lyrics_to_ppt.router, tags=["Prezentace"])
app.include_router(youtube_downloader.router, tags=["YouTube Downloader"])
app.include_router(imposter.router, tags=["Imposter Game"])
app.include_router(soundboard.router, tags=["Soundboard"])
app.include_router(bracket.router, tags=["Turnajový pavouk"])
app.include_router(tictacboom.router, tags=["Tik Tak Bum"])
app.include_router(countdown.router, tags=["Odpočet"])
app.include_router(raffle.router, tags=["Kolo štěstí"])
app.include_router(qr_generator.router, tags=["QR Kód"])

# Povolení CORS pro lokální vývoj i produkční doménu
default_origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://yleventdeck.cloud",
    "https://www.yleventdeck.cloud"
]

env_origins = os.getenv("CORS_ORIGINS")
origins = [o.strip() for o in env_origins.split(",") if o.strip()] if env_origins else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "YLeventdeck API",
        "version": "3.0.0",
        "moduly": [
            "losovat",
            "rozdelit-tymy",
            "vyhledat-text",
            "vytvorit-prezentaci",
            "stahnout-yt",
            "imposter-losovat",
            "zvuky",
            "bracket",
            "tictacboom",
            "countdown",
            "raffle",
            "qr"
        ],
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
