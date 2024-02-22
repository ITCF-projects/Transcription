import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import axios, { AxiosProgressEvent, AxiosRequestConfig, AxiosResponse } from 'axios';

const useApi = () => {

  const { instance, accounts } = useMsal();

  const getTokenAndCallApi = async (url: string, config?: AxiosRequestConfig, headers?: any): Promise<any> => {

    const accessTokenRequest = {
      scopes: [import.meta.env.VITE_AUTH_API_SCOPE],
      account: accounts[0],
    };
  
    try {
      // Silently acquires an access token which is then attached to a request
      const response = await instance.acquireTokenSilent(accessTokenRequest);
      //return await fetchWithToken(url, response.accessToken);

      const axiosConfig: AxiosRequestConfig = {
        ...config,    
        url: url,
        headers: {
            ...headers,
            Accept: 'application/json',            
            Authorization: 'Bearer ' + response.accessToken
        }
      };

      return await axios(axiosConfig)
        .then((response: AxiosResponse) => {
          if (response.status == 200) {
            return response;
          } else {
            throw new Error("Server returned http " + response.status + " " + response.statusText);
          }
      })

    } 
    catch(error) {
      console.log(error);
      //Acquire token silent failure, and send an interactive request
      if (error instanceof InteractionRequiredAuthError) {
          instance.acquireTokenRedirect(accessTokenRequest);
      } else {
        throw error;
      }
    }
  }

  const uploadTranscription = async (selectedLanguage: string, file: File, phrasesFile: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<any> => {

    const data = new FormData();
    data.append("file", file)
    data.append("phrases", phrasesFile); // TODO?
    
    const config: AxiosRequestConfig = {
      method: 'POST',
      data: data,
      onUploadProgress: onUploadProgress
    };

    const headers: any = { 
      "Content-Type": "multipart/form-data" 
    };

    return await getTokenAndCallApi('/api/transcription?language=' + selectedLanguage, config, headers);
  }


  const downloadFileText = async (item: IEntry, onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<string> => {
    const config: AxiosRequestConfig = { 
      responseType: 'blob',
      onDownloadProgress: onDownloadProgress
    };

    return await getTokenAndCallApi('/api/result?identity=' + item.identity, config)
        .then(response => {
          return response.data.text();
        })
        .then(text => {
          return text
        })
  }

  const downloadFile = async (item: IEntry, onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<void> => {
    const config: AxiosRequestConfig = { 
      responseType: 'blob',
      onDownloadProgress: onDownloadProgress
    };

    return await getTokenAndCallApi('/api/result?identity=' + item.identity, config )        
        .then(response => {
            const objectUrl = window.URL.createObjectURL(response.data);

            const anchor = document.createElement("a");
            document.body.appendChild(anchor);
            anchor.href = objectUrl;
            anchor.download = item.fileName;
            anchor.click();

            window.URL.revokeObjectURL(objectUrl);
        });
  }

  const deleteTranscription = async (item: ITranscriptionInfo): Promise<string> => {
    const config: AxiosRequestConfig = { 
      method: 'DELETE',
    };
    return await getTokenAndCallApi('/api/transcription?identity=' + item.identity, config);
  }

  const getTranscriptions = async (): Promise<any> => {
    return await getTokenAndCallApi('/api/transcriptions')
      .then(response => {
          return response.data;
      });
  }

  return { 
    getTranscriptions, 
    uploadTranscription,
    deleteTranscription,
    downloadFile,
    downloadFileText,
  }
};

export default useApi;