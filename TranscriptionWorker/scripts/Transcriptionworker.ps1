Start-sleep -seconds 30
Write-host "Sleeping for 30 seconds to allow speach container to start"
$Exit =  $false
$ConfigPath = "/config/"
#Get Config for the script
try {
    $Config = Get-Content -Path "$($ConfigPath)Config.json" | convertfrom-json
    spx --% config @region --set swedencentral
}
catch {
    $Exit = $true
    Write-Host "No config file will exit..."
}

#Trying to create all paths found in config
if($Config)
{
    foreach($C in $Config.PSObject.Properties)
    {
        if($C.Name -like "*path*")
        {
            if(!(Test-Path -Path $C.value))
            {
                try {
                    New-Item -ItemType Directory -Path $C.Value
                    Write-Host "Created folder $($C.Value)"
                }
                catch {
                    Write-Host "Failed to created folder $($C.Value)"
                }
            }
        }
    }
}


function Fileupdater {
    param ($Filepath,$Filedata)
    $FileMoveCompleted = $false
    $FuncContinue = $true
    try {
        New-Item -ItemType File -Path "$($Filepath).tmp" -Force -Value ($Filedata | Out-String)
    }
    catch {
        Write-Host $_
        $FuncContinue = $false
    }

    if($FuncContinue -eq $true)
    {
        $RetryCounter = 0
        do{
            try {
                Remove-Item -Path $Filepath -Force
                Rename-Item -Path "$($Filepath).tmp" -NewName $Filepath
                $FileMoveCompleted = $true
            }
            catch {
                Write-Host $_
                Write-Host "Failed to rename file will sleep"
                Start-Sleep -Seconds 5
            }
            $RetryCounter++
            
            if($RetryCounter -gt 5)
            {
                $FileMoveCompleted = $true
            }
        }
        while($FileMoveCompleted -eq $false)
    }

}

function Scriptlog {
    param ($LogMessage)
    
        $LogTime = (Get-Date).ToUniversalTime().ToString("o")
        Add-Content -Path $ScriptLogPath -Value "$($LogTime) - $($LogMessage)" -Force
        Write-Host "$($LogTime) - $($LogMessage)" -ForegroundColor Yellow
    
    
}

function RemoveQueueItem {
    param($QueueItemPath,$QueueID)

    try {
        Remove-Item -Path $QueueItemPath -Confirm:$false
        Scriptlog "Removed queue item $($QueueID)"
    }
    catch {
        Scriptlog "Failed to remove $($QueueID)"
        Scriptlog $_
    }

}

while($Exit -eq $false)
{
    #clears so if there are no files it will not try to run the last file again
    $TranscriptionToRun = $null
    $ScriptLogPath = "$($Config.Logpath)/script.log"
    #$DeletionWorkerPath = "$($ConfigPath)DeletionWorker.json"

    #Get all transcription files in the transcription folder.
    try {
        $GetTranscriptions = Get-ChildItem -Path $Config.IncommingTranscriptionPath
    }
    catch {
        #Write-Host $_
        #Write-Host "Error getting transcriptionfiles"
        Scriptlog "Error getting transcriptionfiles"
        Scriptlog $_
    }

    #Get all transcription request and the user who orderd them
    $CollectIncommingTranscriptions = @()
    Foreach($GetTranscription in $GetTranscriptions)
    {
        try {
            $CollectIncommingTranscriptions += Get-Content $GetTranscription.FullName | convertfrom-json
        }
        catch {
            #Write-Host "Failed to get $GetTranscription"
            Scriptlog "Failed to get $GetTranscription"
        }
    }

    if($CollectIncommingTranscriptions)
    {
        #Group all transcriptions on their user
        $GroupUsersWhoWantToTranscribe = $CollectIncommingTranscriptions | Group-Object -Property TranscriptRequestUserEPPN

        #If the users are more than 2 and the script has run before, select the first other users to transcribe for and select their first transcription
        if($LastUserToTranscribe -and $GroupUsersWhoWantToTranscribe.Count -ge 2)
        {
            $SelectNewUser = $GroupUsersWhoWantToTranscribe | Where-Object {$_.Name -ne $LastUserToTranscribe} | Get-Random
            $TranscriptionToRun = $SelectNewUser.Group | Select-Object -First 1
        }
        else {
            $SelectNewUser = $GroupUsersWhoWantToTranscribe | Get-Random
            $TranscriptionToRun = $SelectNewUser.Group | Select-Object -First 1
        }
    }

    if($TranscriptionToRun)
    {
        #Get the relevant paths for the transcription
        $UserTranscriptionsJsonPath = "$($Config.UserBasePath)/$($TranscriptionToRun.TranscriptRequestUserEPPN)/transcriptions.jsonl"
        $TranscriptionPath = "/$($Config.UserBasePath)/$($TranscriptionToRun.TranscriptRequestUserEPPN)/$($TranscriptionToRun.TranscriptRequestID)/"
        $TranscriptionJsonPath = "$($TranscriptionPath)transcription.json"
        $StartTime = (Get-Date).ToUniversalTime().ToString("o")
        $ContinueTranscription = $true
        $QueueItemCreationTime = ($GetTranscriptions | where {$_.name -eq "$($TranscriptionToRun.TranscriptRequestID).json"}).CreationTime.ToUniversalTime().ToString("o")
        $QueueItem = "$($Config.IncommingTranscriptionPath)/$($TranscriptionToRun.TranscriptRequestID).json"
        


        #Check if you can find the specific JSON for the specific transcription
        if(Test-Path -Path $TranscriptionJsonPath)
        {
            $TranscriptionJson = Get-Content $TranscriptionJsonPath | convertfrom-json
        }
        else
        {
            #Write-Host "Transcription info at $TranscriptionJsonPath not found"
            Scriptlog "Transcription info at $TranscriptionJsonPath not found"
            $ContinueTranscription = $false
        }

        #Find the file that you are supposed to transcribe from JSON
        try {
            $File = Get-ChildItem $TranscriptionPath/$($TranscriptionJson.FileName)
            #Write-Host $TranscriptionPath/$($TranscriptionJson.FileName)
            #Write-Host $TranscriptionJson
        }
        catch {
            #Write-Host "failed to get file TranscriptionPath"
            #write-host $_
            Scriptlog "failed to get file TranscriptionPath"
            Scriptlog $_
            $ContinueTranscription = $false
        }

        #If I cant find a file, i wont try to transcribe.
        if(!$File)
        {
            #Write-Host "No file to transcribe found"
            Scriptlog "No file to transcribe found"
            $ContinueTranscription = $false
            Start-sleep -Seconds 5
        }
        else
        {
            if($File.count -ge 2)
            {
                #Write-Host "Greater than 2 files found will not continue"
                #Write-host $File.Name
                Scriptlog "Greater than 2 files found will not continue"
                Scriptlog $File.Name
                $ContinueTranscription = $false
                Start-sleep -Seconds 5
            }
        }
        

        if($ContinueTranscription -eq $true)
        {
            $TranscriptionCompleted = $true
            $ScriptLogPath = "$($TranscriptionPath)$($TranscriptionToRun.TranscriptRequestID).log"
            #Get the languagesettings from TranscriptionJSON
            $LanguageConfiguration = $Config.Languages | Where-Object {$_.CountryCode -eq $TranscriptionJson.Language}

            if(!$LanguageConfiguration)
            {
                #Write-Host "Falied to get language config $($TranscriptionJson.Language)"
                Scriptlog "Falied to get language config $($TranscriptionJson.Language)"
                $TranscriptionJsonNewData = [PSCustomObject]@{Language = $TranscriptionJson.Language; Created = $TranscriptionJson.Created; Started = $StartTime ;Ended = $null; Status = "Error"; FileName = $TranscriptionJson.FileName; Deleted = $DeletionDate}| ConvertTo-Json
                #New-Item -ItemType File -Path $TranscriptionJsonPath -Force -Value ($TranscriptionJsonNewData | Out-String)
                Fileupdater -Filepath $TranscriptionJsonPath -Filedata $TranscriptionJsonNewData
                
                #Transcription Queue item deletion
                RemoveQueueItem -QueueItemPath $QueueItem -QueueID $($TranscriptionToRun.TranscriptRequestID)
                
                #try {
                #    Remove-Item -Path "$($Config.IncommingTranscriptionPath)/$($TranscriptionToRun.TranscriptRequestID).json" -Confirm:$false
                #    #Write-host "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                #    Scriptlog "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                #}
                #catch {
                #    #write-host "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                #    #Write-Host $_
                #    Scriptlog "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                #    Scriptlog $_
                #}
            }
            else {
                $ServerURL = $LanguageConfiguration.Url
                $Language = $LanguageConfiguration.CountryCode
            }

            if($LanguageConfiguration)
            {
                #Paths to VTT,SRT and file
                $OutputVTTFilepath = "$($TranscriptionPath)$($File.name).vtt"
                $OutputSRTFilepath = "$($TranscriptionPath)$($File.name).srt"
                $ProcessingFilePath  = "$($TranscriptionPath)$($File.name)"
                $LogPath = "$($TranscriptionPath)$($File.name).log"
                $Jsonfilepath = "$($TranscriptionPath)$($File.name).json"
                $EachTSVfilepath = "$($TranscriptionPath)$($File.name).each.tsv"
                $Tsvfilepath = "$($TranscriptionPath)$($File.name).tsv"
                $Dictionarypath = "$($TranscriptionPath)dictionary.txt"

                #Update TranscriptionJson with starttime, to signal that the transcription has started.
                try {
                    $TranscriptionJsonNewData = [PSCustomObject]@{Language = $TranscriptionJson.Language; Created = $TranscriptionJson.Created; Started = $StartTime ;Ended = $null; Status = "Transcribing"; FileName = $TranscriptionJson.FileName}| ConvertTo-Json
                    #New-Item -ItemType File -Path $TranscriptionJsonPath -Force -Value ($TranscriptionJsonNewData | Out-String)
                    Fileupdater -Filepath $TranscriptionJsonPath -Filedata $TranscriptionJsonNewData
                    Scriptlog "Starting transcription $($TranscriptionToRun.TranscriptRequestID)..."
                }
                catch {
                    #write-host $_
                    Scriptlog $_
                }

                #Depending if we have phrases, set another config.
                $Parms = @("recognize", 
                "--key", "none",
                "--host", $ServerURL,
                "--file", $ProcessingFilePath,
                "--language", $Language,
                "--format","any", 
                "--output","vtt","file", $OutputVTTFilepath,
                "--output", "srt", "file" ,$OutputSRTFilepath, 
                "--region", "swedencentral",
                "--log", $LogPath,
                "--output", "each", "text",
                "--output", "each", "file", $EachTSVfilepath,
                "--output", "all", "file", $Tsvfilepath,
                "--output", "batch", "json",
                "--output", "batch", "file", $Jsonfilepath)

                if(Test-Path -Path $Dictionarypath)
                {
                    #Write-Host "Using dictionary"
                    Scriptlog "Using dictionary"
                    #$Phrases = "$([char]34)$($TranscriptionJson.TranscriptRequestDictionary)$([char]34)"
                    #$Parms = "recognize --key none --host ws://localhost:5000/ --file $ProcessingFilePath --language $($GetTranscriptionInformation.Transcriptions.TranscriptLanguage) --format any --output vtt file $($OutputVTTFilepath) --output srt file $($OutputSRTFilepath) --phrases $Phrases"
                    #$Parms = @("recognize", 
                    #"--key", "none",
                    #"--host", $ServerURL,
                    #"--file", $ProcessingFilePath,
                    #"--language", $Language,
                    #"--format","any", 
                    #"--output","vtt","file", $OutputVTTFilepath,
                    #"--output", "srt", "file" ,$OutputSRTFilepath, 
                    #"--region", "swedencentral",
                    #"--log", $LogPath,
                    #"--output", "each", "text",
                    #"--output", "each", "file", $EachTSVfilepath,
                    #"--output", "all", "file", $Tsvfilepath,
                    #"--output", "batch", "json",
                    #"--output", "batch", "file", $Jsonfilepath,
                    #"--phrases", "@$Dictionarypath")
                    $Parms += @("--phrases", "@$Dictionarypath")
                }
                else {
                    #$Parms = "recognize --key none --host $ServerURL --file '$ProcessingFilePath' --language $Language --format any --output vtt file $($OutputVTTFilepath) --output srt file $($OutputSRTFilepath) --region swedencentral --log $LogPath --output each text --output each file $EachTSVfilepath --output all file $Tsvfilepath --output batch json --output batch file $Jsonfilepath"
                }
                #Start transcriptions.
                #spx help recognize phrases
                try {
                    #Start-Process -NoNewWindow -FilePath "spx.exe" -ArgumentList "recognize --key none --host ws://localhost:5000/ --file $ProcessingFilePath --phrases "$($GetTranscriptionInformation.Transcriptions.TranscriptRequestDictionary)" --language "$($GetTranscriptionInformation.Transcriptions.TranscriptLanguage)" --format any --output vtt file $($OutputVTTFilepath) --output srt file $($OutputSRTFilepath)"
                    $Command = "spx"
                    #$Parms = $Parms.Split(" ")
                    & "$Command" $Parms
                    #Write-Host $LASTEXITCODE
                    #Delete or Archive file? $ProcessingFilePath 
                    Write-host "$($ProcessingFilePath) File transcribed"
                    Scriptlog "($ProcessingFilePath) File transcribed"
                    
                    #Start-Sleep -seconds 5
                }
                catch {
                    #Write-Host $_
                    Scriptlog $_
                    $TranscriptionCompleted = $false
                }
                $EndtTime = (Get-Date).ToUniversalTime().ToString("o")

                If(!$TranscriptionJson.Deleted)
                {
                    
                    if($Config.DeletionDays)
                    {
                        $DeletionDate = ((Get-Date).AddDays($Config.DeletionDays)).ToUniversalTime().ToString("o")
                    }
                    else {
                        $DeletionDate = ((Get-Date).AddDays(14)).ToUniversalTime().ToString("o")
                    }
                }
                else {
                    $DeletionDate = $TranscriptionJson.Deleted
                }

                #SaveforDeletionworked

                #try {
                #    $DeletionInformation  = [PSCustomObject]@{TranscriptionPath = $TranscriptionPath;Deletiondate = $DeletionDate } | ConvertTo-Json
                #    Add-Content -Path $DeletionWorkerPath -Value ($DeletionInformation  | Out-String) -Force -NoNewline
                #}
                #catch {
                #    $TranscriptionCompleted = $false
                #    Scriptlog "Failed to save deleted information"
                #}

                #Trying to figure out if script failed
                try {
                    $FailCheckFiles = Get-ChildItem $TranscriptionPath
                    if($FailCheckFiles.Count -le 6)
                    {
                        $TranscriptionCompleted = $false
                        Scriptlog "6 or fever files in transcription, assuming failure."
                    }

                    $StartComplete = (Get-Date $EndtTime) - (Get-Date $StartTime)

                    if($StartComplete.TotalSeconds -le 10)
                    {
                        $TranscriptionCompleted = $false
                        Scriptlog "Transcription took less than 10 seconds, assuming failure."
                    }

                }
                catch {
                    $TranscriptionCompleted = $false
                    Scriptlog $_
                }

                if($TranscriptionCompleted -eq $true)
                {
                    #Get the users transcriptionsfile collection, if no file is found just create the data in a variable
                    #If(Test-Path $UserTranscriptionsJsonPath)
                    #{
                    #    try {
                    #        $UserTranscriptions = $null
                    #        $UserTranscriptions = Get-Content -Path $UserTranscriptionsJsonPath | convertfrom-json
                    #        $UserTranscriptions +=[PSCustomObject]@{TranscriptRequestID = $TranscriptionToRun.TranscriptRequestID; TranscriptRequestStarted = $StartTime ; TranscriptRequestCompleted = $EndtTime}
#
                    #    }
                    #    catch {
                    #        Write-Host $_
                    #    }
                    #}
                    #else {
                    #    $UserTranscriptions =[PSCustomObject]@{TranscriptRequestID = $TranscriptionToRun.TranscriptRequestID; TranscriptRequestStarted = $StartTime ; TranscriptRequestCompleted = $EndtTime}
                    #}

                    #Get the transcription AudioLength
                    try {
                        $AudioDataJson = Get-Content $Jsonfilepath | ConvertFrom-Json
                    }
                    catch {
                        #Write-Host $_
                        Scriptlog $_
                    }
                    
                    #Export the data to the users transcription file (the library of transcriptions).
                    try {
                        $UserTranscriptions =[PSCustomObject]@{TranscriptRequestID = $TranscriptionToRun.TranscriptRequestID;TranscriptRequestCreated =  $QueueItemCreationTime ; TranscriptRequestStarted = $StartTime ; TranscriptRequestCompleted = $EndtTime; AudioLength = $AudioDataJson.AudioFileResults.AudioLengthInSeconds}
                        $UserTranscriptionsJson = $UserTranscriptions | ConvertTo-Json -Compress
                        #New-Item -ItemType File -Path $UserTranscriptionsJsonPath -Force -Value ($UserTranscriptionsJson | Out-String)
                        Add-Content -Path $UserTranscriptionsJsonPath -Value ($UserTranscriptionsJson | Out-String) -Force -NoNewline
                        Add-Content -Path "$($Config.Logpath)/transcriptions.jsonl" -Value ($UserTranscriptionsJson | Out-String) -Force -NoNewline
                        
                    }
                    catch {
                        #Write-Host $_
                        Scriptlog $_
                    }

                    # Update TranscriptionJson Start and Entime to show that the transcription has completed.
                    try {
                        $TranscriptionJsonNewData = [PSCustomObject]@{Language = $TranscriptionJson.Language; Created = $TranscriptionJson.Created; Started = $StartTime ; Ended = $EndtTime; Status = "Completed"; FileName = $TranscriptionJson.FileName ; Deleted = $DeletionDate; AudioLength = $AudioDataJson.AudioFileResults.AudioLengthInSeconds} | ConvertTo-Json
                        #New-Item -ItemType File -Path $TranscriptionJsonPath -Force -Value ($TranscriptionJsonNewData | Out-String)
                        Fileupdater -Filepath $TranscriptionJsonPath -Filedata $TranscriptionJsonNewData
                        Scriptlog "Transcription $($TranscriptionToRun.TranscriptRequestID) completed."
                        
                    }
                    catch {
                        #write-host $_
                        Scriptlog $_
                    }

                    #Transcription Queue item deletion
                    RemoveQueueItem -QueueItemPath $QueueItem -QueueID $($TranscriptionToRun.TranscriptRequestID)
                    #try {
                    #    Remove-Item -Path "$($Config.IncommingTranscriptionPath)/$($TranscriptionToRun.TranscriptRequestID).json" -Confirm:$false
                    #    #Write-host "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                    #    Scriptlog "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                    #}
                    #catch {
                    #    #rite-host "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                    #    #Write-Host $_
                    #    Scriptlog "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                    #    Scriptlog $_
                    #}
                }
                else {
                    #If transcription failed
                    try {
                        $TranscriptionJsonNewData = [PSCustomObject]@{Language = $TranscriptionJson.Language; Created = $TranscriptionJson.Created; Started = $StartTime ; Ended = $EndtTime; Status = "Error"; FileName = $TranscriptionJson.FileName; Deleted = $DeletionDate} | ConvertTo-Json
                        #New-Item -ItemType File -Path $TranscriptionJsonPath -Force -Value ($TranscriptionJsonNewData | Out-String)
                        Fileupdater -Filepath $TranscriptionJsonPath -Filedata $TranscriptionJsonNewData
                    }
                    catch {
                        #Write-Host $_
                        Scriptlog $_
                    }

                    #Transcription Queue item deletion
                    RemoveQueueItem -QueueItemPath $QueueItem -QueueID $($TranscriptionToRun.TranscriptRequestID)
                    #try {
                    #    Remove-Item -Path "$($Config.IncommingTranscriptionPath)/$($TranscriptionToRun.TranscriptRequestID).json" -Confirm:$false
                    #    #Write-host "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                    #    Scriptlog "Removed queue item $($TranscriptionToRun.TranscriptRequestID)"
                    #}
                    #catch {
                    #    #write-host "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                    #    #Write-Host $_
                    #    Scriptlog "Failed to remove $($TranscriptionToRun.TranscriptRequestID)"
                    #    Scriptlog $_
                    #}
                }
            }
        }
        else {
            RemoveQueueItem -QueueItemPath $QueueItem -QueueID $($TranscriptionToRun.TranscriptRequestID)
        }
    }
    else
    {
        Write-Host "$((Get-Date).ToUniversalTime().ToString("o")) - No file Found" -ForegroundColor Green
        Start-Sleep -seconds 5
        $DWDate = Get-Date
        #write-host "$($DWDate.hour)"    
        try{
            $DeletionWorkerData = Get-childitem -Path $($Config.UserBasePath) -Recurse | where {$_.name -eq "transcription.json"}
            #Write-Host $DeletionWorkerData.name
        }
        catch
        {
            Scriptlog $_
        }
        foreach($DWData in $DeletionWorkerData)
        {
            $DWDeletionDate  = $null
            try {
                $DWJson = Get-Content -Path $DWData.VersionInfo.FileName | ConvertFrom-Json
            }
            catch {
                Scriptlog $_
            }
            if($DWJson.Deleted)
            {
                $DWDeletionDate = get-date $DWJson.Deleted
                if($DWDate -gt $DWDeletionDate)
                {
                    try {
                        Remove-Item -Path $dwdata.DirectoryName -Recurse -Force
                        Scriptlog "$($dwdata.DirectoryName) deleted, deletiondate $($DWJson.Deleted)"
                    }
                    catch {
                        Scriptlog $_
                    }
                }
            }
        }
            
        
    }
}




