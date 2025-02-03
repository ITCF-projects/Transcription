## Ordlista
### GUID
Ett unikt ID för varje transkribering
### ePPN
Användarens identitet

## Flöde för skapande av transkriberingar
1. När en transkribering skapas genererar API:et en GUID (\<guid>) som unikt ID för transkriberingen.
2. API:et skapar en mapp i användarens katalog med sökvägen /Users/\<ePPN>/\<guid>
3. I denna mapp skapas 3st filer:
    1.  transcription.json som innehåller status & metadata för transkriberingen.
    2. dictionary.txt som innehåller en ordlista för transkriberingen.
    3. Den uppladdade ljudfilen
4. FolderWatcher söker periodiskt efter alla förekomster av filen `transcription.json` i /Users/-mappens underkataloger
5. FolderWatcher bearbetar nya filer i datum-ordning och uppdaterar /Users/\<ePPN>/\<guid>/transcription.json med status och metadata.
6. FolderWatcher skapar och skriver transkriberingsresultatsfiler till /Users/\<ePPN>/\<guid>
7. FolderWatcher meddelar slutanvändaren via epost när en transkribering färdigställs.
8. Folderwatcher raderar filer som passerat bäst före datum (DeletionDays i config).

## Filstruktur
```
/Users
    ./<ePPN>
        ./<guid>
            ./transcription.json
            ./<ljudfil>
            ./dictionary.txt
/Logs
    ./script.log
    ./transcriptions.jsonl
```
## Filformat
### \<guid>.json
Innehåller ett unikt ID för transkriberingen (GUID) samt vilken användare som begärt den (ePPN)
```json
{
  "TranscriptRequestID": "8f40951d-afd2-4775-b723-e039018e31f4",
  "TranscriptRequestUserEPPN": "foref48@test.ad.liu.se"
}
```
### transcription.json
Innehåller språk, ljudfilens namn, status för transkribering samt tidsstämplar för när saker har skett.
#### Statusar för transkribering
- new
- transcribing
- failed
- error
- completed
```json
{
  "Language": "sv-se",
  "Created": "2024-02-06T08:23:30.6260949Z",
  "Started": "2024-02-06T08:23:35.5297123Z",
  "Ended": "2024-02-06T08:24:46.2246644Z",
  "Status": "Completed",
  "FileName": "dup.wav",
  "Deleted": "2024-02-07T08:24:46.2269340Z",
  "AudioLength": 65.92
}
```