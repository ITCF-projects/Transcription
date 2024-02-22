## Getting started with local development of the API project
Select your preferred IDE or editor, the steps below will vary depending on what you choose.

### Steps
- Clone the repo

- Create a file to hold your azure api key (for TranscriptionWorker)

        cd Transcribe
        echo "APIKEY=mySecretAzureKey" > my_secrets.txt

- Assuming you have a "bare bones Editor" for development you need to create developer certs and secrets. If using Visual Studio, this step is done automatically for you.

        $APPDATA = $env:APPDATA
        cd API
        dotnet dev-certs https -ep $APPDATA/ASP.NET/Https/API.pfx -p p8tis
        cd..
        dotnet user-secrets set "Kestrel:Certificates:Development:Password" "p8tis" --project API

- Create app registrations for frontend and API in Entra ID. See detailed info in main [Readme.md (Authentication)](../README.md#authentication)  
  Update appsettings.json or copy/create appsettings.Development.json

- Build and run the project in docker (adjust as neede to your preferred container runtime)

        docker compose -f docker-compose.yml -f .\docker-compose.override.yml up --build 

- Navigate to the swagger API and try it out

        start chrome https://localhost:44331/swagger/index.html

- Start frontend. See [reactapp/Readme.md](../reactapp/README.md)  