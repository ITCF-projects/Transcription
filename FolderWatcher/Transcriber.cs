using Common;
using System.Data;
using System.Diagnostics;
using System.Text.Json.Nodes;

namespace FolderWatcher
{
    public class Transcriber(AppConfig _config, NotificationHandler _notifications, IFileSystem _fs)
    {
        private readonly SynchronizedCollection<Process> _transcriptions = [];
        
        public int TranscriptionCount => _transcriptions.Count;
        
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public TranscriptionInfo? Next()
        {
            var result = TranscriptionInfo.List(_config.FileBasePath, _fs)
                .Select(s => TranscriptionInfo.Load(s, _fs))
                .Where(x => "new" == x.Status)
                .OrderBy(x => x.Created)
                .Select((s,i) =>
                    {
                        s.QueuePosition = i;
                        s.Deleted = s.Created?.AddDays(_config.DeleteDays);
                        s.Persist("Updating Queue position", _fs).Wait();
                        return s;
                    })
                .ToList();
            return result.FirstOrDefault();
        }
        public async Task Transcribe(TranscriptionInfo? item)
        {
            if (item == null)
            {
                return;
            }
            item.Status = "Transcribing";
            item.Started = DateTime.UtcNow;
            await item.Persist("Starting transcription", _fs);
            var url = item.Language?.ToLower() == "sv-se" ? "ws://transcribeSV:5000/": "ws://transcribeEN:5000/";
            var info = new ProcessStartInfo()
            {
                FileName = "spx",
                Arguments =
                    $"recognize " +
                    $"--key none " +
                    $"--host {url} " +
                    $"--file \"{item.FileName}\" " +
                    $"--language {item.Language} " +
                    $"--format any " +
                    $"--region swedencentral " +
                    $"--output each text " +
                    $"--output each file \"{item.FileName}.each.tsv\" " +
                    $"--output all file \"{item.FileName}.tsv\" " +
                    $"--output vtt file \"{item.FileName}.vtt\" " +
                    $"--output srt file \"{item.FileName}.srt\" " +
                    $"--output batch json " +
                    $"--output batch file \"{item.FileName}.json\" " +
                    $"--phrases @dictionary.txt " +
                    $"--log \"{item.FileName}.log\"",
                WorkingDirectory = item.Directory(_fs),
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            
            try
            {
                Console.Write($"Starting Transcription of ");
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.Write($"{item}");
                Console.ResetColor();
                Console.WriteLine($" with {_transcriptions.Count} transcriptions allready processing.");
                var transcription = Process.Start(info) ?? throw new Exception("Unable to start transcription");
                _transcriptions.Add(transcription);
                transcription.EnableRaisingEvents = true;
                transcription.Exited += (x, y) =>
                {
                    try
                    {
                        _transcriptions.Remove(transcription);
                        Console.Write($"Done transcribing ");
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.Write($"{item}");
                        Console.ResetColor();
                        Console.WriteLine($" with {_transcriptions.Count} transcriptions still processing.");
                        item.Ended = DateTime.UtcNow;
                        item.AudioLength = GetAudioLength(_fs.Path.Combine(item.Directory(_fs), $"{item.FileName}.json"));
                        item.Status = _fs.Directory.Exists(item.Directory(_fs))
                            ? item.AudioLength < 1 ? "Unsupported" : "Completed"
                            : "Deleted";
                        item.Persist("Done transcribing", _fs).Wait();
                        var sentTo = _notifications.SendNotification(item);
                        TranscriptionResult.CreateFrom(item, sentTo, _fs).Persist(_fs).Wait();
                        CostReport.CreateFrom(item, sentTo, _fs).Persist(_config.CostCenterPath, _fs).Wait();
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Caught exception {e.Message} for {item} with {_transcriptions.Count} processing;");
                        item.Status = "Error";
                        item.Ended = DateTime.UtcNow;
                        item.Persist("Exception while transcribing;", _fs).Wait();
                    }
                };
                transcription.OutputDataReceived += (obj, args) => AppendToFile(_fs.Path.Combine(item.Directory(_fs), $"{item.FileName}.stdout.log"), $"{args.Data ?? "NULL"}\r\n", transcription);
                transcription.ErrorDataReceived  += (obj, args) => AppendToFile(_fs.Path.Combine(item.Directory(_fs), $"{item.FileName}.stderr.log"), $"{args.Data ?? "NULL"}\r\n", transcription);
                transcription.BeginErrorReadLine();
                transcription.BeginOutputReadLine();
            }
            catch (Exception e)
            {
                Console.WriteLine($"Caught exception {e.Message} for {item} with {_transcriptions.Count} processing.");
                item.Status = "Error";
                item.Ended = DateTime.UtcNow;
                await item.Persist("Exception while transcribing.", _fs);
            }
        }
        private void AppendToFile(string file, string text, Process? process)
        {
            try
            {
                _fs.File.AppendAllText(file, text);
            }
            catch(Exception e)
            {
                Console.WriteLine($"Failed to append {text} to {file} with error: {e}");
                process?.Kill(true);
            }

        }
        private double GetAudioLength(string path)
        {
            if (!_fs.File.Exists(path))
                return -1;
            return JsonNode.Parse(_fs.File.OpenRead(path))?["AudioFileResults"]?[0]?["AudioLengthInSeconds"]?.GetValue<double>() ?? -1;
        }
    }
}