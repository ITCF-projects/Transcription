#https://learn.microsoft.com/en-us/azure/ai-services/speech-service/spx-basics?tabs=dockerinstall%2Cterminal

docker pull msftspeech/spx
docker run -it --rm `
-v "$pwd\testdata:/data" `
msftspeech/spx `
recognize `
--key none `
--host ws://host.docker.internal:5000/ `
--files "dip.wav" `
--format any `
--language sv-SE `
--region swedencentral `
--output each text `
--output each file result.each.tsv  `
--output all file result.all.tsv  `
--output vtt file result.vtt  `
--output srt file result.srt  `
--output batch json `
--output batch file result.json `
--log result.log
