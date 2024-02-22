

- [Introduction](#introduction)
  - [Purpose](#purpose)
  - [Target Audience](#target-audience)
- [Documentation](#documentation)
- [Solution Components](#solution-components)
- [Authentication](#authentication)
- [Building the Solution](#building-the-solution)
  - [Requirements](#requirements)
  - [Build Steps](#build-steps)
- [Development and Contribution Guidelines](#development-and-contribution-guidelines)
  - [How to Contribute](#how-to-contribute)
  - [How to Run the Solution Locally](#how-to-run-the-solution-locally)
- [Deploying the Solution](#deploying-the-solution)
  - [Requirements](#requirements-1)
  - [Deployment Steps](#deployment-steps)
    - [Infrastructure](#infrastructure)
    - [Application Deployment](#application-deployment)
- [Updating the Solution](#updating-the-solution)


## Introduction
The Transcribe solution is a multi-component application designed to transcribe audio files. It consists of a frontend, an API, a transcription worker, and uses external Speech to Text containers which are distributed by Microsoft.

### Purpose
The purpose of this solution is to provide an automated way to transcribe audio files into text in a secure and scalable way. The solution is designed to be deployed as standalone containers or in a container orchestrator such as Kubernetes.

### Target Audience
This README is intended for developers, contributors and users who want to understand, build, run, host and contribute to the Transcribe solution.

## Documentation

* [API Documentation](API/README.md)
* [Frontend Documentation](reactapp/README.md)
* [Transcription Worker Documentation](TranscriptionWorker/README.md)
* [Infrastructure Design](documentation/infrastructure/Infrastructure_Design.md)

## Solution Components

* Frontend: The frontend of the Transcribe solution is a React application located in the [reactapp](reactapp) directory.
* API: The API is a C# service located in the [API](API) directory.
* Transcription Worker: The Transcription Worker is a service written in PowerShell that handles the transcription process. It's located in the [TranscriptionWorker](TranscriptionWorker) directory.
* Speech to Text Containers: The solution uses external Speech to Text containers. More information can be found [here](https://hub.docker.com/_/microsoft-azure-cognitive-services-speechservices-speech-to-text?tab=description).

## Authentication
The application uses OpenID Connect for authentication of end users on the Microsoft identity platform (Entra ID). 

For creation and configuration of App Registrations for the Frontend and API, see the following document:  
[Transcribe - Authentication setup_v1.0.pdf](documentation/Transcribe%20-%20Authentication%20setup_v1.0.pdf)

Authorization for specific users to access the application can be configured in Entra ID under Enterprice application (frontend app registration). Currently the there is no concept of roles in the application and a logged in user can only see files/transcriptions uploaded by the user.

## Building the Solution

### Requirements
* Docker
* .NET SDK
* Node.js and npm

### Build Steps
1. Build the API: `dotnet build API`
2. Build the Frontend: `npm install && npm run build` in the `reactapp` directory.
3. Build the Transcription Worker: `dotnet build TranscriptionWorker`
4. Build the Docker images: `docker-compose build`

## Development and Contribution Guidelines

### How to Contribute
Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

### How to Prepare the code for local development
1. Create the file my_secrets.txt with content "APIKEY=mySecretAzureKey" in the project root.
2. Make sure you have a developer certificate for the API application. This is done automatically for you when building using Visual studio. To do this manually from command line: `dotnet dev-certs https -ep $APPDATA/ASP.NET/Https/API.pfx -p somepassword`
3. Make sure to register the certificate password as a secret. This is done automatically for you when building using Visual studio. To do this manually from command line: `user-secrets set "Kestrel:Certificates:Development:Password" "somepassword" --project API`
4. Make sure to have ADFS authentication properly configured (see separate guide)
5. Make sure you have a developer certificate for the reactapp application, follow vite guidelines.
6. Review the settings in `docker-compose.yml` and `docker-compose.override.yml` and adjust if required.
 
### How to Run the Solution Locally
1. Build and start the services: `docker compose -f docker-compose.yml -f .\docker-compose.override.yml up --build`
2. Access the frontend at `http://localhost:4173`
3. Access the Backend at `https://localhost:44331/swagger/index.html`

## Deploying the Solution

### Requirements
* An environment which can run Docker containers. This can be a local machine, a VM, or a container orchestrator such as Kubernetes.

For more details, please refer to the [Infrastructure Design](documentation/infrastructure/Infrastructure_Design.md) and [Kubernetes Design](documentation/infrastructure/k8s/Kubernetes_Design.md) documents.

### Deployment Steps

#### Infrastructure
Each alternative deployment method has its own README file. Please refer to the README file for the deployment method you want to use.
* Docker compose on ws2022: [README.md](documentation/infrastructure/docker-compose/README.md)
* Podman: [Readme.md](documentation/infrastructure/podman/Readme.md)

#### Application Deployment
1. Build the Docker images: `docker-compose build`
2. Push the Docker images to a container registry.
3. Update the image tags in the orchestrator deployment configuration.\*
4. Deploy the application.

\* Follow the instructions in the README file for the deployment method you are using.

## Updating the Solution
When new versions of the Speech to Text containers are released, update the image tag in the Kubernetes deployment configuration and redeploy the application.