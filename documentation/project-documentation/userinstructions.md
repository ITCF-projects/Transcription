## Detta är den introduktionstext till systemet som gavs till testanvändare vid Linköpings Univesitet

## Allmänt
Det finns ett stort behov av transkribering av olika typer av intervjuer och filmat material där automatisk transkribering kan 
vara ett bra sätt att snabba upp processen. Automatisk transkribering ska dock användas med försiktighet eftersom den i de flesta 
fall utförs på servrar utanför Linköpings Universitet. Generellt rekommenderar vi att ni använder de tjänster som finns 
tillgängliga inom Microsofts ramverk där vi har garanti på att transkriberingen sker inom Europa. Dessa tjänster kan dock inte 
användas för känsliga personuppgifter och vi behöver ett komplement. 

## När systemet kan användas
För automatisk transkribering av känsliga personuppgifter pågår ett arbete med att ta fram en tjänst som kan köras på våra 
egna servrar. Tjänsten är tänkt att vara enkel, du laddar upp den fil du vill transkribera, väljer språk och startar den. 
Den placeras då i kö och du kan enkelt se i listan när den är klar. Genom att klicka på filnamnet kan du få upp en preview 
där du kan se hur långt transkriberingen kommit. När transkriberingen är klar kan du välja att ladda ner resultatet. Både 
ljudfilen och resultatet tas bort efter några dagar, men du kan naturligtvis ta bort den tidigare. 
![Bild på gränsnittet](/documentation/project-documentation/transcribe.png)

## Vanliga frågor
- Skickas något av det jag transkriberar ut på nätet? 
    - Nej, transkribering och lagring sker på lärosätets egna servrar i lärosätets serverhall. Överföringen till och 
      från din enhet är krypterad. Varken din ljudfil, eller resultat, lämnar lärosätet.  
- Kostar det något? 
    - Testversionen är kostnadsfri, men när systemet tas i drift kommer troligtvis institutionen att debiteras per transkriberad minut.  
- Vilka personer har tillgång till transkriberat material? 
    -  Ingen förutom du själv kommer automatiskt åt ditt material. TA-personal med uppgift att sköta serverdrift för den 
       specifika maskinen kan teoretiskt sett komma åt materialet, men de får inte göra det utan ditt medgivande. Personalen 
       omfattas av SFS 2009:400 och har skrivit på en ansvarsförbindelse för systemadministration. 
- Får jag någon notis när min transkribering är klar? 
    -  Ja, det skickas en epostnotis vid varje avslutad transkribering innehållandes en anonymiserad enkel statustext.  
- Min transkribering har "fastnat" i status köad, varför? 
    -  Det finns många, eller långa, transkriberingar före dig, det blir din tur tids nog. 
- Min transkribering har försvunnit. Varför? 
    - Transkriberingar raderas automatiskt en tid efter de transkriberats. Tiden för radering syns i transkriberingslistan och på din transkribering. Radering sker vanligtvis några dagar efter transkribering. Detta görs för att minimera information i transkriberingsplattformen. Du får ladda ner resultatet och spara det säkert i en egen lagringslösning. 
- Vad betyder de olika nedladdningsformaten? 
    -  SRT - Subtitle: Ett populärt filformat för undertexter till videofiler. Det är en textfil med tidsstämplar för när undertext ska visas i t.ex en film. 
    -  VTT - WebVTT: Också ett populärt filformat för undertexter till videofiler. Formatet liknar SRT. 
    -  TSV - Tab-separated: Tabseparerad fil. I praktiken en textfil med lite inledande formatinformation och all transkriberad text på en enda lång rad.  
    -  JSON: Ett programmerarvänligt format. Inte att rekommendera för gemene man. En formaterad textfil med mycket metadata och alternativa textförslag. 
- Vad betyder "Terms"-rutan när ny transkribering ska skapas? 
    - I denna ruta kan du skriva ord och fraser som sannolikt finns i ljudfilen. 
      Du anger dessa för att höja transkriberingskvaliteten med ord från den domän du transkriberar. 
      Skriv en fras per rad. 
- Varför förbättras inte transkriberingen med de fraser jag angett? 
    - Förmågan att kunna koppla fraser till det som sägs i ljudfilen, beror på inspelningskvalitet och språk. 
      Våra tester har visat att användning av domän-ord funkar bäst vid transkribering av engelska ljudfiler. 
      Transkriberingsmotorn uppdateras några gånger per år, testa gärna funktionen igen om ett tag. 
- Varför kan jag inte "dra-och-släppa" filer för transkribering. 
    - Vi har valt denna lösning för att lättare kunna filtrera urvalet av filtyper till ljud- och videofiler. Det blir då tydligare vilka filer som transkriberingssystemet kan hantera. 
- Vilka filtyper kan transkriberas? 
    - De flesta ljud- och videoformat, Vår rekommendation är att testa och se. Transkriberingsmotorn utvecklas kontinuerligt och använder f.n. programmet GStreamer i bakgrunden för att internt konvertera mellan format. 
    - Om du har möjlighet att välja filformat och vill vara säker på att det ska fungera så använd filformatet wav. Det tar dock stor plats och mp3 är ofta ett bra alternativ.
- Min fil får resultat "Unsupported", vad ska jag göra?
    - Verifiera att du kan spela upp filen på din egen dator, för att säkerställa att din fil är korrekt.
    - Status "Unsupported" betyder att transkriberingsmotorn inte har stöd för den fil du laddat upp.
        - Kontrollera om du redan har ett verktyg för att byta filformat installerat på din dator. 
            - om inte kan du på en klienthanterad dator använda företagsportal för att installera verktyget VLC.
                - Metoden för installation och byte av filformat ligger utanför ansvarsområdet för denna tjänst och du får vända dig till lämplig administratör på din egen institution för hjälp.
- Hur stora filer kan jag transkribera? 
  - Tanken är att du ska kunna transkribera ljudfiler som är max två timmar långa, så dela upp filer som är längre. Det finns en teknisk begränsning i filstorlek satt till 1 Gigabyte, så om din fil är större behöver den antingen delas eller kodas om till ett utrymmeseffektivare format.
- Jag vill transkribera många filer, men kan bara ladda upp en fil i taget.
    - Plattformens syfte är att vända sig till "sällananvändare med ett förhållandevis litet behov av transkribering" om ditt behov av transkribering är större och således faller utanför detta syfte bör du kontakta central IT för att skissa på en annan, lämpligare, lösning. Vi vill undvika ett scenario där tjänstens tillgänglighet blir lidande av att storkonsumenter förbrukar alla resurser.