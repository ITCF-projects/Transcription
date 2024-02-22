param (
    [Parameter(mandatory=$true)]
    [string] $apiKey)
# Prerequisite:
# Docker installed on local machine

# Optional pull
# docker pull mcr.microsoft.com/azure-cognitive-services/speechservices/speech-to-text:3.14.0-amd64-sv-se
#  docker pull mcr.microsoft.com/azure-cognitive-services/speechservices/speech-to-text:latest


docker run --rm -it -p 5000:5000 --memory 8g --cpus 4 `
mcr.microsoft.com/azure-cognitive-services/speechservices/speech-to-text:4.5.0-amd64-sv-se `
Eula=accept `
Billing=https://swedencentral.api.cognitive.microsoft.com/sts/v1.0/issuetoken `
ApiKey=$apiKey

# For more control: use custom speech to text models
#
#docker run --rm -it -p 5000:5000 --memory 8g --cpus 4 `
#-v "$pwd\custommodels:/usr/local/models" `
#mcr.microsoft.com/azure-cognitive-services/speechservices/custom-speech-to-text `
#DisplayLocale=sv-se `
#WFSTITNID=DFD6820191840CDD4C04609091986E5C7DAB24F0CC97E1F40767042626874BDD `
#RESCOREID=790614EB2E4DDC2711B91F51FD008EC6290963770564C795C956EC663BD3C855 `
#PUNCTID=454A83811F13927E403DC693B8E51FB87DD37F518A38B66B8B63E1106C4A281F `
#MODELID=63fc9dee-e146-4c05-be8c-949b9a03654f `
#Eula=accept `
#Billing=https://swedencentral.api.cognitive.microsoft.com/sts/v1.0/issuetoken `
#ApiKey=$apiKey

# One time install:
# dotnet tool install --global Microsoft.CognitiveServices.Speech.CLI

# Configure SPX
# spx --% config @region --set swedencentral

# interact:
# spx --% recognize --key none --host ws://localhost:5000/ --file testdata\dip.wav --language sv-SE
#
# spx --% recognize --key none --host ws://localhost:5000/ --file testdata\dip.wav --language sv-SE  --output each text --output each file out.each.tsv --output all file out.all.tsv --output vtt file out.vtt --output srt file out.srt --output batch json

