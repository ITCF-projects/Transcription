export interface ITranscriptionInfo
{
    fileName: string;
    identity?: string;
    language: string;
    created?: string;
    started?: string;
    ended?: string;
    deleted?: string
    status?: string;
    costCenter?: string;
    costActivity?: string;
    audioLength?: number;
    queuePosition?: number;
    results: IEntry[];
}

export interface IEntry {
    fileName: string;
    identity?: string;
    size: number;
    lastWriteTimeUtc: string;
}

export interface ICostReport   {
    userEPPN: string,
    costCenter: string,
    costActivity: string,
    requestID: string,
    created: string,
    started: string,
    completed: string,
    length: number
}
