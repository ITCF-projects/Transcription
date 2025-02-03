global using System.Threading.Tasks;
global using System;
global using System.Collections.Generic;
global using System.Linq;

// main loop
using FolderWatcher;
using Common.Impl;

var fs = new FileSystem();
var config = AppConfig.Load(fs);
var notifications = new NotificationHandler(config);
var transcriber = new Transcriber(config, notifications, fs);
var auditlogSettings = new AuditLogSettings(config);
var auditLogger = new AuditLogger(fs, auditlogSettings);
var cleanup = new Cleanup(config, auditLogger, fs);
await cleanup.StartupClean();
while (true)
{
    if (transcriber.TranscriptionCount < config.SimultaneousTranscriptions)
    {
        var item = transcriber.Next();
        await transcriber.Transcribe(item);
    }
    if (transcriber.TranscriptionCount > 0 && DateTime.Now.Second % 10 == 0)
    {
        Console.WriteLine($"STATUS@{DateTime.Now:hh:mm:ss}: {transcriber.TranscriptionCount} active transcriptions running...");
    }
    System.Threading.Thread.Sleep(1000);
    if(cleanup.TimeToClean())
    {
        await cleanup.CleanExpired();
    }
}
