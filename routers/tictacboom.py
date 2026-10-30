from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

SLABIKY = [
    "RA", "KO", "TE", "LE", "NA", "PA", "RO", "MA", "SA", "KA",
    "PO", "LA", "TO", "ST", "BA", "VA", "DA", "TA", "ME", "RE",
    "KOS", "LES", "PES", "BRA", "MRA", "KRA", "ZLE", "STR", "PRA", "HLV", "VOD"
]

POZICE = [
    {"nazev": "Kdekoliv ve slově", "popis": "Slabika může být na začátku, uprostřed i na konci"},
    {"nazev": "Nesmí být na začátku", "popis": "Slabika musí být uprostřed nebo na konci slova"},
    {"nazev": "Nesmí být na konci", "popis": "Slabika musí být na začátku nebo uprostřed slova"}
]

TEMATA = [
    "Věci, které najdeš v táborovém batohu",
    "Zvířata žijící v českém lese",
    "Co se nesmí dělat po večerce",
    "Jídla ze školní / táborové jídelny",
    "Co si sbalit na stezku odvahy",
    "Věci, které plavou na vodě",
    "Co najdeš v lese na zemi",
    "Důvody, proč přijít pozdě na nástup",
    "Věci s kulatým tvarem",
    "Povolání, kde se nosí uniforma",
    "Věci začínající na písmeno K",
    "Písničky zpívané u táboráku",
    "Sportovní disciplíny na letní olympiádě",
    "Věci, které si vezmeš na pustý ostrov",
    "Pohádkové bytosti",
    "České řeky a města"
]

@router.get("/tictacboom/nove-kolo")
def get_new_round():
    """
    Vrátí náhodnou kombinaci pro nové kolo Tik Tak Bum.
    """
    slabika = random.choice(SLABIKY)
    pozice = random.choice(POZICE)
    tema = random.choice(TEMATA)

    return {
        "slabika": slabika,
        "pozice": pozice["nazev"],
        "popis_pozice": pozice["popis"],
        "tema": tema
    }

@router.get("/tictacboom/temata")
def list_temata():
    """
    Vrátí seznam všech dostupných párty témat.
    """
    return {
        "celkem": len(TEMATA),
        "temata": TEMATA,
        "slabiky": SLABIKY
    }
