import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Drama,
  MessageSquare,
  PenTool,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Check,
  SkipForward,
  Trophy,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  Settings,
  Flame,
  Info
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Výchozí databáze pro okamžité offline použití i jako záloha pro táborové WiFi
const VYCHOZI_SLOVA = [
  // 1. Osobnosti
  { slovo: 'Karel Gott', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zlatý slavík, zpěvák' },
  { slovo: 'Jaromír Jágr', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Hokejová legenda, číslo 68' },
  { slovo: 'Petr Čech', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Fotbalový brankář s helmou' },
  { slovo: 'Zdeněk Pohlreich', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Šéfkuchař z Ano, šéfe!' },
  { slovo: 'Leoš Mareš', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Moderátor v kožichu' },
  { slovo: 'Václav Havel', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Prezident, dramatik, Sametová revoluce' },
  { slovo: 'Tomáš Garrigue Masaryk', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'První československý prezident' },
  { slovo: 'Karel IV.', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Otec vlasti, Karlův most' },
  { slovo: 'Jan Hus', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Kazatel, Betlémská kaple, Kostnice' },
  { slovo: 'Jan Ámos Komenský', kategorie: 'Osobnosti', obtiznost: 'stredni', napoveda: 'Učitel národů, Škola hrou' },
  { slovo: 'Kazma (Kamil Bartošek)', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'One Man Show, film a pranky' },
  { slovo: 'MenT', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Český YouTuber, auta, Minecraft' },
  { slovo: 'Stejk', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Český YouTuber, 20 faktů' },
  { slovo: 'Ondřej Vetchý', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Herec, čert Vraník, Četnické humoresky' },
  { slovo: 'Helena Vondráčková', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zpěvačka, Dlouhá noc' },
  { slovo: 'Lucie Bílá', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zpěvačka s mohutným hlasem' },
  { slovo: 'Ewa Farna', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zpěvačka, Měls mě vůbec rád' },
  { slovo: 'Eva Samková', kategorie: 'Osobnosti', obtiznost: 'stredni', napoveda: 'Snowboardistka s namalovaným knírkem' },
  { slovo: 'Ester Ledecká', kategorie: 'Osobnosti', obtiznost: 'stredni', napoveda: 'Olympijská vítězka (lyže i snowboard)' },
  { slovo: 'Barbora Špotáková', kategorie: 'Osobnosti', obtiznost: 'stredni', napoveda: 'Světová rekordmanka v oštěpu' },
  { slovo: 'Michael Jackson', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Král popu, Moonwalk' },
  { slovo: 'Freddie Mercury', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Frontman skupiny Queen' },
  { slovo: 'Elon Musk', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Tesla, SpaceX, Twitter/X' },
  { slovo: 'Steve Jobs', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zakladatel Apple, černý rolák' },
  { slovo: 'Cristiano Ronaldo', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Fotbalová megastar, SIUUU' },
  { slovo: 'Lionel Messi', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Argentinský mistr světa' },
  { slovo: 'Arnold Schwarzenegger', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Terminátor, kulturista' },
  { slovo: 'Leonardo DiCaprio', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Titanic, Vlk z Wall Street' },
  { slovo: 'Keanu Reeves', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Matrix (Neo), John Wick' },
  { slovo: 'Albert Einstein', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Geniální fyzik, vyplazený jazyk' },
  { slovo: 'Královna Alžběta II.', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Britská panovnice' },
  { slovo: 'Gordon Ramsay', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Zuřící britský šéfkuchař' },
  { slovo: 'Mr. Beast', kategorie: 'Osobnosti', obtiznost: 'lehka', napoveda: 'Největší světový YouTuber' },

  // 2. Postavy
  { slovo: 'Harry Potter', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Kouzelník s bleskem na čele' },
  { slovo: 'Lord Voldemort', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Ten, jehož jméno nesmíme vyslovit' },
  { slovo: 'Hermiona Grangerová', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Všeználkovská čarodějka z Nebelvíru' },
  { slovo: 'Shrek', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Zelený zlobr milující svou bažinu' },
  { slovo: 'Oslík ze Shreka', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Už tam budem? Mluvící zvíře' },
  { slovo: 'Jack Sparrow', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Pirátský kapitán z Černé perly' },
  { slovo: 'Krteček', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Postavička s modrými kalhotkami' },
  { slovo: 'Pat a Mat', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Nešikovní kutilové, A je to!' },
  { slovo: 'Bob a Bobek', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Králici z kouzelnického klobouku' },
  { slovo: 'Spejbl a Hurvínek', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Dřevěné loutky, chraplavý taťulda' },
  { slovo: 'Trautenberk', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Pán z Krkonošských pohádek' },
  { slovo: 'Krakonoš', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Strážce hor s dýmkou a holí' },
  { slovo: 'Večerníček', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Kluk s papírovou čepicí na jednokolce' },
  { slovo: 'Darth Vader', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Temný lord ze Star Wars, těžký dech' },
  { slovo: 'Mistr Yoda', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Malý zelený mistr Jedi s ušima' },
  { slovo: 'Glum (Smeagol)', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Můj milášek! Pán prstenů' },
  { slovo: 'Spiderman', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Pavoučí hrdina vrhající sítě' },
  { slovo: 'Batman', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Netopýří muž z Gotham City' },
  { slovo: 'Joker', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Šílený zelenovlasý klaun' },
  { slovo: 'Homer Simpson', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Táta rodiny Simpsonových, koblihy' },
  { slovo: 'Elsa (Ledové království)', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Ledová princezna, píseň Najednou' },
  { slovo: 'Červená Karkulka', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Dívka s košíkem v lese u vlka' },
  { slovo: 'Pikachu', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Žlutý elektrický Pokémon' },
  { slovo: 'Wednesday Addams', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Dívka v černém s kamennou tváří' },
  { slovo: 'Mimoni', kategorie: 'Postavy', obtiznost: 'lehka', napoveda: 'Žlutí tvorové v montérkách, banana!' },

  // 3. Předměty
  { slovo: 'Záchodový zvon', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Gumový nástroj na ucpaný odpad' },
  { slovo: 'Mikrovlnka', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Rychlý ohřev jídla s cinknutím' },
  { slovo: 'Žehlička na vlasy', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Kleště na narovnání účesu' },
  { slovo: 'Rybička (kapesní nůž)', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Český plechový nožík' },
  { slovo: 'Selfie tyč', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Teleskopický držák mobilu' },
  { slovo: 'Kolíček na prádlo', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Dřevěná nebo plastová svorka' },
  { slovo: 'Deštník ve vichřici', kategorie: 'Předměty', obtiznost: 'stredni', napoveda: 'Převrácený naruby silným větrem' },
  { slovo: 'Dálkový ovladač', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Ztrácí se pod gaučem' },
  { slovo: 'Hasicí přístroj', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Červená tlaková nádoba s pěnou' },
  { slovo: 'Sekačka na trávu', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Rachotící stroj na zahradu' },
  { slovo: 'Zubní kartáček', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Každodenní čištění chrupu' },
  { slovo: 'Plácačka na mouchy', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Mřížka na dlouhé rukojeti' },
  { slovo: 'Robotický vysavač', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Jezdící kotouč uklízející podlahu' },
  { slovo: 'Gramofon', kategorie: 'Předměty', obtiznost: 'stredni', napoveda: 'Přehrávač vinylových desek s jehlou' },
  { slovo: 'Stanové kolíky', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Kovové jehly na upevnění šňůr' },
  { slovo: 'Švýcarský nožík', kategorie: 'Předměty', obtiznost: 'lehka', napoveda: 'Kapesní nůž se spoustou nástrojů' },

  // 4. Zvířata
  { slovo: 'Lenochod na větvi', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Nejpomalejší spící zvíře' },
  { slovo: 'Tučňák na ledu', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Kolébající se černobílý nelétavý pták' },
  { slovo: 'Chobotnice', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Osm přísavek a inkoust' },
  { slovo: 'Plameňák na jedné noze', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Růžový elegán v mělké vodě' },
  { slovo: 'Klokan s mládětem', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Skákající zvíře s kapsou na břiše' },
  { slovo: 'Chameleon měnící barvu', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Maskovací mistr s očima na všechny strany' },
  { slovo: 'Ježek v klubíčku', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Pichlavý tvor s jablíčkem na zádech' },
  { slovo: 'Žirafa pijící vodu', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Široce rozkročené nohy a předlouhý krk' },
  { slovo: 'Páv s roztaženým ocasem', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Nádherný vějíř plný vzorů' },
  { slovo: 'Křeček s plnými tvářemi', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Nacpané lícní torby zrním' },
  { slovo: 'Netopýr visící hlavou dolů', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Spí ve dne v jeskyni' },
  { slovo: 'Surikata na stráži', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Stojí na zadních a rozhlíží se' },
  { slovo: 'Mravenec táhnoucí jehličí', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Dělník stavící obří hromadu' },
  { slovo: 'Medvěd vybírající včelí úl', kategorie: 'Zvířata', obtiznost: 'lehka', napoveda: 'Mlsoun u sladkého medu' },

  // 5. Situace & Činnosti
  { slovo: 'Výměna toaleťáku potichu v noci', kategorie: 'Situace & Činnosti', obtiznost: 'stredni', napoveda: 'Nesmíš vzbudit zbytek domu' },
  { slovo: 'Otevírání zavařovačky se zpocenýma rukama', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Víčko nepovolí ani o milimetr' },
  { slovo: 'Hledání mobilu, kterým zrovna telefonuješ', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Kde mám sakra ten telefon?!' },
  { slovo: 'Zakopnutí a dělání, že jsi začal běžet', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Záchrana trapasu před lidmi' },
  { slovo: 'Zkoušení o dvě čísla menších bot', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Zmačkané prsty v obchodě' },
  { slovo: 'Jízda v přeplněném autobuse bez držení', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Udržování rovnováhy v zatáčkách' },
  { slovo: 'Ujídání šlehačky přímo ze spreje', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Tajné mlsání před ledničkou' },
  { slovo: 'Zpívání ve sprše do hlavice jako na koncertě', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Falešný rockový koncert' },
  { slovo: 'Chytání otravné mouchy holýma rukama', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Máchání rukama v prázdnu' },
  { slovo: 'Ztráta plavek při skoku do bazénu', kategorie: 'Situace & Činnosti', obtiznost: 'stredni', napoveda: 'Ponoření a rychlé hledání pod hladinou' },
  { slovo: 'Probuzení pět minut po začátku školy', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Šok, panika a běh z postele' },
  { slovo: 'Loupání horké vařené brambory', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Přehazování žhavého kousku v dlaních' },
  { slovo: 'Marná snaha najít začátek izolepy', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Škrábání nehtem dokola' },
  { slovo: 'Foukání do polévky, která tě stejně spálí', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Ochutnávka vařící vody' },
  { slovo: 'Tanec na nebezpečném náledí', kategorie: 'Situace & Činnosti', obtiznost: 'lehka', napoveda: 'Klouzání s divokým máváním paží' },

  // 6. Tábor & Skauting
  { slovo: 'Drhnutí připáleného ešusu pískem u potoka', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Mytí nádobí po táborové večeři' },
  { slovo: 'Noční hlídka v silné bouřce', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Hlídání tábora v promočené pláštěnce' },
  { slovo: 'Ranní rozcvička v mokré trávě', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Kliky a běh za chladného rána' },
  { slovo: 'Krádež táborové vlajky cizím oddílem', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Přepadení stožáru a poplach' },
  { slovo: 'Stavba podsady stanu na čas', kategorie: 'Tábor & Skauting', obtiznost: 'stredni', napoveda: 'Zatloukání hřebíků a prkna' },
  { slovo: 'Zapomenutá pláštěnka na celodenním výletě', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Prudký liják uprostřed lesa' },
  { slovo: 'Zpívání Stánků u táboráku', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Kytara u plápolajícího ohně' },
  { slovo: 'Hledání suchého dřeva po celodenním dešti', kategorie: 'Tábor & Skauting', obtiznost: 'stredni', napoveda: 'Mokrý les a řezání smrku' },
  { slovo: 'Ztracená bota v hluboké bažině', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Černé bláto a vytažená bosa noha' },
  { slovo: 'Tajné mlsání sušenek po večerce ve spacáku', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Šustění obalem potmě' },
  { slovo: 'Čištění táborové latríny za trest', kategorie: 'Tábor & Skauting', obtiznost: 'stredni', napoveda: 'Vápno, koště a ucpaný nos' },
  { slovo: 'Stezka odvahy bez baterky', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Svíčky v temném lese' },
  { slovo: 'Vaření čaje v obřím padesátilitrovém kotli', kategorie: 'Tábor & Skauting', obtiznost: 'lehka', napoveda: 'Míchání obří vařečkou v kouři' },

  // 7. Filmy & Scény
  { slovo: 'Pelíšky (Kde udělali soudruzi z NDR chybu?)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Rozteklé plastové lžičky v kávě' },
  { slovo: 'Titanic (Já letím na přídi lodi)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Jack a Rose s rozpaženýma rukama' },
  { slovo: 'S čerty nejsou žerty (Spadlo ti to, asi vítr Máchale)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Čertovská šavle na zemi' },
  { slovo: 'Slunce, seno (Fackovací scéna na dvoře)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Křik a facky v Hošticích' },
  { slovo: 'Matrix (Zpomalené uhýbání kulkám v záklonu)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Neo na střeše v černém plášti' },
  { slovo: 'Lví král (Zvedání lvíčka Simby nad skálu)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Opice ukazuje budoucího krále zvířatům' },
  { slovo: 'Star Wars (Luke, já jsem tvůj otec)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Odhalení rodinného tajemství se světelným mečem' },
  { slovo: 'Forrest Gump (Běh přes celou Ameriku)', kategorie: 'Filmy & Scény', obtiznost: 'lehka', napoveda: 'Utíkej, Forreste, utíkej!' },
  { slovo: 'Pulp Fiction (Taneční scéna s prsty u očí)', kategorie: 'Filmy & Scény', obtiznost: 'stredni', napoveda: 'John Travolta a Uma Thurman v twistu' },

  // 8. Abstrakce & Pojmy
  { slovo: 'Prokrastinace', kategorie: 'Abstrakce & Pojmy', obtiznost: 'tezka', napoveda: 'Odkládání povinností na zítřek' },
  { slovo: 'Trapné ticho', kategorie: 'Abstrakce & Pojmy', obtiznost: 'stredni', napoveda: 'Nikdo nemluví a všichni koukají do země' },
  { slovo: 'Deja vu', kategorie: 'Abstrakce & Pojmy', obtiznost: 'tezka', napoveda: 'Pocit, že už jsi tuto chvíli zažil' },
  { slovo: 'Nostalgie', kategorie: 'Abstrakce & Pojmy', obtiznost: 'tezka', napoveda: 'Vzpomínání na staré dobré časy' },
  { slovo: 'Zlomené srdce', kategorie: 'Abstrakce & Pojmy', obtiznost: 'lehka', napoveda: 'Smutek po nešťastném rozchodu' },
  { slovo: 'Syndrom vyhoření', kategorie: 'Abstrakce & Pojmy', obtiznost: 'tezka', napoveda: 'Totální psychické vyčerpání' },
  { slovo: 'Falešný tón', kategorie: 'Abstrakce & Pojmy', obtiznost: 'stredni', napoveda: 'Když zpěvák ujede a rve to uši' },
  { slovo: 'Umělá inteligence', kategorie: 'Abstrakce & Pojmy', obtiznost: 'stredni', napoveda: 'Roboti, algoritmy a chatboti' },
  { slovo: 'Gravitace', kategorie: 'Abstrakce & Pojmy', obtiznost: 'stredni', napoveda: 'Zemská přitažlivost táhnoucí k zemi' },
  { slovo: 'Pondělní ráno', kategorie: 'Abstrakce & Pojmy', obtiznost: 'lehka', napoveda: 'Nejhorší budíček týdne po víkendu' }
]

const VSECHNY_KATEGORIE = [
  'Osobnosti',
  'Postavy',
  'Předměty',
  'Zvířata',
  'Situace & Činnosti',
  'Tábor & Skauting',
  'Filmy & Scény',
  'Abstrakce & Pojmy'
]

const METODY_ACTIVITY = [
  {
    id: 'popis',
    nazev: 'Slovní popis',
    ikona: MessageSquare,
    popis: 'Vysvětli slovo vlastními slovy. Nesmíš použít kořen slova, cizojazyčný překlad ani rýmy!'
  },
  {
    id: 'pantomima',
    nazev: 'Pantomima',
    ikona: Drama,
    popis: 'Předveď tělem a gesty. Přísný zákaz mluvení, citoslovcí a ukazování na předměty!'
  },
  {
    id: 'kresleni',
    nazev: 'Kreslení',
    ikona: PenTool,
    popis: 'Nakresli na tabuli nebo papír. Žádná písmena, číslice, mluvení ani gesta rukama!'
  }
]

export default function CharadesGame() {
  // Režim hry
  const [rezimHry, setRezimHry] = useState('activity') // 'activity' | 'kdo_jsem'
  const [vybranaMetodaActivity, setVybranaMetodaActivity] = useState('nahodna') // 'nahodna' | 'popis' | 'pantomima' | 'kresleni'
  
  // Filtry
  const [vybraneKategorie, setVybraneKategorie] = useState(VSECHNY_KATEGORIE)
  const [obtiznost, setObtiznost] = useState('vse') // 'lehka' | 'stredni' | 'tezka' | 'vse'
  
  // Vlastní slova
  const [vlastniSlova, setVlastniSlova] = useState(() => {
    try {
      const ulozene = localStorage.getItem('yled_charades_custom')
      return ulozene ? JSON.parse(ulozene) : []
    } catch {
      return []
    }
  })
  const [zahrnoutVlastni, setZahrnoutVlastni] = useState(true)
  const [noveVlastniSlovo, setNoveVlastniSlovo] = useState('')
  const [novaNapoveda, setNovaNapoveda] = useState('')
  const [otevrenoNastaveni, setOtevrenoNastaveni] = useState(false)
  const [otevrenaNapovedaPravidel, setOtevrenaNapovedaPravidel] = useState(false)

  // Herní stav
  const [aktualniKarta, setAktualniKarta] = useState(null)
  const [kartaSkryta, setKartaSkryta] = useState(false) // Pro čelovku (krytí karty)
  const [ukazatNapovedu, setUkazatNapovedu] = useState(false)
  const [odehranaSlova, setOdehranaSlova] = useState([])
  const [kolaHistorie, setKolaHistorie] = useState([]) // Slova v aktuálním tahu

  // Týmy a bodování
  const [typBodovani, setTypBodovani] = useState('tymy') // 'tymy' | 'volna_hra'
  const [tymy, setTymy] = useState([
    { id: 1, nazev: 'Tým Modří', body: 0, barva: '#3b82f6' },
    { id: 2, nazev: 'Tým Červení', body: 0, barva: '#ef4444' }
  ])
  const [aktivniTymIndex, setAktivniTymIndex] = useState(0)
  const [ciloveBody, setCiloveBody] = useState(15) // 0 = neomezeně
  const [vitez, setVitez] = useState(null)

  // Časovač
  const [delkaKola, setDelkaKola] = useState(60) // v sekundách (0 = neomezeno)
  const [zbyvajiciCas, setZbyvajiciCas] = useState(60)
  const [casovacBezi, setCasovacBezi] = useState(false)
  const [casVyprsel, setCasVyprsel] = useState(false)

  // Zvuk a Fullscreen
  const [zvukPovolen, setZvukPovolen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const audioCtxRef = useRef(null)

  // Zvukový syntetizér pro Web Audio API
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const prehrajZvuk = (typ) => {
    if (!zvukPovolen) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      if (typ === 'uhodnuto') {
        // Veselý vítězný dvoutón (C6 -> G6)
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.type = 'triangle'
        osc2.type = 'sine'

        osc1.frequency.setValueAtTime(523.25, now) // C5
        osc1.frequency.setValueAtTime(1046.5, now + 0.08) // C6
        osc2.frequency.setValueAtTime(659.25, now) // E5
        osc2.frequency.setValueAtTime(1318.5, now + 0.08) // E6

        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)

        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.35)
        osc2.stop(now + 0.35)
      } else if (typ === 'preskocit') {
        // Hlubší krátký tón pro přeskočení
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(260, now)
        osc.frequency.linearRampToValueAtTime(180, now + 0.1)

        gain.gain.setValueAtTime(0.2, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.1)
      } else if (typ === 'tik') {
        // Jemné tiknutí hodin
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1200, now)

        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.03)
      } else if (typ === 'urgent') {
        // Varovné tikání v posledních 10 sekundách
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(880, now)

        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.06)
      } else if (typ === 'konec') {
        // Zvuk sirény / gongu při vypršení času
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.8)

        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.8)
      }
    } catch {}
  }

  // Uložení vlastních slov do localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yled_charades_custom', JSON.stringify(vlastniSlova))
    } catch {}
  }, [vlastniSlova])

  // Časovač odpočítávání
  useEffect(() => {
    if (casovacBezi && delkaKola > 0) {
      timerIntervalRef.current = setInterval(() => {
        setZbyvajiciCas((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            setCasovacBezi(false)
            setCasVyprsel(true)
            prehrajZvuk('konec')
            return 0
          }
          if (prev <= 10) {
            prehrajZvuk('urgent')
          } else {
            prehrajZvuk('tik')
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [casovacBezi, delkaKola])

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Losování nového slova
  const losovatDalsiSlovo = useCallback(() => {
    setUkazatNapovedu(false)
    setCasVyprsel(false)

    // Příprava fondu slov
    let fond = [...VYCHOZI_SLOVA]

    if (zahrnoutVlastni && vlastniSlova.length > 0) {
      fond = [...fond, ...vlastniSlova]
    }

    // Filtrování podle vybraných kategorií
    if (vybraneKategorie.length > 0) {
      fond = fond.filter((s) => vybraneKategorie.includes(s.kategorie) || s.kategorie === 'Vlastní')
    }

    // Filtrování podle obtížnosti
    if (obtiznost !== 'vse') {
      fond = fond.filter((s) => s.obtiznost === obtiznost)
    }

    // Vyloučení již odehraných
    let dostupna = fond.filter((s) => !odehranaSlova.includes(s.slovo))
    if (dostupna.length === 0) {
      // Pokud dojdou, resetujeme historii odehraných
      dostupna = fond
      setOdehranaSlova([])
    }

    if (dostupna.length === 0) {
      alert('Pro zvolené filtry nejsou k dispozici žádná slova! Upravte nastavení filtrů.')
      return
    }

    const vybrane = dostupna[Math.floor(Math.random() * dostupna.length)]
    setOdehranaSlova((prev) => [...prev, vybrane.slovo])

    // Volba metody
    let metodaObj
    if (rezimHry === 'kdo_jsem') {
      metodaObj = {
        id: 'kdo_jsem',
        nazev: 'Kdo jsem? (Čelovka)',
        ikona: HelpCircle,
        popis: 'Hráč má kartu na čele/nevidí ji. Pokládá otázky a ostatní odpovídají pouze ANO nebo NE!'
      }
    } else if (vybranaMetodaActivity !== 'nahodna') {
      metodaObj = METODY_ACTIVITY.find((m) => m.id === vybranaMetodaActivity) || METODY_ACTIVITY[0]
    } else {
      metodaObj = METODY_ACTIVITY[Math.floor(Math.random() * METODY_ACTIVITY.length)]
    }

    setAktualniKarta({
      ...vybrane,
      metoda: metodaObj
    })
  }, [rezimHry, vybranaMetodaActivity, vybraneKategorie, obtiznost, vlastniSlova, zahrnoutVlastni, odehranaSlova])

  // První spuštění: vylosovat kartu
  useEffect(() => {
    if (!aktualniKarta) {
      losovatDalsiSlovo()
    }
  }, [aktualniKarta, losovatDalsiSlovo])

  // Spuštění nového tahu / restart časovače
  const spustitTah = () => {
    setZbyvajiciCas(delkaKola)
    setCasVyprsel(false)
    setCasovacBezi(true)
    losovatDalsiSlovo()
  }

  const prepnoutPauzu = () => {
    if (casVyprsel) {
      spustitTah()
    } else {
      setCasovacBezi(!casovacBezi)
    }
  }

  const restartovatCas = () => {
    setCasovacBezi(false)
    setZbyvajiciCas(delkaKola)
    setCasVyprsel(false)
  }

  // Uhodnuto!
  const oznacitUhodnuto = () => {
    if (!aktualniKarta) return
    prehrajZvuk('uhodnuto')

    // Přičtení bodu týmu
    if (typBodovani === 'tymy') {
      setTymy((prev) => {
        const upravene = [...prev]
        const akt = { ...upravene[aktivniTymIndex] }
        akt.body += 1
        upravene[aktivniTymIndex] = akt

        // Kontrola vítězství
        if (ciloveBody > 0 && akt.body >= ciloveBody && !vitez) {
          setVitez(akt)
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          })
        }
        return upravene
      })
    }

    // Záznam do kola
    setKolaHistorie((prev) => [{ slovo: aktualniKarta.slovo, uspech: true, metoda: aktualniKarta.metoda?.nazev }, ...prev])

    // Další slovo
    losovatDalsiSlovo()
  }

  // Přeskočit
  const preskocitSlovo = () => {
    if (!aktualniKarta) return
    prehrajZvuk('preskocit')

    setKolaHistorie((prev) => [{ slovo: aktualniKarta.slovo, uspech: false, metoda: aktualniKarta.metoda?.nazev }, ...prev])
    losovatDalsiSlovo()
  }

  // Přepnutí týmu
  const prepnoutTym = () => {
    const dalsiIndex = (aktivniTymIndex + 1) % tymy.length
    setAktivniTymIndex(dalsiIndex)
    restartovatCas()
    setKolaHistorie([])
    losovatDalsiSlovo()
  }

  // Klávesové zkratky
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Pokud uživatel píše do inputu, zkratky ignorovat
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        prepnoutPauzu()
      } else if (e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault()
        oznacitUhodnuto()
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault()
        preskocitSlovo()
      } else if (e.code === 'KeyF') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [casovacBezi, casVyprsel, aktualniKarta, aktivniTymIndex, tymy, typBodovani, ciloveBody, vitez])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  // Přidání vlastního slova
  const handlePridatVlastni = (e) => {
    e.preventDefault()
    if (!noveVlastniSlovo.trim()) return

    const novaPolozka = {
      slovo: noveVlastniSlovo.trim(),
      kategorie: 'Vlastní',
      obtiznost: 'stredni',
      napoveda: novaNapoveda.trim() || 'Vlastní přidané slovo'
    }

    setVlastniSlova((prev) => [novaPolozka, ...prev])
    setNoveVlastniSlovo('')
    setNovaNapoveda('')
  }

  const smazatVlastniSlovo = (index) => {
    setVlastniSlova((prev) => prev.filter((_, i) => i !== index))
  }

  // Přepínání kategorií v nastavení
  const prepnoutKategorii = (kat) => {
    setVybraneKategorie((prev) =>
      prev.includes(kat) ? prev.filter((k) => k !== kat) : [...prev, kat]
    )
  }

  const vybratVsechnyKategorie = () => setVybraneKategorie(VSECHNY_KATEGORIE)
  const zrusitVsechnyKategorie = () => setVybraneKategorie([])

  // Ikona a barva aktuální metody
  const MetodaIkona = aktualniKarta?.metoda?.ikona || Drama
  const metodaBarva =
    aktualniKarta?.metoda?.id === 'popis'
      ? '#3b82f6'
      : aktualniKarta?.metoda?.id === 'pantomima'
      ? '#ec4899'
      : aktualniKarta?.metoda?.id === 'kresleni'
      ? '#eab308'
      : '#a855f7'

  return (
    <div
      ref={containerRef}
      className={`glass-panel ${isFullscreen ? 'charades-fullscreen-active' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: isFullscreen ? '100vh' : 'auto',
        justifyContent: isFullscreen ? 'space-between' : 'flex-start',
        padding: isFullscreen ? '30px 40px' : '28px',
        backgroundColor: isFullscreen ? '#0a0e17' : undefined
      }}
    >
      {/* 1. HORNÍ LIŠTA: Režimy, nastavení a Fullscreen */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}
          >
            <Drama size={24} color="#ec4899" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Šarády & Activity
              <span className="badge badge-purple" style={{ fontSize: '11px', padding: '2px 8px' }}>
                Párty Hra
              </span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Slovní popis, pantomima, kreslení a čelovka Kdo jsem
            </p>
          </div>
        </div>

        {/* Přepínač hlavního režimu (Activity vs Čelovka) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              onClick={() => {
                setRezimHry('activity')
                losovatDalsiSlovo()
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: rezimHry === 'activity' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
                color: rezimHry === 'activity' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Drama size={15} />
              Activity
            </button>
            <button
              onClick={() => {
                setRezimHry('kdo_jsem')
                losovatDalsiSlovo()
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: rezimHry === 'kdo_jsem' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                color: rezimHry === 'kdo_jsem' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <HelpCircle size={15} />
              Kdo jsem? (Čelovka)
            </button>
          </div>

          {/* Pomocná tlačítka: Zvuk, Pravidla, Nastavení, Fullscreen */}
          <button
            onClick={() => setZvukPovolen(!zvukPovolen)}
            className="btn btn-secondary"
            title={zvukPovolen ? 'Ztlumit zvuky' : 'Zapnout zvuky'}
            style={{ padding: '8px 12px', minWidth: '40px' }}
          >
            {zvukPovolen ? <Volume2 size={16} color="#4ade80" /> : <VolumeX size={16} color="#94a3b8" />}
          </button>

          <button
            onClick={() => setOtevrenaNapovedaPravidel(!otevrenaNapovedaPravidel)}
            className="btn btn-secondary"
            title="Jak hrát a pravidla"
            style={{ padding: '8px 12px' }}
          >
            <Info size={16} />
            <span style={{ fontSize: '12px' }}>Pravidla</span>
          </button>

          <button
            onClick={() => setOtevrenoNastaveni(!otevrenoNastaveni)}
            className={`btn ${otevrenoNastaveni ? 'btn-primary' : 'btn-secondary'}`}
            title="Nastavení hry a slov"
            style={{ padding: '8px 14px' }}
          >
            <Settings size={16} />
            <span style={{ fontSize: '13px' }}>Nastavení</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn btn-secondary"
            title={isFullscreen ? 'Ukončit celou obrazovku (Esc)' : 'Celá obrazovka (F)'}
            style={{ padding: '8px 12px' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* 2. NASTAVENÍ (Výsuvný panel) */}
      {otevrenoNastaveni && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="#ec4899" /> Nastavení šarád a slovníku
            </h3>
            <button
              onClick={() => setOtevrenoNastaveni(false)}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Zavřít
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Metoda Activity */}
            {rezimHry === 'activity' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Metoda předvedení:
                </label>
                <select
                  value={vybranaMetodaActivity}
                  onChange={(e) => setVybranaMetodaActivity(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
                >
                  <option value="nahodna">Náhodně (Popis / Pantomima / Kreslení)</option>
                  <option value="pantomima">Pouze Pantomima (tělo beze slov)</option>
                  <option value="popis">Pouze Slovní popis (vysvětlení)</option>
                  <option value="kresleni">Pouze Kreslení (papír / tabule)</option>
                </select>
              </div>
            )}

            {/* Čas na kolo */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Časový limit na kolo:
              </label>
              <select
                value={delkaKola}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setDelkaKola(val)
                  setZbyvajiciCas(val)
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
              >
                <option value={30}>30 sekund (bleskovka)</option>
                <option value={60}>60 sekund (klasika)</option>
                <option value={90}>90 sekund (více času)</option>
                <option value={120}>120 sekund (2 minuty)</option>
                <option value={0}>Neomezeně (bez odpočtu)</option>
              </select>
            </div>

            {/* Obtížnost */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Obtížnost:
              </label>
              <select
                value={obtiznost}
                onChange={(e) => setObtiznost(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
              >
                <option value="vse">Všechny obtížnosti</option>
                <option value="lehka">Pouze lehké (vhodné pro děti)</option>
                <option value="stredni">Střední (standard)</option>
                <option value="tezka">Těžké pojmy (pro zkušené)</option>
              </select>
            </div>

            {/* Cílový počet bodů */}
            {typBodovani === 'tymy' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Cíl hry (vítězné body):
                </label>
                <select
                  value={ciloveBody}
                  onChange={(e) => setCiloveBody(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
                >
                  <option value={10}>První tým s 10 body vyhrává</option>
                  <option value={15}>První tým s 15 body vyhrává</option>
                  <option value={20}>První tým s 20 body vyhrává</option>
                  <option value={0}>Bez limitu bodů (hrát do omrzení)</option>
                </select>
              </div>
            )}
          </div>

          {/* Výběr kategorií */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Povolené kategorie slov ({vybraneKategorie.length}/{VSECHNY_KATEGORIE.length}):
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={vybratVsechnyKategorie} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer' }}>
                  Vybrat vše
                </button>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                <button onClick={zrusitVsechnyKategorie} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>
                  Zrušit vše
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VSECHNY_KATEGORIE.map((kat) => {
                const aktivni = vybraneKategorie.includes(kat)
                return (
                  <button
                    key={kat}
                    onClick={() => prepnoutKategorii(kat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: aktivni ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: aktivni ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: aktivni ? '#fff' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: aktivni ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {kat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vlastní slova sekce */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={15} color="#4ade80" /> Vlastní slova / interní táborové vtipy ({vlastniSlova.length}):
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={zahrnoutVlastni}
                  onChange={(e) => setZahrnoutVlastni(e.target.checked)}
                />
                Zahrnout do losování
              </label>
            </div>

            <form onSubmit={handlePridatVlastni} style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Nové slovo nebo pojem..."
                value={noveVlastniSlovo}
                onChange={(e) => setNoveVlastniSlovo(e.target.value)}
                style={{ flex: '1 1 200px', padding: '8px 12px', fontSize: '13px' }}
              />
              <input
                type="text"
                placeholder="Krátká nápověda (nepovinné)..."
                value={novaNapoveda}
                onChange={(e) => setNovaNapoveda(e.target.value)}
                style={{ flex: '1 1 200px', padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-success" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Přidat
              </button>
            </form>

            {vlastniSlova.length > 0 && (
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px',
                  borderRadius: '8px'
                }}
              >
                {vlastniSlova.map((vs, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    {vs.slovo}
                    <Trash2
                      size={12}
                      color="#f87171"
                      style={{ cursor: 'pointer' }}
                      onClick={() => smazatVlastniSlovo(idx)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. NÁPOVĚDA PRAVIDEL (Vyskakovací panel) */}
      {otevrenaNapovedaPravidel && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
              <Info size={18} /> Pravidla hry
            </h3>
            <button
              onClick={() => setOtevrenaNapovedaPravidel(false)}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Rozumím
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
              <strong style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> Slovní popis:
              </strong>
              Vysvětli slovo svými slovy. <strong>Zákaz:</strong> nesmíš použít kořen slova, překlad do cizího jazyka ani rýmování.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
              <strong style={{ color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Drama size={14} /> Pantomima:
              </strong>
              Předveď slovo tělem, rukama a výrazy obličeje. <strong>Zákaz:</strong> žádná slova, zvuky ani ukazování na předměty okolo.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
              <strong style={{ color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PenTool size={14} /> Kreslení:
              </strong>
              Kresli na tabuli nebo papír. <strong>Zákaz:</strong> nesmíš kreslit písmena ani čísla, nesmíš mluvit ani gestikulovat.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
              <strong style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={14} /> Kdo jsem? (Čelovka):
              </strong>
              Hráč si dá mobil na čelo nebo se nedívá na obrazovku. Pokládá otázky divákům, kteří smějí odpovídat pouze <strong>ANO</strong> či <strong>NE</strong>!
            </div>
          </div>
        </div>
      )}

      {/* 4. TÝMY & SKÓRE PANEL */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '12px 18px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Tým 1 vs Tým 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {tymy.map((tym, index) => {
            const jeAktivni = typBodovani === 'tymy' && aktivniTymIndex === index
            return (
              <div
                key={tym.id}
                onClick={() => {
                  setAktivniTymIndex(index)
                  restartovatCas()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: jeAktivni ? `2px solid ${tym.barva}` : '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: jeAktivni ? `${tym.barva}22` : 'rgba(255, 255, 255, 0.03)',
                  boxShadow: jeAktivni ? `0 0 16px ${tym.barva}44` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: tym.barva,
                    boxShadow: `0 0 8px ${tym.barva}`
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {jeAktivni ? 'Právě hraje' : 'Na střídačce'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                    {tym.nazev}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: '8px',
                    fontSize: '22px',
                    fontWeight: '800',
                    color: tym.barva,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {tym.body}
                </div>
              </div>
            )
          })}

          <button
            onClick={prepnoutTym}
            className="btn btn-secondary"
            title="Přepnout na druhý tým"
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Users size={14} /> Další tým
          </button>
        </div>

        {/* Cíl a historie tahu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {ciloveBody > 0 && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Cíl: <strong style={{ color: '#facc15' }}>{ciloveBody} bodů</strong>
            </div>
          )}

          {kolaHistorie.length > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              V tomto tahu:{' '}
              <span style={{ color: '#4ade80', fontWeight: '700' }}>
                +{kolaHistorie.filter((k) => k.uspech).length}
              </span>{' '}
              / celkem {kolaHistorie.length}
            </div>
          )}
        </div>
      </div>

      {/* 5. VÍTĚZNÁ BANNER OBRAZOVKA (Pokud tým vyhraje) */}
      {vitez && (
        <div
          style={{
            background: `linear-gradient(135deg, ${vitez.barva}33, #0a0e17)`,
            border: `2px solid ${vitez.barva}`,
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.4s ease'
          }}
        >
          <Trophy size={48} color="#facc15" />
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#fff' }}>
            Vítězí {vitez.nazev}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Gratulujeme! Dosáhli jste cílového počtu {ciloveBody} bodů jako první!
          </p>
          <button
            onClick={() => {
              setVitez(null)
              setTymy((prev) => prev.map((t) => ({ ...t, body: 0 })))
              restartovatCas()
              losovatDalsiSlovo()
            }}
            className="btn btn-primary"
            style={{ marginTop: '8px', padding: '10px 24px' }}
          >
            Nová hra od nuly
          </button>
        </div>
      )}

      {/* 6. ČASOVAČ KOLA S PROGRESSEM */}
      {delkaKola > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Tlačítka ovládání času */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={prepnoutPauzu}
              className={`btn ${casovacBezi ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {casovacBezi ? <Pause size={15} /> : <Play size={15} />}
              {casovacBezi ? 'Pauza' : casVyprsel ? 'Nový tah' : 'Start'}
            </button>
            <button
              onClick={restartovatCas}
              className="btn btn-secondary"
              title="Resetovat časovač"
              style={{ padding: '8px 12px' }}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Vizuální progress bar */}
          <div style={{ flex: 1, position: 'relative', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (zbyvajiciCas / delkaKola) * 100))}%`,
                backgroundColor:
                  zbyvajiciCas <= 10
                    ? '#ef4444'
                    : zbyvajiciCas <= 20
                    ? '#f97316'
                    : '#3b82f6',
                boxShadow:
                  zbyvajiciCas <= 10
                    ? '0 0 12px #ef4444'
                    : '0 0 8px #3b82f6',
                transition: 'width 0.3s linear, background-color 0.3s'
              }}
            />
          </div>

          {/* Číslo odpočtu */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: '800',
              fontVariantNumeric: 'tabular-nums',
              minWidth: '55px',
              textAlign: 'right',
              color: casVyprsel ? '#ef4444' : zbyvajiciCas <= 10 ? '#f87171' : '#fff'
            }}
          >
            {zbyvajiciCas}s
          </div>
        </div>
      )}

      {/* 7. HLAVNÍ HERNA KARTA S VELKÝM POJMEM */}
      <div
        style={{
          position: 'relative',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: `2px solid ${casVyprsel ? '#ef4444' : metodaBarva}55`,
          borderRadius: '24px',
          padding: isFullscreen ? '60px 40px' : '45px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '20px',
          boxShadow: `0 20px 50px -15px ${metodaBarva}22`,
          minHeight: isFullscreen ? '450px' : '300px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Odznak metody (Popis / Pantomima / Kreslení / Čelovka) */}
        {aktualniKarta && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              backgroundColor: `${metodaBarva}20`,
              border: `1px solid ${metodaBarva}60`,
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: `0 0 16px ${metodaBarva}30`
            }}
          >
            <MetodaIkona size={18} color={metodaBarva} />
            {aktualniKarta.metoda?.nazev}
          </div>
        )}

        {/* Skrytí karty pro čelovku */}
        {rezimHry === 'kdo_jsem' && (
          <button
            onClick={() => setKartaSkryta(!kartaSkryta)}
            className="btn btn-secondary"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              padding: '6px 12px',
              fontSize: '12px'
            }}
          >
            {kartaSkryta ? <Eye size={14} /> : <EyeOff size={14} />}
            {kartaSkryta ? 'Odkrýt slovo' : 'Skrýt pro hráče'}
          </button>
        )}

        {/* Samotné slovo / fráze ve velké typografii */}
        {kartaSkryta ? (
          <div style={{ padding: '40px 0' }}>
            <div style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Karta je skryta pro hráče na čele
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              (Klepněte na &quot;Odkrýt slovo&quot; pro zobrazení publiku)
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '900px' }}>
            <h1
              style={{
                fontSize: isFullscreen ? 'clamp(36px, 6vw, 76px)' : 'clamp(28px, 4.5vw, 54px)',
                fontWeight: '900',
                letterSpacing: '-0.5px',
                lineHeight: '1.15',
                color: '#ffffff',
                margin: 0,
                textShadow: '0 4px 20px rgba(0,0,0,0.6)'
              }}
            >
              {aktualniKarta?.slovo || 'Načítání slova...'}
            </h1>

            {/* Zobrazená nápověda, pokud je zapnuta */}
            {ukazatNapovedu && aktualniKarta?.napoveda && (
              <div
                style={{
                  marginTop: '16px',
                  display: 'inline-block',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '8px 18px',
                  borderRadius: '12px',
                  color: '#93c5fd',
                  fontSize: '15px'
                }}
              >
                Nápověda: <strong>{aktualniKarta.napoveda}</strong>
              </div>
            )}
          </div>
        )}

        {/* Spodní meta údaje karty: Kategorie & Pravidlo */}
        {aktualniKarta && !kartaSkryta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 12px',
                borderRadius: '8px',
                color: 'var(--text-secondary)'
              }}
            >
              Kategorie: <strong style={{ color: '#fff' }}>{aktualniKarta.kategorie}</strong>
            </span>

            {aktualniKarta.napoveda && !ukazatNapovedu && (
              <button
                onClick={() => setUkazatNapovedu(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Zobrazit nápovědu
              </button>
            )}

            <span
              style={{
                fontSize: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px 10px',
                borderRadius: '8px',
                color: 'var(--text-muted)'
              }}
            >
              {aktualniKarta.metoda?.popis}
            </span>
          </div>
        )}

        {/* Upozornění na vypršení času */}
        {casVyprsel && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '15px',
              fontWeight: '700',
              animation: 'fadeIn 0.2s'
            }}
          >
            Čas kola vypršel! Uhodl tým ještě toto slovo?
          </div>
        )}
      </div>

      {/* 8. HLAVNÍ AKČNÍ TLAČÍTKA: UHODNUTO (+1) a PŘESKOČIT (0) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '16px',
          marginTop: '6px'
        }}
      >
        <button
          onClick={preskocitSlovo}
          className="btn btn-secondary"
          style={{
            padding: isFullscreen ? '20px' : '16px',
            fontSize: isFullscreen ? '18px' : '16px',
            fontWeight: '700',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <SkipForward size={22} />
          Přeskočit (0 b)
          <span style={{ fontSize: '12px', opacity: 0.6, fontWeight: '400' }}>(S / ↓)</span>
        </button>

        <button
          onClick={oznacitUhodnuto}
          className="btn btn-success"
          style={{
            padding: isFullscreen ? '20px' : '16px',
            fontSize: isFullscreen ? '20px' : '17px',
            fontWeight: '800',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)'
          }}
        >
          <Check size={26} strokeWidth={3} />
          Uhodnuto! (+1 bod)
          <span style={{ fontSize: '13px', opacity: 0.8, fontWeight: '400' }}>(Enter / →)</span>
        </button>
      </div>

      {/* 9. SPODNÍ NÁPOVĚDA KLÁVES A HISTORIE TAHU */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          paddingTop: '8px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Mezerník</kbd> Start/Pauza
          </span>
          <span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Enter</kbd> Uhodnuto
          </span>
          <span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>S</kbd> Přeskočit
          </span>
          <span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>F</kbd> Celá obrazovka
          </span>
        </div>

        <div>
          Celkem odehráno v této hře: <strong style={{ color: 'var(--text-secondary)' }}>{odehranaSlova.length} slov</strong>
        </div>
      </div>
    </div>
  )
}
