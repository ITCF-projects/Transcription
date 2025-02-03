import styles from '../App.module.scss';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const FaqPage = (): JSX.Element => {
    return (
        <div className={styles.content}>

            <PageHeader backTo='/' title='Vanliga frågor' /> 

            <div className={styles.faq}>   
                <ul id="list">
                    <li>Skickas något av det jag transkriberar ut på nätet? <ul>
                        <li>Nej, transkribering och lagring sker på lärosätets egna servrar i lärosätets serverhall. Överföringen till
                        och från din enhet är krypterad. Varken din ljudfil, eller resultat, lämnar lärosätet. </li>
                    </ul>
                    </li>
                    <li>Kostar det något? <ul>
                        <li>Under utrullningsfasen sponsras tjänsten av forskningsdataprojektet. En ekonomisk modell ska beslutas och driftsättas när vi vet mer om hur tjänsten används.</li>
                    </ul>
                    </li>
                    <li>Vilken information sparas om min transkribering? <ul>
                        <li> Din uppladdade ljudfil och de resultatfiler som skapas när filen transkriberas är bara tillgängliga för dig. Dessa tas bort när maxtiden för transkriberingen löper ut, eller när du väljer att manuellt ta bort informationen.</li>
                        <li>Tjänsten sparar följande metadata om en utförd transkribering:
                        <ul><li>Användarnamn</li>
                        <li>Kostnadsställe</li>
                        <li>transkriberingsId</li>
                        <li>Tidpunkt för uppladdning</li>
                        <li>Tidpunkt för påbörjad transkribering</li>
                        <li>Tidpunkt för avslutad transkribering</li>
                        <li>Transkriberingens totallängd</li></ul>
                        Ovanstående metadata utgör beslutsunderlag för tjänstens förvaltning, samt faktureringsunderlag av nyttjade resurser.</li>
                    </ul></li>
                    <li>Vilka personer har tillgång till transkriberat material? <ul>
                        <li>Ingen förutom du själv kommer automatiskt åt ditt material. TA-personal med uppgift att sköta serverdrift
                        för den specifika maskinen kan teoretiskt sett komma åt materialet, men de får inte göra det utan ditt medgivande.
                        Personalen omfattas av SFS 2009:400 och har skrivit på en ansvarsförbindelse för systemadministration. </li>
                    </ul></li>
                    <li>Får jag någon notis när min transkribering är klar? <ul>
                        <li>Ja, det skickas en epostnotis vid varje avslutad transkribering innehållandes en anonymiserad enkel
                        statustext. </li>
                    </ul></li>
                    <li>Hur ska jag hantera mitt resultat?<ul>
                    <li>När transkriberingen är genomförd ska du ladda ner de resultatfiler du vill spara.
                        Överföringen mellan tjänsten och din webbläsare är krypterad.          
                        Säkerställ att resultatet sparas på en lagringsyta lämpad för den
                        typ av information ditt material innehåller -utgå ifrån din informationsklassning.</li>
                    </ul></li>
                    <li>Min transkribering har försvunnit. Varför? <ul>
                        <li>Transkriberingar raderas automatiskt en tid efter de transkriberats. Tiden för radering syns i
                        transkriberingslistan och på din transkribering. Radering sker vanligtvis några dagar efter transkribering.
                        Detta görs för att minimera information i transkriberingsplattformen.</li>
                    </ul></li>
                    <li>Vad betyder de olika nedladdningsformaten? <ul>
                        <li><b>SRT - Subtitle:</b> Ett populärt filformat för undertexter till videofiler. Det är en textfil med tidsstämplar
                        för när undertext ska visas i t.ex en film. </li>
                        <li><b>VTT - WebVTT:</b> Också ett populärt filformat för undertexter till videofiler. Formatet liknar SRT. </li>
                        <li><b>TSV - Tab-separated:</b> Tabseparerad fil. I praktiken en textfil med lite inledande formatinformation och all
                        transkriberad text på en enda lång rad. </li>
                        <li><b>JSON:</b> Ett programmerarvänligt format. Inte att rekommendera för gemene man. En formaterad textfil med mycket
                        metadata och alternativa textförslag. </li>
                    </ul></li>
                    <li>Vad betyder &quot;Terms&quot;-rutan när ny transkribering ska skapas? <ul>
                        <li>I denna ruta kan du skriva ord och fraser som sannolikt finns i ljudfilen.
                        Du anger dessa för att höja transkriberingskvaliteten med ord från den domän du transkriberar.
                        Skriv en fras per rad. </li>
                    </ul></li>
                    <li>Min transkribering har &quot;fastnat&quot; i status köad, varför? <ul>
                    <li>Det finns många, eller långa, transkriberingar före dig, det blir din tur tids nog. </li>
                    </ul></li>
                    <li>Varför förbättras inte transkriberingen med de fraser jag angett? <ul>
                        <li>Förmågan att kunna koppla fraser till det som sägs i ljudfilen, beror på inspelningskvalitet och språk.
                        Våra tester har visat att användning av domän-ord funkar bäst vid transkribering av engelska ljudfiler.
                        Transkriberingsmotorn uppdateras några gånger per år, testa gärna funktionen igen om ett tag. </li>
                    </ul>
                    </li>
                    <li>Varför kan jag inte &quot;dra-och-släppa&quot; filer för transkribering. <ul>
                        <li>Vi har valt denna lösning för att lättare kunna filtrera urvalet av filtyper till ljud- och videofiler. Det
                        blir då tydligare vilka filer som transkriberingssystemet kan hantera. </li>
                    </ul>
                    </li>
                    <li>Vilka filtyper kan transkriberas? <ul>
                        <li>De flesta ljud- och videoformat, Vår rekommendation är att testa och se. Transkriberingsmotorn utvecklas
                        kontinuerligt och använder f.n. programmet GStreamer i bakgrunden för att internt konvertera mellan format.
                        </li>
                        <li>Om du har möjlighet att välja filformat och vill vara säker på att det ska fungera så använd filformatet
                        wav. Det tar dock stor plats och mp3 är ofta ett bra alternativ.</li>
                    </ul>
                    </li>
                    <li>Min fil får resultat &quot;Unsupported&quot;, vad ska jag göra?<ul>
                        <li>Verifiera att du kan spela upp filen på din egen dator, för att säkerställa att din fil är korrekt.</li>
                        <li>Status &quot;Unsupported&quot; betyder att transkriberingsmotorn inte har stöd för den fil du laddat upp.
                        <ul>
                            <li>Kontrollera om du redan har ett verktyg för att konvertera filformat installerat på din dator. <ul>
                                <li>Videospelaren VLC kan konvertera ljud- och videofiler till andra filformat via menyval: <pre>Media &gt; Konvertera/Spara</pre></li>
                                <li>VLC finns tillgänglig via företagsportal på din klienthanterade dator.</li>
                                <li>Om du behöver hjälp med installation och byte av filformat får du vända dig till lämplig administratör på din egen institution.</li>
                                <li>Välj lämpligen filformat .wav eller .mp3 när du konverterar din originalfil.</li>
                            </ul>
                            </li>
                        </ul>
                        </li>
                    </ul>
                    </li>
                    <li>Hur stora filer kan jag transkribera? <ul>
                        <li>Tanken är att du ska kunna transkribera ljudfiler som är max två timmar långa, så dela upp filer som är
                        längre. Det finns en teknisk begränsning i filstorlek satt till 1 Gigabyte, så om din fil är större behöver
                        den antingen delas eller kodas om till ett utrymmeseffektivare format.</li>
                    </ul>
                    </li>
                    <li>Jag vill transkribera många filer, men kan bara ladda upp en fil i taget.<ul>
                        <li>Plattformens syfte är att vända sig till &quot;sällananvändare med ett förhållandevis litet behov av
                        transkribering&quot; om ditt behov av transkribering är större och således faller utanför detta syfte bör du
                        kontakta central IT för att skissa på en annan, lämpligare, lösning. Vi vill undvika ett scenario där
                        tjänstens tillgänglighet blir lidande av att storkonsumenter förbrukar alla resurser.</li>
                    </ul>
                    </li>
                </ul>
            </div>

            <Footer />            
        </div>
    );
};

export default FaqPage;
