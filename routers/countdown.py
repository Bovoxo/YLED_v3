from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class TimerPreset(BaseModel):
    nazev: str
    sekundy: int

PREDVOLBY = [
    {"nazev": "30 sekund", "sekundy": 30},
    {"nazev": "1 minuta", "sekundy": 60},
    {"nazev": "2 minuty", "sekundy": 120},
    {"nazev": "3 minuty", "sekundy": 180},
    {"nazev": "5 minut", "sekundy": 300},
    {"nazev": "10 minut", "sekundy": 600},
    {"nazev": "15 minut", "sekundy": 900},
    {"nazev": "20 minut", "sekundy": 1200},
    {"nazev": "30 minut", "sekundy": 1800},
    {"nazev": "45 minut", "sekundy": 2700}
]

@router.get("/countdown/predvolby")
def get_presets():
    """
    Vrátí výchozí táborové předvolby časovače.
    """
    return {"predvolby": PREDVOLBY}

class CustomTimeRequest(BaseModel):
    minuty: int = 0
    sekundy: int = 0

@router.post("/countdown/vypocet")
def calculate_seconds(req: CustomTimeRequest):
    """
    Validuje a převede zadané minuty a sekundy na celkový čas.
    """
    celkem = max(0, req.minuty * 60 + req.sekundy)
    return {
        "celkem_sekund": celkem,
        "format": f"{celkem // 60:02d}:{celkem % 60:02d}"
    }
