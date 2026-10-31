from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

# Rozsáhlá databáze slov a pojmů pro Šarády, Activity a Čelovku (Kdo jsem)
SLOVNIK_SARADY = [
    # ==========================================
    # 1. OSOBNOSTI & CELEBRITY (České i světové)
    # ==========================================
    {"slovo": "Karel Gott", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zlatý slavík, zpěvák"},
    {"slovo": "Jaromír Jágr", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Hokejová legenda, číslo 68"},
    {"slovo": "Petr Čech", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Fotbalový brankář s helmou"},
    {"slovo": "Zdeněk Pohlreich", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Šéfkuchař z Ano, šéfe!"},
    {"slovo": "Leoš Mareš", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Moderátor v kožichu"},
    {"slovo": "Václav Havel", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Prezident, dramatik, Sametová revoluce"},
    {"slovo": "Tomáš Garrigue Masaryk", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "První československý prezident"},
    {"slovo": "Karel IV.", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Otec vlasti, Karlův most"},
    {"slovo": "Jan Hus", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Kazatel, Betlémská kaple, Kostnice"},
    {"slovo": "Jan Ámos Komenský", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Učitel národů, Škola hrou"},
    {"slovo": "Kazma (Kamil Bartošek)", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "One Man Show, pranky a film"},
    {"slovo": "MenT", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Český YouTuber, auta, Minecraft"},
    {"slovo": "Stejk", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Český YouTuber, 20 faktů"},
    {"slovo": "Jiří Bartoška", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Herec, prezident festivalu v Karlových Varech"},
    {"slovo": "Ondřej Vetchý", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Herec, čert Vraník, Četnické humoresky"},
    {"slovo": "Helena Vondráčková", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zpěvačka, Dlouhá noc"},
    {"slovo": "Lucie Bílá", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zpěvačka s mohutným hlasem"},
    {"slovo": "Vojta Dyk", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Zpěvák kapely Nightwork a D.Y.K."},
    {"slovo": "Jiří Mádl", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Herec ze Snowboarďáků, režisér Vln"},
    {"slovo": "Ewa Farna", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zpěvačka, Měls mě vůbec rád"},
    {"slovo": "Eva Samková (Adamczyková)", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Snowboardcrossařka s namalovaným knírkem"},
    {"slovo": "Ester Ledecká", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Dvojnásobná olympijská vítězka (lyže i snowboard)"},
    {"slovo": "Barbora Špotáková", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Světová rekordmanka v hodu oštěpem"},
    {"slovo": "Pavel Nedvěd", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Držitel Zlatého míče, fotbalista"},
    {"slovo": "Bohumil Hrabal", "kategorie": "Osobnosti", "obtiznost": "tezka", "napoveda": "Spisovatel, Ostře sledované vlaky, Postřižiny"},
    {"slovo": "Karel Čapek", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Spisovatel, vymyslel slovo Robot"},
    {"slovo": "Emil Zátopek", "kategorie": "Osobnosti", "obtiznost": "stredni", "napoveda": "Běžec, 'Když nemůžeš, tak přidej'"},
    {"slovo": "Michael Jackson", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Král popu, Moonwalk"},
    {"slovo": "Freddie Mercury", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Frontman skupiny Queen"},
    {"slovo": "Elon Musk", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Tesla, SpaceX, Twitter/X"},
    {"slovo": "Steve Jobs", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zakladatel Apple, černý rolák"},
    {"slovo": "Cristiano Ronaldo", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Fotbalová hvězda, oslava SIUUU"},
    {"slovo": "Lionel Messi", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Argentinský fotbalový génius"},
    {"slovo": "Arnold Schwarzenegger", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Terminátor, kulturista, guvernér"},
    {"slovo": "Leonardo DiCaprio", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Herec z Titanicu a Vlka z Wall Street"},
    {"slovo": "Brad Pitt", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Hollywoodský hezoun a oscarový herec"},
    {"slovo": "Keanu Reeves", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Neo z Matrixu a John Wick"},
    {"slovo": "Taylor Swift", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Světová popová megastar"},
    {"slovo": "Billie Eilish", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zpěvačka s hlubokým hlasem a zelenými vlasy"},
    {"slovo": "Eminem", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Rychlý rapový král, Slim Shady"},
    {"slovo": "Gordon Ramsay", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Zuřící britský šéfkuchař"},
    {"slovo": "Albert Einstein", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Fyzik, teorie relativity, vyplazený jazyk"},
    {"slovo": "Královna Alžběta II.", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Dlouholetá britská panovnice"},
    {"slovo": "Donald Trump", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Bývalý americký prezident, červená kšiltovka"},
    {"slovo": "Mr. Beast", "kategorie": "Osobnosti", "obtiznost": "lehka", "napoveda": "Největší světový YouTuber s miliony dolarů"},

    # ==========================================
    # 2. POSTAVY & POHÁDKY (Filmy, seriály, animáky)
    # ==========================================
    {"slovo": "Harry Potter", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Kouzelník s jizvou na čele"},
    {"slovo": "Lord Voldemort", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Ten, jehož jméno nesmíme vyslovit, bez nosu"},
    {"slovo": "Hermiona Grangerová", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Nejchytřejší čarodějka v Bradavicích"},
    {"slovo": "Shrek", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Zelený zlobr z bažiny"},
    {"slovo": "Oslík (ze Shreka)", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Už tam budem? Kamarád Shreka"},
    {"slovo": "Kapitán Jack Sparrow", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Pirátský kapitán z Černé perly"},
    {"slovo": "Krteček", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Kreslený hrdina s kalhotkami s kapsami"},
    {"slovo": "Pat a Mat", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Dva nešikovní kutilové, 'A je to!'"},
    {"slovo": "Bob a Bobek", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Králici z klobouku kouzelníka Pokustona"},
    {"slovo": "Spejbl a Hurvínek", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Dřevěné loutky, taťulda a syn"},
    {"slovo": "Rákosníček", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Skřítek za mlhou hustou tak, že by se dala krájet"},
    {"slovo": "Trautenberk", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Hamižný pán z Krkonošských pohádek"},
    {"slovo": "Krakonoš", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Pán Krkonoš s fajfkou a holí"},
    {"slovo": "Loupežník Rumcajs", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Bývalý švec z lesa Řáholce"},
    {"slovo": "Večerníček", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Kluk s papírovou čepicí na jednokolce"},
    {"slovo": "Čert Vraník", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "S čerty nejsou žerty, peříčko"},
    {"slovo": "Sherlock Holmes", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Detektiv s dýmkou a lupou"},
    {"slovo": "Darth Vader", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Temný lord ze Star Wars, těžký dech"},
    {"slovo": "Mistr Yoda", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Malý zelený mistr Jedi s ušima"},
    {"slovo": "Gandalf", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Čaroděj z Pána prstenů s holí"},
    {"slovo": "Glum (Smeagol)", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Můj milášek! Pán prstenů"},
    {"slovo": "Spiderman", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Pavoučí hrdina v červeno-modrém"},
    {"slovo": "Batman", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Netopýří ochránce Gotham City"},
    {"slovo": "Joker", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Šílený klaun se zelenými vlasy"},
    {"slovo": "Homer Simpson", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Táta rodiny Simpsonových, koblihy a pivo Duff"},
    {"slovo": "Bart Simpson", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Rošťák na skateboardu, 'Sežer mou křídu!'"},
    {"slovo": "Elsa (Ledové království)", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Ledová princezna, píseň Najednou"},
    {"slovo": "Sněhurka", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Princezna u sedmi trpaslíků s jablkem"},
    {"slovo": "Červená Karkulka", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Holčička s košíkem v lese u vlka"},
    {"slovo": "Pikachu", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Žlutý elektrický Pokémon"},
    {"slovo": "James Bond (007)", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Tajný agent Jejího Veličenstva, martini"},
    {"slovo": "Wednesday Addams", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Dívka v černém s culíky a Věcí (rukou)"},
    {"slovo": "Mimoň (Minion)", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Žlutý tvor v lacláčích milující banány"},
    {"slovo": "Barbie", "kategorie": "Postavy", "obtiznost": "lehka", "napoveda": "Růžová panenka s dokonalým úsměvem"},

    # ==========================================
    # 3. PŘEDMĚTY & VĚCI
    # ==========================================
    {"slovo": "Záchodový zvon", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Nástroj na ucpané WC"},
    {"slovo": "Mikrovlnná trouba", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Rychlý ohřev jídla s pípnutím"},
    {"slovo": "Žehlička na vlasy", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Horké kleště na vyhlazení účesu"},
    {"slovo": "Švýcarský nožík", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Červený kapesní nůž se spoustou nástrojů"},
    {"slovo": "Selfie tyč", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Teleskopická tyč na focení mobilem"},
    {"slovo": "Kolíček na prádlo", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Pružinová svorka na sušák"},
    {"slovo": "Deštník ve vichřici", "kategorie": "Předměty", "obtiznost": "stredni", "napoveda": "Otočený a polámaný větrem"},
    {"slovo": "Dálkový ovladač", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Krabička s tlačítky k televizi"},
    {"slovo": "Hasicí přístroj", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Červená tlaková nádoba s hadicí"},
    {"slovo": "Sekačka na trávu", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Motorový stroj se sběrným košem na louku"},
    {"slovo": "Zubní kartáček", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Ranní a večerní hygiena úst"},
    {"slovo": "Škrabka na brambory", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Kuchyňský pomocník na slupky"},
    {"slovo": "Rychlovarná konvice", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Uvaří vodu na čaj za minutu"},
    {"slovo": "Špunty do uší", "kategorie": "Předměty", "obtiznost": "stredni", "napoveda": "Pěnové zátky proti chrápání"},
    {"slovo": "Nákupní košík", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Vozík na kolečkách v supermarketu"},
    {"slovo": "Plácačka na mouchy", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Mřížkovaný nástroj proti hmyzu"},
    {"slovo": "Rybička (kapesní nožík)", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Tradiční český nožík ve tvaru kapra"},
    {"slovo": "Lepicí páska (duct tape)", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Stříbrná páska, která spraví úplně všechno"},
    {"slovo": "Gramofonová deska", "kategorie": "Předměty", "obtiznost": "stredni", "napoveda": "Černý vinylový kruh s drážkami"},
    {"slovo": "Stanové kolíky", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Kovové háčky zatloukané do země"},
    {"slovo": "Robotický vysavač", "kategorie": "Předměty", "obtiznost": "lehka", "napoveda": "Placka jezdící sama po podlaze"},
    {"slovo": "Sněhové řetězy", "kategorie": "Předměty", "obtiznost": "stredni", "napoveda": "Kovová výbava na kola auta v zimě"},
    {"slovo": "Detektor kovu", "kategorie": "Předměty", "obtiznost": "stredni", "napoveda": "Pípající tyč hledačů pokladů"},

    # ==========================================
    # 4. ZVÍŘATA & PŘÍRODA
    # ==========================================
    {"slovo": "Lenochod na větvi", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Nejpomalejší savec světa"},
    {"slovo": "Tučňák na ledu", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Nelétavý černobílý pták kolébající se na kry"},
    {"slovo": "Chobotnice", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Osm chapadel a inkoustový oblak"},
    {"slovo": "Plameňák na jedné noze", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Růžový pták s dlouhým krkem"},
    {"slovo": "Klokan s mládětem", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Skákající australský vačnatec"},
    {"slovo": "Chameleon měnící barvu", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Ještěr s nezávislýma očima a dlouhým jazykem"},
    {"slovo": "Ježek stočený do klubíčka", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Pichlavý noční lovec žížal"},
    {"slovo": "Žirafa pijící vodu", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Široce rozkročené přední nohy a dlouhý krk"},
    {"slovo": "Páv s roztaženým ocasem", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Pták s nádherným vějířem plným 'očí'"},
    {"slovo": "Křeček s plnými tvářemi", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Hlodavec nacpaný zrním až k prasknutí"},
    {"slovo": "Netopýr visící hlavou dolů", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Noční letec využívající echolokaci"},
    {"slovo": "Kapr na vánočním stole", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Tradiční česká štědrovečerní ryba"},
    {"slovo": "Surikata na stráži", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Stojí vzpřímeně na zadních a hlídá dravce"},
    {"slovo": "Dikobraz vystrkující ostny", "kategorie": "Zvířata", "obtiznost": "stredni", "napoveda": "Obrana plná nebezpečných bodlin"},
    {"slovo": "Mravenec táhnoucí jehličí", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Dělník stavící mraveniště"},
    {"slovo": "Klíště sající krev", "kategorie": "Zvířata", "obtiznost": "stredni", "napoveda": "Nežádoucí táborový parazit z trávy"},
    {"slovo": "Medvěd vybírající včelí úl", "kategorie": "Zvířata", "obtiznost": "lehka", "napoveda": "Huňáč mlsající sladký med"},
    {"slovo": "Kukačka v hodinách", "kategorie": "Zvířata", "obtiznost": "stredni", "napoveda": "Vyskakuje každou celou hodinu z ciferníku"},

    # ==========================================
    # 5. ČINNOSTI & VTIPNÉ SITUACE
    # ==========================================
    {"slovo": "Výměna prázdné ruličky toaleťáku potichu v noci", "kategorie": "Situace & Činnosti", "obtiznost": "stredni", "napoveda": "Snaha nevzbudit celý byt"},
    {"slovo": "Otevírání zavařovačky okurek se zpocenýma rukama", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Víčko drží jako přibité"},
    {"slovo": "Hledání mobilu, který držíš u ucha", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Klasické 'Kde mám sakra telefon?!'"},
    {"slovo": "Zakopnutí na ulici a předstírání, že běžíš", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Záchrana trapné chvilky"},
    {"slovo": "Zkoušení o dvě čísla menších bot", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Zmačkané prsty a křeč v chodidle"},
    {"slovo": "Jízda v přeplněném autobuse bez držení", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Surfing v zatáčkách MHD"},
    {"slovo": "Kradmé ujídání šlehačky přímo ze spreje", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Sladký hřích u otevřené ledničky"},
    {"slovo": "Zpívání ve sprše jako na koncertě v O2 aréně", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Falešný zpěv do hlavice sprchy"},
    {"slovo": "Chytání mouchy holýma rukama", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Marný lov dotěrného hmyzu"},
    {"slovo": "Ztráta plavek při skoku do bazénu", "kategorie": "Situace & Činnosti", "obtiznost": "stredni", "napoveda": "Trapas pod skokanským můstkem"},
    {"slovo": "Probuzení 5 minut po zvonění budíku na zkoušku", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Panika a běh v pyžamu"},
    {"slovo": "Snaha nenápadně si vytáhnout zaříznuté spodní prádlo", "kategorie": "Situace & Činnosti", "obtiznost": "stredni", "napoveda": "Nenápadná gymnastika na veřejnosti"},
    {"slovo": "Loupání horké vařené brambory", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Přehazování horkého bramboru z ruky do ruky"},
    {"slovo": "Marná snaha najít začátek izolepy", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Škrábání nehtem po celém obvodu kotouče"},
    {"slovo": "Foukání do horké polévky, která stejně spálí jazyk", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Nedobrovolná ochutnávka lávy"},
    {"slovo": "Tancování na kluzkém náledí", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Mávání rukama ve vzduchu před pádem na zadek"},
    {"slovo": "Balení dárku těsně před oslavou", "kategorie": "Situace & Činnosti", "obtiznost": "stredni", "napoveda": "Muchlání balicího papíru na poslední chvíli"},
    {"slovo": "Čtení jídelního lístku bez brýlí", "kategorie": "Situace & Činnosti", "obtiznost": "lehka", "napoveda": "Mžourání z dálky s nataženýma rukama"},
    {"slovo": "Stříkání parfému do vzduchu a projití skrz", "kategorie": "Situace & Činnosti", "obtiznost": "stredni", "napoveda": "Elegantní voňavý rituál"},

    # ==========================================
    # 6. TÁBOR & SKAUTING
    # ==========================================
    {"slovo": "Drhnutí připáleného ešusu pískem u potoka", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Tradiční mytí nádobí po táborové večeři"},
    {"slovo": "Noční hlídka v totální bouřce", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Stání u táborového kruhu v pláštěnce s baterkou"},
    {"slovo": "Ranní rozcvička v mokré trávě", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Zívající děti dělající kliky a dřepy"},
    {"slovo": "Krádež táborové vlajky sousedním oddílem", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Noční přepadení a poplach"},
    {"slovo": "Stavba celodřevěné podsady stanu", "kategorie": "Tábor & Skauting", "obtiznost": "stredni", "napoveda": "Zatloukání hřebíků, šroubování prken na louce"},
    {"slovo": "Zapomenutá pláštěnka na celodenním výletě", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Mokrý batoh a promočené boty"},
    {"slovo": "Zpívání písně Stánky u dohasínajícího ohně", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Kytara, jiskry létající do tmy, Nedvědi"},
    {"slovo": "Hledání suchého dřeva po celodenním dešti", "kategorie": "Tábor & Skauting", "obtiznost": "stredni", "napoveda": "Pod smrkovými větvemi s mačetou"},
    {"slovo": "Ztracená teniska vytažená z hluboké bažiny", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Černé bahno a ponožka bez boty"},
    {"slovo": "Tajné pojídání sušenek po večerce ve spacáku", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Šustění obalem a drobečky všude"},
    {"slovo": "Čištění táborové kadibudky za trest", "kategorie": "Tábor & Skauting", "obtiznost": "stredni", "napoveda": "Vápno, koště a zadržený dech"},
    {"slovo": "Stezka odvahy bez baterky", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Noční les plný svíček a strašidel"},
    {"slovo": "Nástup v plné polní s kontrolou pořádku ve stanech", "kategorie": "Tábor & Skauting", "obtiznost": "stredni", "napoveda": "Bodování čistoty, bodovací tabulka"},
    {"slovo": "Zatoulaný vedoucí v lese při orientačním běhu", "kategorie": "Tábor & Skauting", "obtiznost": "stredni", "napoveda": "Mapa naruby a buzola v kapse"},
    {"slovo": "Vaření čaje v obřím padesátilitrovém kotli", "kategorie": "Tábor & Skauting", "obtiznost": "lehka", "napoveda": "Kouř v očích a dřevěná vařečka velká jak pádlo"},

    # ==========================================
    # 7. FILMY, SERIÁLY & SCÉNY
    # ==========================================
    {"slovo": "Pelíšky (Kde udělali soudruzi z NDR chybu?)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Plastové lžičky a káva"},
    {"slovo": "Titanic (Scéna 'Já letím' na přídi lodi)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Jack a Rose s roztaženýma rukama"},
    {"slovo": "S čerty nejsou žerty (Spadlo ti to, asi vítr Máchale)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Čertovská vojna a šavle"},
    {"slovo": "Slunce, seno, jahody (Fackovací scéna)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Škopková křičící na dvoře v Hošticích"},
    {"slovo": "Matrix (Zpomalené uhýbání kulkám v záklonu)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Neo na střeše v černém plášti"},
    {"slovo": "Lví král (Zvedání lvíčete Simby nad skálu)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Opice Rafiki představuje budoucího krále"},
    {"slovo": "Star Wars (Luke, já jsem tvůj otec)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Odhalení rodinného tajemství se světelným mečem"},
    {"slovo": "Forrest Gump (Běh přes celou Ameriku)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Utíkej, Forreste, utíkej!"},
    {"slovo": "Jurský park (T-Rex útočící na džíp v dešti)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Voda v kelímku se chvěje"},
    {"slovo": "Pulp Fiction (Taneční scéna Johna Travolty)", "kategorie": "Filmy & Scény", "obtiznost": "stredni", "napoveda": "Dva prsty přes oči v twistu"},
    {"slovo": "Tři oříšky pro Popelku (Střelba kuší na dravce)", "kategorie": "Filmy & Scény", "obtiznost": "lehka", "napoveda": "Kampak, panáčku? Šaty z oříšku"},
    {"slovo": "Hvězdná brána (Průchod červí dírou)", "kategorie": "Filmy & Scény", "obtiznost": "stredni", "napoveda": "Kruhový portál s tekoucí vodní hladinou"},

    # ==========================================
    # 8. ABSTRAKCE & TĚŽKÉ POJMY (Pro mistry Activity)
    # ==========================================
    {"slovo": "Prokrastinace", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Neustálé odkládání důležitých úkolů na zítra"},
    {"slovo": "Trapné ticho", "kategorie": "Abstrakce & Pojmy", "obtiznost": "stredni", "napoveda": "Okamžik, kdy nikdo neví, co říct, a všichni koukají do země"},
    {"slovo": "Deja vu", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Pocit, že už jsi přesně tuhle situaci jednou zažil"},
    {"slovo": "Nostalgie", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Stesk po starých dobrých časech a vzpomínkách"},
    {"slovo": "Zlomené srdce", "kategorie": "Abstrakce & Pojmy", "obtiznost": "lehka", "napoveda": "Zklamání v lásce a smutek po rozchodu"},
    {"slovo": "Syndrom vyhoření", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Naprosté psychické vyčerpání z práce"},
    {"slovo": "Falešný tón", "kategorie": "Abstrakce & Pojmy", "obtiznost": "stredni", "napoveda": "Když zpěvák ujede a tahá to za uši"},
    {"slovo": "Umělá inteligence", "kategorie": "Abstrakce & Pojmy", "obtiznost": "stredni", "napoveda": "Myslící stroje, neuronové sítě a roboti"},
    {"slovo": "Zemětřesení", "kategorie": "Abstrakce & Pojmy", "obtiznost": "lehka", "napoveda": "Pukání půdy a otřesy litosférických desek"},
    {"slovo": "Sluneční erupce", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Výbuch plazmy z povrchu hvězdy do vesmíru"},
    {"slovo": "Gravitace", "kategorie": "Abstrakce & Pojmy", "obtiznost": "stredni", "napoveda": "Síla, díky které nám jablka padají k zemi"},
    {"slovo": "Hladomor", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Nedostatek potravin v celé zemi"},
    {"slovo": "Pavučina lží", "kategorie": "Abstrakce & Pojmy", "obtiznost": "tezka", "napoveda": "Zamotaný podvod, ze kterého není úniku"},
    {"slovo": "Tajemství", "kategorie": "Abstrakce & Pojmy", "obtiznost": "lehka", "napoveda": "Něco, co ví jen dva lidé a nikdo jiný to nesmí slyšet"},
    {"slovo": "Pondělní ráno", "kategorie": "Abstrakce & Pojmy", "obtiznost": "lehka", "napoveda": "Nejhorší okamžik týdne po víkendu"}
]

# Modely pro požadavky
class LosovatRequest(BaseModel):
    kategorie: Optional[List[str]] = None
    obtiznost: Optional[str] = "vse" # "lehka" | "stredni" | "tezka" | "vse"
    rezim: Optional[str] = "activity" # "activity" | "kdo_jsem"
    metoda: Optional[str] = "nahodna" # "nahodna" | "popis" | "pantomima" | "kresleni"
    vyloucena_slova: Optional[List[str]] = []
    vlastni_slova: Optional[List[dict]] = []

class PridatSlovoRequest(BaseModel):
    slovo: str
    kategorie: str = "Vlastní"
    napoveda: Optional[str] = ""
    obtiznost: str = "stredni"

@router.get("/charades/kategorie")
def get_categories():
    """Vrátí seznam všech kategorií a počet slov v každé z nich."""
    kat_counts = {}
    for polozka in SLOVNIK_SARADY:
        kat = polozka["kategorie"]
        kat_counts[kat] = kat_counts.get(kat, 0) + 1
        
    return {
        "kategorie": [
            {"nazev": kat, "pocet": pocet} 
            for kat, pocet in kat_counts.items()
        ],
        "celkem_slov": len(SLOVNIK_SARADY)
    }

@router.post("/charades/losovat")
def losovat_slovo(req: LosovatRequest):
    """
    Vylosuje slovo podle zvolených filtrů a přiřadí metodu předvedení.
    """
    vsechna = list(SLOVNIK_SARADY)
    
    # Přidat vlastní slova uživatele, pokud existují
    if req.vlastni_slova:
        for vs in req.vlastni_slova:
            if isinstance(vs, dict) and "slovo" in vs:
                vsechna.append({
                    "slovo": vs.get("slovo", ""),
                    "kategorie": vs.get("kategorie", "Vlastní"),
                    "obtiznost": vs.get("obtiznost", "stredni"),
                    "napoveda": vs.get("napoveda", "Vlastní vložené slovo")
                })

    # Filtrování podle kategorií
    if req.kategorie and len(req.kategorie) > 0:
        vsechna = [s for s in vsechna if s["kategorie"] in req.kategorie]

    # Filtrování podle obtížnosti
    if req.obtiznost and req.obtiznost != "vse":
        vsechna = [s for s in vsechna if s["obtiznost"] == req.obtiznost]

    # Vyloučení již odehraných slov v tomto kole
    if req.vyloucena_slova:
        dostupna = [s for s in vsechna if s["slovo"] not in req.vyloucena_slova]
        if not dostupna:
            # Pokud už byla vyčerpána všechna, resetujeme vyloučení
            dostupna = vsechna
    else:
        dostupna = vsechna

    if not dostupna:
        return {
            "uspech": False,
            "zprava": "Pro zadané filtry nebylo nalezeno žádné slovo."
        }

    vybrane = random.choice(dostupna)

    # Určení metody předvedení
    metody_seznam = [
        {
            "id": "popis",
            "nazev": "Slovní popis",
            "ikona": "MessageSquare",
            "pravidlo": "Vysvětli slovo vlastními slovy. Nesmíš použít kořen slova, cizí překlad ani rýmy!"
        },
        {
            "id": "pantomima",
            "nazev": "Pantomima",
            "ikona": "Drama",
            "pravidlo": "Předveď tělem a gesty. Přísný zákaz mluvení, zvuků a ukazování na předměty v místnosti!"
        },
        {
            "id": "kresleni",
            "nazev": "Kreslení",
            "ikona": "PenTool",
            "pravidlo": "Nakresli na papír nebo tabuli. Žádná písmena, číslice, mluvení ani gestikulace!"
        }
    ]

    if req.rezim == "kdo_jsem":
        metoda_obj = {
            "id": "kdo_jsem",
            "nazev": "Kdo jsem? (Čelovka)",
            "ikona": "HelpCircle",
            "pravidlo": "Hráč má slovo na obrazovce / na čele. Klade otázky, ostatní odpovídají pouze ANO nebo NE!"
        }
    elif req.metoda and req.metoda != "nahodna":
        metoda_obj = next((m for m in metody_seznam if m["id"] == req.metoda), metody_seznam[0])
    else:
        metoda_obj = random.choice(metody_seznam)

    return {
        "uspech": True,
        "slovo": vybrane["slovo"],
        "kategorie": vybrane["kategorie"],
        "obtiznost": vybrane["obtiznost"],
        "napoveda": vybrane.get("napoveda", ""),
        "metoda": metoda_obj,
        "zbyva_v_balicku": len(dostupna) - 1
    }

@router.get("/charades/vsechna-slova")
def get_all_words():
    """Vrátí kompletní databázi slov pro offline / klientské fungování."""
    return {
        "slova": SLOVNIK_SARADY,
        "celkem": len(SLOVNIK_SARADY)
    }
