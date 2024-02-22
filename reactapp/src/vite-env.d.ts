/// <reference types="vite/client" />

// For IntelliSense of .env variables
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly VITE_AUTH_APPID: string;
    readonly VITE_AUTH_TENANTID: string;
    readonly VITE_AUTH_REDIRECT_URL: string;
    readonly VITE_AUTH_API_SCOPE: string;
    readonly VITE_REFRESH_INTERVAL_MS: number;
    readonly VITE_MAX_UPLOAD_SIZE_MB: number;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}