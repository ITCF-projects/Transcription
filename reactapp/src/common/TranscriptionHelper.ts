import { IContextualMenuItem, ContextualMenuItemType } from '@fluentui/react';
import dayjs from 'dayjs';

export default class TranscriptionHelper {

    public static languageName(locale: string): string {
        switch(locale) {
          case 'sv-se': return 'Swedish';
          case 'en-us': return 'English';
          default: return locale;
        }
    }

    public static formatDate(date?: string): string {
        return (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-');
    }

    public static formatFileSize(size: number): string {
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    
    public static getSubtitleMenuItems(file: ITranscriptionInfo, keyPrefix? :string): IContextualMenuItem[] {

        const srt = file.results.find(entry => entry.fileName.match(/\.(srt)$/i));
        const vtt = file.results.find(entry => entry.fileName.match(/\.(vtt)$/i));
        const tsv = file.results.find(entry => entry.fileName.match(/\.(tsv)$/i) && !entry.fileName.match(/\.each\.tsv/i));
        const json = file.results.find(entry => entry.fileName.match(/\.(json)$/i));

        // Files manually sorted by format
        const sortedFormats: IEntry[] = [];
        if (srt) sortedFormats.push(srt);
        if (vtt) sortedFormats.push(vtt);
        if (tsv) sortedFormats.push(tsv);
        if (json) sortedFormats.push(json);

        const menuItems: IContextualMenuItem[] = sortedFormats.map((item) => {
            const fileType = item.fileName.substring(item.fileName.lastIndexOf('.') + 1);
            let text = item.fileName;
            
            switch (fileType) {
                case 'srt':  text = 'SRT - Subtitle'; break;
                case 'vtt':  text = 'VTT - WebVTT'; break;
                case 'tsv':  text = 'TSV - Tab-separated'; break;
                case 'json': text = 'JSON'; break;
            }
            
            return {
                key: (typeof(keyPrefix) !== 'undefined' ? keyPrefix : 'menuItem') + item.fileName,
                text: text,
                data: item
            }
        });

        return menuItems;
    }

}