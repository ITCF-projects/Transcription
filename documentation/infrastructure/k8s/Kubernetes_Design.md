
# Design

Read more about the base design and the containers in the [Infrastructure Design](../Infrastructure_Design.md) section.


# Transcribe Architecture

Recommended naming convention for the resources are:
`<resourceIdentifier>-<system>[_<name>]`

- Resource identifier: `ns` for namespace, `ing` for ingress, `secret` for secrets, `cfgm` for config maps.
- System: `api`, `frontend`, `tw` (transcription worker), `speechToText` (azure speech to text container)
- Name: Optional named suffix for the resource.

## **Namespace:** `ns-transcribe`

## Storage
- **Persistent Storage:**
  - `ps-transcribe` - Persistent storage for the TranscriptionWorker and the API.
    - `transcriptions` - Storage for transcriptions.
    - `audio` - Storage for audio files.
- **Persistent Volume Claim:**
  - `pvc-transcribe` - Persistent volume claim for the TranscriptionWorker and the API.
    - `transcriptions` - Storage for transcriptions.
    - `audio` - Storage for audio files.

## Config
- **Secrets:** 
  - `secrets-transcribe-tw` - Secrets for the TranscriptionWorker.
    - `az-cs-speech-to-text_api-key` - API key for the Azure Speech to text service.
  - `secrets-transcribe-api_tls-cert` - Secrets for the API.
    - `tls.crt` - SSL certificate for the api.
    - `tls.key` - SSL key for the api.
  - `secrets-transcribe-frontend_tls-cert` - Secrets for the frontend.
    - `tls.crt` - SSL certificate for the frontend.
    - `tls.key` - SSL key for the frontend.
  - Optional
    - `secrets-transcribe-tw_regcred` - Registry Credentials for docker image repository
    - `secrets-transcribe-api_regcred` - Registry Credentials for docker image repository
    - `secrets-transcribe-frontend_regcred` - Registry Credentials for docker image repository

- **Config Maps:**
  - `cfgm-transcribe-tw` - Configurations for the TranscriptionWorker.
    - `Config.json` - Config file for the TranscriptionWorker.
  - `cfgm-transcribe-api` - Configurations for the API.
    - `appsettings.json` - Appsettings file for the API.

## Network requirements
- **Services:**
  - `svc-transcribe_api` - Service for the API.
  - `svc-transcribe_frontend` - Service for the frontend.
  - `svc-transcribe_tw` - Service for the TranscriptionWorker.
  - `svc-transcribe_speechToText` - Service for the Azure Speech to text container.
  - Config:
    - Transcribe API
      - Port: `443` / `80`
      - Target port: `443` / `80`
      - Protocol: `TCP`
    - Transcribe frontend
      - Port: `443` / `80`
      - Target port: `443` / `80`
      - Protocol: `TCP`
    - Speech To Text
      - Port: `500X` <!-- replace X with an increment: 0,1,2,3,4 -->
      - Target port: `5000`
      - Protocol: `TCP`

- **ingress:** `ing-transcribe`
  - Add rules for backend API service ?? Ska den vara publik?
    - Host: ???
    - Service: (see above service for the API)
    - Port: 443 (https) / 80 (http)
    - Path: `/api`
  - Add rules for frontend service
    - Host: ???
    - Service: (see above service for the frontend)
    - Port: 443 (https) / 80 (http)
    
---

# Deployment

## Frontend
- **Location:** [Frontend](../reactapp/)
- **Image:** `Custom image from Dockerfile` [Dockerfile](../reactapp/Dockerfile)
- **Port:** `443` / `80`
- **Environment Variables:**
- **Optional:**
  - Image pull secret: `regcred` - Credentials for the docker image repository.
    - Secret, added from `secrets-transcribe-frontend_regcred`
The frontend is the user interface where users can upload audio files and view the results of the transcription. 


## API
- **Location:** [API](../api/)
- **Image:** `Custom image from Dockerfile` [Dockerfile](../api/Dockerfile)
- **Port:** `443` / `80`
- **Storage:** `ps-transcribe`
- **Environment Variables:**
- **Optional:**
  - Image pull secret: `regcred` - Credentials for the docker image repository.
    - Secret, added from `secrets-transcribe-api_regcred`


## Transcription Worker
- **Location:** [TranscriptionWorker](../TranscriptionWorker/)
- **Image:** `Custom image from Dockerfile` [Dockerfile](../TranscriptionWorker/Dockerfile)
- **Port:** `N/A`
- **Storage:** `ps-transcribe`
- **Environment Variables:**
  - `ApiKey` - The API key of the Speech resource that's used to track billing information.
    - Secret, added from `az-cs-speech-to-text_api-key`
- **Optional:**
  - Image pull secret: `regcred` - Credentials for the docker image repository.
    - Secret, added from `secrets-transcribe-tw_regcred`


## Speech to text
- **Location:** External
- **Image:** [Azure AI services Speech To Text](https://hub.docker.com/_/microsoft-azure-cognitive-services-speechservices-speech-to-text?tab=description)
- **Port:** `5000`
- **Environment Variables:**
  - `ApiKey` - The API key of the Speech resource that's used to track billing information.
    - Secret, added from `az-cs-speech-to-text_api-key`
  - `Eula` - Indicates that you accepted the license for the container. Have to be `accept`. 
  - `Billing` - The endpoint of the Speech resource that's used to track billing information.
- **Optional:**

# Containers for Kubernetes
