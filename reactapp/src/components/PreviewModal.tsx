import { useEffect, useState } from 'react';
import { FontWeights, mergeStyleSets, getTheme, IButtonStyles, Modal, ProgressIndicator, IconButton, TextField } from '@fluentui/react';
import { AxiosError, AxiosProgressEvent } from 'axios';
import TranscriptionHelper from '../common/TranscriptionHelper';
import styles from '../App.module.scss'

import useApi from '../hooks/useApi';

interface IPreviewModal {
  file?: IEntry,
  isOpen: boolean;  
  onDismiss: () => void;
}

const PreviewModal = (props: IPreviewModal): JSX.Element => {

  const { downloadFileText } = useApi();

  const [previewText, setPreviewText] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<AxiosProgressEvent>();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setPreviewText('');
    setProgress(undefined);

    if (props.file) {
      previewFile(props.file);
    }

  }, [props.file]);

  const onDownloadProgress = (progressEvent: AxiosProgressEvent): void => {
    setProgress(progressEvent);
  }

  const previewFile = (item: IEntry) => {
    setPreviewLoading(true);
    setErrorMessage('');

    downloadFileText(item, onDownloadProgress)
      .then(text => {
          setPreviewText(text);
          setPreviewLoading(false);
          setProgress(undefined);
      })
      .catch((error: AxiosError) => {        
        console.log("Error downloading file", error);
        setErrorMessage("Error downloading file: " + error.message);
        setPreviewLoading(false);
        setProgress(undefined);
      });

  }

  const theme = getTheme();
  const contentStyles = mergeStyleSets({
    container: {
      display: 'flex',
      flexFlow: 'column nowrap',
      alignItems: 'stretch',
      width: '80%',
      height: '80%',
      maxWidth: '1024px',
    },
    header: [
      // eslint-disable-next-line deprecation/deprecation
      theme.fonts.xLarge,
      {
        flex: '1 1 auto',
        borderTop: `4px solid ${theme.palette.themePrimary}`,
        color: theme.palette.neutralPrimary,
        display: 'flex',
        alignItems: 'center',
        fontWeight: FontWeights.semibold,
        padding: '12px 12px 14px 24px',
      },
    ],
    heading: {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.semibold,
      fontSize: 'inherit',
      margin: '0',
    },
    body: {
      flex: '4 4 auto',
      padding: '0 24px 24px 24px',
      overflowY: 'hidden',
      height: 'calc(100% - 92px)',
      selectors: {
        '[class ^= "ms-TextField"]': { height: '100%' },
      },
    },
  });
  
  const iconButtonStyles: Partial<IButtonStyles> = {
    root: {
      color: theme.palette.neutralPrimary,
      marginLeft: 'auto',
      marginTop: '4px',
      marginRight: '2px',
    },
    rootHovered: {
      color: theme.palette.neutralDark,
    },
  };

  return (
    <Modal
        titleAriaId='modal_title'
        isOpen={ props.isOpen }
        onDismiss={ props.onDismiss }
        isBlocking={false}
        containerClassName={contentStyles.container}
    >   
      <div className={contentStyles.header}>
        <h2 className={contentStyles.heading} id='modal_title'>
          { props.file ? props.file.fileName : ''}
        </h2>
        <IconButton iconProps={{ iconName: 'Cancel'}} styles={ iconButtonStyles } ariaLabel='Close popup' onClick={ props.onDismiss }/>
      </div>
      <div className={contentStyles.body}>
        {progress &&
          <ProgressIndicator label="Downloading" description={ TranscriptionHelper.formatFileSize(progress.loaded) + ' / ' + TranscriptionHelper.formatFileSize(progress.total)} percentComplete={ progress.progress } />
        }
        {!(previewLoading || errorMessage) && 
          <TextField multiline={true} value={previewText} resizable={false} style={{ fontFamily: 'monospace' }} />
        }
        { errorMessage &&
        <p className={styles.warning}>{errorMessage}</p>
        }
      </div>
    </Modal>

  );
}

export default PreviewModal;