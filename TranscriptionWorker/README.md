# Introduction 
Opted to base dockerfile with SX and install Powershell since we want to run spx commands in powershell and the SPX base container contains everything we need for SPX.
Container supports running a different script than the default one if we have tool-scripts that needs to be run from time to time.

The container stops if the scripts stops

# Environment variables
The container has the following environment variables

## ENV POWERSHELL_TELEMETRY_OPTOUT
If we are to send PowerShell telemetry to Microsoft. This might not be needed but PowerShell containers use this so we add it just in case.
Default value: 1
Possible values:
- 0 = Send telemetry
- 1 = Do not send telemetry

## ITCF_TRANSCRIPTION_SCRIPT_START
What script under /scripts we should run.
Default value: main.ps1
Possible values: The name of any ps1 script file under /scripts

## ITCF_TRANSCRIPTION_SCRIPT_ERRORACTION
The PowerShell ErrorActionPreference for our script files.
Default value: Stop
Possible values: [Microsoft documentation](https://learn.microsoft.com/en-us/dotnet/api/system.management.automation.actionpreference?view=powershellsdk-7.3.0)

# Volumes
The volumes we use

## /config
This volume is where we store persistent configuration

## /transcriptions
This volume is the root folder for our transcription data

## /transcription_logs
This volume is the root folder for our transcription logs

# Docker-Compose
Example docker-compose file
```
services:
  itfc-transcription-queue:
    container_name: queuemanager
    build: .
    image: itcf-transcription/queuemanager:v1
    environment:
      - ENV POWERSHELL_TELEMETRY_OPTOUT=1 # Default value
      - ITCF_TRANSCRIPTION_SCRIPT_START=main.ps1 # Default value
      - ITCF_TRANSCRIPTION_SCRIPT_ERRORACTION="Stop" # Default value
    volumes:
      - ./storage:/transcriptions # Volume where transcription data and metadata is stored
      - ./config:/config # Volume where config is stored
      - ./logs:/transcription_logs # Volume where logs are stored
```