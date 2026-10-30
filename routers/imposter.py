from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class ImposterRequest(BaseModel):
    pocet_hracu: int
    pocet_imposteru: int = 1
    kategorie: str
    zobrazit_napovedu: bool = False
    tajny_mod: bool = False

DATABAZE_SLOV = {
    "škola": [
        ("Tělocvik", "Matematika"),
        ("Tabule", "Školní lavice"),
        ("Ředitelna", "Školní jídelna"),
        ("Písemka", "Přestávka"),
        ("Kružítko", "Přezůvky"),
        ("Žákovská knížka", "Vysvědčení"),
        ("Učitel", "Školník"),
        ("Penál", "Batoh do školy")
    ],
    "jídlo": [
        ("Špagety", "Polévka"),
        ("Palačinky", "Míchaná vajíčka"),
        ("Jablko", "Meloun"),
        ("Čokoláda", "Brambůrky"),
        ("Párek v rohlíku", "Svíčková"),
        ("Pizza", "Hamburger"),
        ("Zmrzlina", "Ledová tříšť"),
        ("Knedlo vepřo zelo", "Řízek s kaší")
    ],
    "sport": [
        ("Lední hokej", "Krasobruslení"),
        ("Šachy", "Box"),
        ("Plavání", "Lyžování"),
        ("Cyklistika", "Běh"),
        ("Golf", "Basketbal"),
        ("Fotbal", "Volejbal"),
        ("Skok o tyči", "Skok do dálky"),
        ("Horolezectví", "Turistika")
    ],
    "profese": [
        ("Zpěvák", "Moderátor zpráv"),
        ("Popelář", "Pošťák"),
        ("Chirurg", "Řezník"),
        ("Automechanik", "Závodník F1"),
        ("Kuchař", "Číšník"),
        ("Hasič", "Policista"),
        ("Pilot letadla", "Strojvedoucí vlaku"),
        ("Programátor", "Hacker")
    ],
    "zvířata": [
        ("Pes", "Kočka"),
        ("Slon", "Žirafa"),
        ("Orel", "Tučňák"),
        ("Žralok", "Kapr"),
        ("Had", "Žába"),
        ("Lev", "Tygr"),
        ("Netopýr", "Sova"),
        ("Klokan", "Zajíc")
    ],
    "tábor": [
        ("Stan", "Hlavní budova"),
        ("Táborák", "Stezka odvahy"),
        ("Spacák", "Batoh"),
        ("Vedoucí", "Kuchařka"),
        ("Baterka", "Repelent"),
        ("Ranní rozcvička", "Večerka"),
        ("Ešus", "Kotlík"),
        ("Táborová vlajka", "Bojovka v lese")
    ],
    "filmy a pohádky": [
        ("Harry Potter", "Pán prstenů"),
        ("Shrek", "Lví král"),
        ("Batman", "Spider-Man"),
        ("Star Wars", "Star Trek"),
        ("Piráti z Karibiku", "Titanic"),
        ("Čert", "Vodník")
    ],
    "místa a cestování": [
        ("Pláž u moře", "Zasněžené hory"),
        ("Paříž", "Londýn"),
        ("Letiště", "Nádraží"),
        ("Hotel", "Kemp"),
        ("Hrad", "Zřícenina")
    ]
}

@router.get("/imposter-kategorie")
def get_categories():
    """Vrátí seznam dostupných kategorií."""
    return {"kategorie": list(DATABAZE_SLOV.keys())}

@router.post("/imposter-losovat")
def losovat_role(req: ImposterRequest):
    """Vylosuje tajné slovo a přiřadí hráčům role (Civilista / Impostor)."""
    if req.pocet_hracu <= req.pocet_imposteru:
        return {"chyba": "Počet hráčů musí být větší než počet impostorů!"}

    if req.kategorie not in DATABAZE_SLOV:
        return {"chyba": f"Neznámá kategorie '{req.kategorie}'."}

    dvojice = random.choice(DATABAZE_SLOV[req.kategorie])
    slovo_civilisty = dvojice[0]
    slovo_impostora = dvojice[1]

    role = []
    
    # Civilisté
    for _ in range(req.pocet_hracu - req.pocet_imposteru):
        role.append({"role": "Civilista", "slovo": slovo_civilisty, "je_impostor": False})

    # Impostoři
    for _ in range(req.pocet_imposteru):
        if req.tajny_mod:
            # V tajném režimu má impostor jiné slovo. Na kartě nepozná roli, ale ve výsledcích je to jasný Impostor.
            role.append({
                "role": "Impostor (jiné slovo)",
                "slovo": slovo_impostora,
                "je_impostor": True,
                "tajny_mod": True
            })
        else:
            text = "JSI IMPOSTOR!"
            if req.zobrazit_napovedu:
                text += f" (Kategorie: {req.kategorie})"
            role.append({
                "role": "Impostor",
                "slovo": text,
                "je_impostor": True,
                "tajny_mod": False
            })

    random.shuffle(role)

    vysledek = [{"hrac": i + 1, "data": data} for i, data in enumerate(role)]

    return {
        "hraci": vysledek,
        "kategorie": req.kategorie,
        "tajne_slovo": slovo_civilisty
    }
