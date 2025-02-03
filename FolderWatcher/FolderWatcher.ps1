dotnet publish -r linux-x64 --self-contained true
docker build -t folderwatcher .
docker run -it --rm -v "$pwd\..\Testdata:/appdata" folderwatcher