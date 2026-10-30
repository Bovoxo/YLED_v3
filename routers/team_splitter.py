from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import random

router = APIRouter()

class TeamRequest(BaseModel):
    seznam_jmen: str
    pocet_tymu: int = 2
    nazvy_tymu: Optional[List[str]] = None

@router.post("/rozdelit-tymy")
def split_teams(request: TeamRequest):
    """
    Spravedlivě zamíchá a rozdělí seznam jmen do zadaného počtu týmů.
    """
    raw_text = request.seznam_jmen
    names = [line.strip() for line in raw_text.splitlines() if line.strip()]

    if not names:
        return {"chyba": "Nebyly zadány žádné jména ke slosování."}

    num_teams = request.pocet_tymu
    if num_teams < 1:
        return {"chyba": "Počet týmů musí být alespoň 1."}

    if num_teams > len(names):
        num_teams = len(names)

    # Zamíchání jmen
    random.shuffle(names)

    teams = [[] for _ in range(num_teams)]

    # Spravedlivé rozdávání pomocí modula
    for i, name in enumerate(names):
        team_index = i % num_teams
        teams[team_index].append(name)

    vysledek = []
    for i, team in enumerate(teams):
        # Pokud uživatel zadal vlastní názvy týmů, použijeme je
        if request.nazvy_tymu and i < len(request.nazvy_tymu) and request.nazvy_tymu[i].strip():
            nazev = request.nazvy_tymu[i].strip()
        else:
            nazev = f"Tým {i + 1}"

        vysledek.append({
            "nazev_tymu": nazev,
            "pocet_clenu": len(team),
            "clenove": team
        })

    return {
        "vysledne_tymy": vysledek,
        "celkem_hracu": len(names)
    }
