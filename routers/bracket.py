from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math
import random

router = APIRouter()

class GenerateRequest(BaseModel):
    pocet_tymu: int = 8 # 4, 8 nebo 16
    jmena: List[str]

class MatchTeam(BaseModel):
    nazev: str
    skore: Optional[str] = ""

class Match(BaseModel):
    id: str
    tym1: MatchTeam
    tym2: MatchTeam
    vitez: Optional[str] = None # "tym1" | "tym2" | None

class Round(BaseModel):
    nazev: str
    zapasy: List[Match]

class LeaderboardRequest(BaseModel):
    kola: List[Round]

@router.post("/bracket/generovat")
def generate_bracket(req: GenerateRequest):
    """
    Vygeneruje strukturu turnajového pavouka pro 4, 8 nebo 16 týmů.
    """
    pocet = req.pocet_tymu
    if pocet not in [4, 8, 16]:
        pocet = 8

    jmena = [j.strip() for j in req.jmena if j.strip()]
    while len(jmena) < pocet:
        jmena.append(f"Tým {len(jmena) + 1}")
    jmena = jmena[:pocet]

    celkem_kol = int(math.log2(pocet))
    nazvy_kol_map = {
        2: ["Semifinále", "Finále"],
        3: ["Čtvrtfinále", "Semifinále", "Finále"],
        4: ["Osmifinále", "Čtvrtfinále", "Semifinále", "Finále"]
    }

    kola = []
    # 1. Kolo
    zapasy_kolo1 = []
    for i in range(0, pocet, 2):
        zapasy_kolo1.push if False else zapasy_kolo1.append({
            "id": f"r0-m{i // 2}",
            "tym1": {"nazev": jmena[i], "skore": ""},
            "tym2": {"nazev": jmena[i + 1], "skore": ""},
            "vitez": None
        })

    kola.append({
        "nazev": nazvy_kol_map[celkem_kol][0],
        "zapasy": zapasy_kolo1
    })

    # Další kola
    pocet_zapasu = len(zapasy_kolo1) // 2
    for r in range(1, celkem_kol):
        zapasy = []
        for m in range(pocet_zapasu):
            zapasy.append({
                "id": f"r{r}-m{m}",
                "tym1": {"nazev": "TBD", "skore": ""},
                "tym2": {"nazev": "TBD", "skore": ""},
                "vitez": None
            })
        kola.append({
            "nazev": nazvy_kol_map[celkem_kol][r],
            "zapasy": zapasy
        })
        pocet_zapasu //= 2

    return {"kola": kola}

@router.post("/bracket/leaderboard")
def calculate_leaderboard(req: LeaderboardRequest):
    """
    Vyhodnotí finální pořadí (leaderboard) všech týmů na základě dosaženého kola a skóre.
    """
    kola = req.kola
    if not kola:
        return {"leaderboard": []}

    finale = kola[-1].zapasy[0] if kola[-1].zapasy else None
    if not finale or not finale.vitez:
        return {"leaderboard": [], "zprava": "Finále ještě nebylo odehráno."}

    # Pomocná funkce pro získání bodů z textového skóre
    def parse_points(val: str) -> int:
        try:
            return int(val.strip())
        except Exception:
            return 0

    # Spočítáme pro každý tým:
    # - v jakém kole skončil
    # - celkové vstřelené body
    # - celkový počet výher
    tym_stats: Dict[str, Dict[str, Any]] = {}

    for kolo_idx, kolo in enumerate(kola):
        for zapas in kolo.zapasy:
            t1 = zapas.tym1.nazev
            t2 = zapas.tym2.nazev
            s1 = parse_points(zapas.tym1.skore or "0")
            s2 = parse_points(zapas.tym2.skore or "0")

            for t, s in [(t1, s1), (t2, s2)]:
                if t and t != "TBD":
                    if t not in tym_stats:
                        tym_stats[t] = {
                            "tym": t,
                            "nejdal_kolo": kolo_idx,
                            "celkove_skore": 0,
                            "vyhry": 0,
                            "status": "Vyřazen"
                        }
                    tym_stats[t]["celkove_skore"] += s
                    tym_stats[t]["nejdal_kolo"] = max(tym_stats[t]["nejdal_kolo"], kolo_idx)

            if zapas.vitez:
                vitezny_tym = zapas.tym1.nazev if zapas.vitez == "tym1" else zapas.tym2.nazev
                if vitezny_tym and vitezny_tym in tym_stats:
                    tym_stats[vitezny_tym]["vyhry"] += 1

    # Určíme vítěze a poraženého z finále
    vitez_finale = finale.tym1.nazev if finale.vitez == "tym1" else finale.tym2.nazev
    porazeny_finale = finale.tym2.nazev if finale.vitez == "tym1" else finale.tym1.nazev

    # Skupiny podle kola vyřazení
    # nejvyšší kolo = finále
    posledni_kolo_idx = len(kola) - 1

    leaderboard = []

    # 1. Místo
    if vitez_finale and vitez_finale in tym_stats:
        leaderboard.append({
            "poradi": 1,
            "tym": vitez_finale,
            "faze": "Vítěz turnaje",
            "vyhry": tym_stats[vitez_finale]["vyhry"],
            "celkove_skore": tym_stats[vitez_finale]["celkove_skore"],
            "medaile": "gold"
        })

    # 2. Místo
    if porazeny_finale and porazeny_finale in tym_stats:
        leaderboard.append({
            "poradi": 2,
            "tym": porazeny_finale,
            "faze": "Finalista",
            "vyhry": tym_stats[porazeny_finale]["vyhry"],
            "celkove_skore": tym_stats[porazeny_finale]["celkove_skore"],
            "medaile": "silver"
        })

    # Poražení v nižších kolech (od semifinále dolů)
    for r in range(posledni_kolo_idx - 1, -1, -1):
        porazeni_v_tomto_kole = []
        nazev_kola = kola[r].nazev
        
        for zapas in kola[r].zapasy:
            if zapas.vitez:
                porazeny = zapas.tym2.nazev if zapas.vitez == "tym1" else zapas.tym1.nazev
                if porazeny and porazeny != "TBD" and porazeny in tym_stats:
                    # Ujistíme se, že ještě není v žebříčku
                    if not any(entry["tym"] == porazeny for entry in leaderboard):
                        porazeni_v_tomto_kole.append(tym_stats[porazeny])

        # Seřadíme poražené v daném kole podle celkového skóre (sestupně)
        porazeni_v_tomto_kole.sort(key=lambda x: (x["celkove_skore"], x["vyhry"]), reverse=True)

        for tym_data in porazeni_v_tomto_kole:
            aktualni_poradi = len(leaderboard) + 1
            medaile = "bronze" if aktualni_poradi == 3 else None
            leaderboard.append({
                "poradi": aktualni_poradi,
                "tym": tym_data["tym"],
                "faze": f"Vyřazen ({nazev_kola})",
                "vyhry": tym_data["vyhry"],
                "celkove_skore": tym_data["celkove_skore"],
                "medaile": medaile
            })

    return {"leaderboard": leaderboard}
