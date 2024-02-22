# Installation av Transkriberingsplattform på Windows Server 2022 VM
**TLDR;** Transkriberingskontainrar kommer att köras med docker i wsl, på en virtualiserad windows-server-instans, på din virtualiseringsplattform, i ditt hårdvarukluster.
Innan du väljer denna väg bör du reflektera över om huruvida virtualiserings-Inception är en bra väg framåt.

Windows server 2022 har inte stöd för docker desktop eller docker med linuxkontainrar, därav behovet av att köra docker i WSL.

## VM-förberedelser
- Aktivera virtualiseringsstöd i din VM-plattform

        Set-VMProcessor [VMName] -ExposeVirtualizationExtensions $true
- Installera WSL

       Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
       wsl --install
       wsl.exe --install -d ubuntu-2022
- Uppdatera distribution med docker-förutsättningar

       sudo apt-get update
       sudo apt-get install ca-certificates curl gnupg lsb-release
       sudo mkdir -p /etc/apt/keyrings
       curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
       echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
       $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
       cat /etc/apt/sources.list.d/docker.list
       sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
       sudo service docker start

## Klona repo, konfigurera, starta och verifiera funktion
- installera git, antingen i windows eller i linux.
- klona repo

        git clone https://liu-vs@dev.azure.com/liu-vs/Transcribe/_git/Transcribe
- konfigurera för eget lärosäte
    - Skapa och ersätt certifikat i projektets https-folder, nödvändiga format är: .key .pem .pfx
    - skapa my_secrets.txt med innehåll APIKEY=[min azure-nyckel]
    - skapa tenant-idp-konfiguration enligt separat guide.
    - byt ut tenant-inställningar i följande filer
        - appsettings.Production.json
        - .env.production
    - Justera och certifikatinställningar i default.conf
    - Komplettera docker-compose.override.yml med certifikatinställningar
        
            frontend:
              volumes:
                - /mnt/e/Transcribe/https:/etc/nginx/certs/
            api:
              environment:
                - ASPNETCORE_ENVIRONMENT=Production
                - Kestrel__Certificates__Default__Path=/root/.aspnet/https/[filnamn].pfx
                - Kestrel__Certificates__Default__Password=[lösenord]

## Skapa förutsättningar för att nå tjänsten från en annan dator
- Öppna lokal brandvägg

        netsh advfirewall firewall add rule name= "Transcribe port open" dir=in action=allow protocol=TCP localport=4173
- Skapa port-proxy

        ## Justera värden för dina förutsättningar
        netsh interface portproxy add v4tov4 listenport=4173 listenaddress=0.0.0.0 connectport=4173 connectaddress=172.31.130.118

- Öppna för trafik till serverdatorn på det nätsegment där den är placerad
Beställ öppning hos nätgrupp

## Starta tjänsten automatiskt vid uppstart
- Uppdatera wsl till senaste preview för att få tillgång till funktionen från september 2023
- Sätt användaren till att inte behöva lösenord för att köra sudo
- (tips) Skapa ett script för att förenkla konfiguration av tjänsteuppstart (och för att ge dig frihet att justera uppstartstförfarande direkt på disk i framtiden)

        # Transcribe.sh
        sudo docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
- Skapa en Scheduled task, sätt den att starta varje gång datorn startar, oavsett om användaren är inloggad eller inte. använd startkommando:

        "C:\Program Files\WSL\wsl.exe" . /mnt/e/Transcribe/Transcribe.sh
