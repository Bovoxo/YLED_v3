from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

class RaffleRequest(BaseModel):
    polozky: List[str]

SABLONY = {
    "taborove_funkce": [
        "Služba v kuchyni", "Dřevo na táborák", "Vlajkonoš", "Čištění ohniště",
        "Ranní budíček", "Vodní hlídka", "Noční hlídka", "Zapisovatel bodů"
    ],
    "rozcvicka": [
        "10 kliků", "20 dřepů", "Běh kolem tábora", "Skákání panáka",
        "Plank 30 sekund", "Hvězda na louce", "Žabáky", "Výskoky s tlesknutím"
    ],
    "odmeny": [
        "První v jídelně na oběd", "Výběr hudby na rozcvičku", "Sladká odměna",
        "Extra bod pro družinu", "Odpuštění jedné služby", "Diplom dne"
    ]
}

@router.get("/raffle/sablony")
def get_templates():
    """
    Vrátí připravené táborové šablony pro kolo štěstí.
    """
    return {"sablony": SABLONY}

@router.post("/raffle/losovat")
def draw_raffle(req: RaffleRequest):
    """
    Vylosuje náhodného vítěze ze zadaného seznamu položek.
    """
    polozky = [p.strip() for p in req.polozky if p.strip()]
    if not polozky:
        return {"chyba": "Seznam položek je prázdný."}

    vitez = random.choice(polozky)
    zbyvajici = [p for p in polozky if p != vitez]

    return {
        "vitez": vitez,
        "celkem_polozek": len(polozky),
        "zbyvajici_po_odebrani": zbyvajici
    }
