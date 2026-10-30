from fastapi import APIRouter
import random

router = APIRouter()

@router.get("/losovat")
def draw_number(od: int = 1, do: int = 100, pocet: int = 1, unikatni: bool = True):
    """
    Vylosuje náhodné číslo (nebo čísla) v daném rozsahu.
    Zpětně kompatibilní: vrací jak 'vylosovano' (pro 1 číslo), tak seznam 'cisla'.
    """
    if od > do:
        return {"chyba": "Chyba! Hodnota 'od' nesmí být větší než 'do'."}
    
    rozsah_velikost = do - od + 1
    if unikatni and pocet > rozsah_velikost:
        return {"chyba": f"Nelze vylosovat {pocet} unikátních čísel z rozsahu o velikosti {rozsah_velikost}."}

    if pocet <= 1:
        vysledek = random.randint(od, do)
        return {
            "vylosovano": vysledek,
            "cisla": [vysledek],
            "rozsah": f"{od} - {do}"
        }

    if unikatni:
        vybrana = random.sample(range(od, do + 1), pocet)
    else:
        vybrana = [random.randint(od, do) for _ in range(pocet)]

    return {
        "vylosovano": vybrana[0],
        "cisla": vybrana,
        "rozsah": f"{od} - {do}"
    }
