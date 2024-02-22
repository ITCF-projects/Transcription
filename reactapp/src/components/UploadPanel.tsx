import { useState, useEffect } from 'react';
import { Icon, DefaultButton, Panel, PanelType, PrimaryButton, Dropdown, IDropdownOption, Label, TextField, Stack, ProgressIndicator } from '@fluentui/react';
import { AxiosError, AxiosProgressEvent } from 'axios';
import TranscriptionHelper from '../common/TranscriptionHelper';
import styles from '../App.module.scss'
import useApi from '../hooks/useApi';

interface IUploadPanel {
  isOpen: boolean;
  onDismiss: (refresh: boolean) => void;
}

const UploadPanel = (props: IUploadPanel): JSX.Element => {

  const { uploadTranscription } = useApi();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const [phrases, setPhrases] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [progress, setProgress] = useState<AxiosProgressEvent>();
  const [errorUpload, setErrorUpload] = useState<string>('');
  const [errorFile, setErrorFile] = useState<string>('');

  useEffect(() => {
    setUploading(false);
    setUploaded(false);
    setProgress(undefined);
    setSelectedFile(undefined);
    setSelectedLanguage('');
    setPhrases('');
    setErrorFile('');
    setErrorUpload('');
  }, [props.isOpen]);

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    setProgress(progressEvent);
  }

  const onClickUpload = () => {

    if (selectedFile && selectedLanguage) {
      setUploading(true);
      setErrorUpload('');

      const phrasesFile = new File([phrases], "phrases.txt", {
        type: "text/plain",
      });

      uploadTranscription(selectedLanguage, selectedFile, phrasesFile, onUploadProgress)
        .then(() => {
          console.log("File uploaded: " + selectedFile.name)
          setUploading(false);
          setUploaded(true);
          setProgress(undefined)
        })
        .catch((error: AxiosError) => {        
          console.log("Error uploading file", error);
          setErrorUpload("Error uploading file: " + error.message);
          setUploading(false);
          setUploaded(false);
          setProgress(undefined)
        });
      }
  
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length === 1) {
      const file = event.target.files[0];
      const maxFileSize = import.meta.env.VITE_MAX_UPLOAD_SIZE_MB * 1024 * 1024;
      if (file.size > maxFileSize) {
        setErrorFile(`Selected file ${ file.name } is too large (${ (file.size / 1024 / 1024).toFixed(0) } MB)`);
        setSelectedFile(undefined);
        return false;
      } else {
        setSelectedFile(file);
      }
    } else {
      setSelectedFile(undefined);
    }
    setErrorFile('');
    return true;
  }


  const lang_options: IDropdownOption[] = [
    { key: 'sv-se', text: 'Swedish' },
    { key: 'en-us', text: 'English' },
  ];  

  return (
    <Panel 
      className={ styles.panel }
      headerText='Create new transcription'
      isLightDismiss={true}
      onDismiss={ () => props.onDismiss(uploaded) } 
      isOpen={ props.isOpen }
      type={ PanelType.medium }
    >
      {!(uploading || uploaded) &&
      <div>
        <Label>File</Label>
        <input type="file" onChange={onFileChange} id='input-file' className={styles.selectFileInput} accept="audio/*, video/*"/>
        <label htmlFor='input-file'>
            <div className={styles.selectFileContainer}>
            { selectedFile ?
              <Stack horizontal horizontalAlign="center" tokens={ { childrenGap: 8 }}>
                <Icon iconName='FileCode' style={{fontSize: '16px'}}/>
                <div>{ selectedFile.name }</div>
              </Stack>
              :
              <Stack horizontal horizontalAlign="center" tokens={ { childrenGap: 8 }} >
                <Icon iconName='Upload' style={{fontSize: '16px'}}/>
                <div>Click to select audio or video file</div>
              </Stack>
            }
            </div>
        </label>
        <div className={styles.fieldDescription}>
            <div className={styles.warning}>{ errorFile }</div>
            <div>Max upload size: { import.meta.env.VITE_MAX_UPLOAD_SIZE_MB } MB</div>
        </div>

        <TextField 
          multiline={true}
          style={{height: '150px'}} 
          placeholder='Enter one term per row'
          label='Terms'
          value={ phrases } onChange={(_event, value) => setPhrases(value)}></TextField>

        <Dropdown
          placeholder="Select language"
          label="Language"
          options={lang_options}
          onChange={ (_event, option) => option && setSelectedLanguage(option?.key) }
        />
        
        <br/>
        <Stack horizontal horizontalAlign='end' tokens={ { childrenGap: 24 }} >
          <DefaultButton onClick={ () => props.onDismiss(false) }>Cancel</DefaultButton>
          <PrimaryButton onClick={ onClickUpload } disabled={ !selectedFile || !selectedLanguage }>Send for transcription</PrimaryButton>
        </Stack>
      </div>     
      }

      { (uploading || uploaded) && selectedFile &&
        <div>
          <Label>File</Label>
          <div className={styles.fileContainer}>
            <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 8 }} >
              <Icon iconName='FileCode' style={{fontSize: '20px'}}/>
              <div>{ selectedFile.name }</div>
            </Stack>
          </div>    
        </div>
      }

      { uploading && progress &&
      <div className={styles.m4}>
        <ProgressIndicator label="Uploading" description={ TranscriptionHelper.formatFileSize(progress.loaded) + ' / ' + TranscriptionHelper.formatFileSize(progress.total)} percentComplete={ progress.progress } />
      </div>
      }
      { uploaded &&
      <div className={styles.m4}>
        <p>File is uploaded and placed in queue.</p>
        <DefaultButton onClick={ () => props.onDismiss(true) }>Close</DefaultButton>
      </div>
      }

      { errorUpload &&
      <p className={styles.warning}>{errorUpload}</p>
      }

    </Panel>
  );
}

export default UploadPanel;
