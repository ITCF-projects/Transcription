interface ITranscriptionInfo
{
    fileName: string;
    identity?: string;
    language: string;
    created?: string;
    started?: string;
    ended?: string;
    deleted?: string
    status?: string;
    audioLength?: number;
    results: IEntry[];
}

interface IEntry {
    fileName: string;
    identity?: string;
    size: number;
    lastWriteTimeUtc: string;
}