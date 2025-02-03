import { useEffect, useState } from 'react';
import { ProgressIndicator, IContextualMenuItem, Toggle, DetailsList, DetailsListLayoutMode, SelectionMode, Dialog, DialogFooter, IColumn, IconButton, DefaultButton, PrimaryButton, CommandButton, Icon, Label, Link, Panel, PanelType, Stack } from '@fluentui/react';
import { AxiosError, AxiosProgressEvent } from 'axios';
import TranscriptionHelper from '../common/TranscriptionHelper';
import FileStatus from '../common/FileStatus';
import styles from '../App.module.scss'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import useApi from '../hooks/useApi';
import PreviewModal from './PreviewModal';
import { ITranscriptionInfo, IEntry } from '../App.types';
dayjs.extend(relativeTime)
dayjs.extend(duration)

interface IDetailsPanel {
  file: ITranscriptionInfo,
  isOpen: boolean;  
  onDismiss: (refresh: boolean) => void;
}

const DetailsPanel = (props: IDetailsPanel): JSX.Element => {

  const { downloadFile, deleteTranscription } = useApi();

  const [previewFile, setPreviewFile] = useState<IEntry>();
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showLogFiles, setShowLogFiles] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<AxiosProgressEvent>();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setPreviewFile(undefined);
  }, [props.isOpen]);

  const onClickPreview = (item: IEntry) => {
    setPreviewFile(item);
    setShowPreviewModal(true);
  }

  const onDismissPreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewFile(undefined);
  }

  const onDownloadProgress = (progressEvent: AxiosProgressEvent): void => {
    setProgress(progressEvent);
  }

  const onClickDownload = (item: IEntry) => {
    setLoading(true);
    setErrorMessage('');

    downloadFile(item, onDownloadProgress)
      .then(() => {
          setLoading(false);
          setProgress(undefined);
      })
      .catch((error: AxiosError) => {        
        console.log("Error downloading file", error);
        setErrorMessage("Error downloading file: " + error.message);
        setLoading(false);
        setProgress(undefined);
      });
  }


  const onClickDeleteConfirmed = () => {
    setShowConfirmDialog(false);
    setErrorMessage('');

    deleteTranscription(props.file).then(() => {
      console.log("Transcription deleted: " + props.file.identity);
      props.onDismiss(true);
    })
    .catch((error: AxiosError) => {        
      console.log("Error deleting transcription", error);
      setErrorMessage("Error deleting transcription: " + error.message);
    });

  }

  const columns: IColumn[] = [
    { key: 'fileName', name: 'Filename', minWidth: 100, maxWidth:200, isResizable: true,
      onRender: (item: IEntry) => {
        return (
            <Link onClick={() => onClickDownload(item)} title={item.fileName}>{item.fileName}</Link>
        );          
      },
    },
    { key: 'size', name: 'Size', minWidth: 60, maxWidth:80, isResizable: true,
      onRender: (item: IEntry) => {
        return (
          <div>{ TranscriptionHelper.formatFileSize(item.size) }</div>
        );          
      },
    },
    { key: 'preview', name: 'Preview', minWidth: 60, maxWidth:80, isResizable: true,
      onRender: (item: IEntry) => {
        return (
          <IconButton style={{ height: '20px' }} iconProps={ { iconName: 'DocumentSearch' } } onClick={() => { onClickPreview(item) } } title={'Preview ' + item.fileName}></IconButton>
        );          
      },
    },
    { key: 'download', name: 'Download', minWidth: 60, maxWidth:80, isResizable: true,
      onRender: (item: IEntry) => {
        return (
          <IconButton style={{ height: '20px' }} iconProps={ { iconName: 'Download'} } onClick={() => { onClickDownload(item) } } title={'Download ' + item.fileName}></IconButton>
        );          
      },
    },

  ];

  const dictionaryFileEntry: IEntry = {
    fileName: 'dictionary.txt',
    size: 0,
    identity: props.file.identity + '/dictionary.txt',
    lastWriteTimeUtc: ''
  };

  const transcriptionFileEntry: IEntry = {
    fileName: props.file.fileName,
    size: 0,
    identity: props.file.identity + '/' + props.file.fileName,
    lastWriteTimeUtc: ''
  };

  const menuItemsDownload: IContextualMenuItem[] = TranscriptionHelper.getSubtitleMenuItems(props.file, 'download');
  const menuItemsPreview: IContextualMenuItem[] = TranscriptionHelper.getSubtitleMenuItems(props.file, 'preview');
 
  const duration: string = (props.file.started && props.file.ended ? dayjs.duration( dayjs(props.file.ended).diff(props.file.started)).as('minutes').toFixed(0) : '');

  return (
    <Panel 
      className={ styles.panel }
      headerText={ props.file.fileName }
      isLightDismiss={true}
      onDismiss={ () => props.onDismiss(false) } 
      isOpen={ props.isOpen }
      type={ PanelType.medium }
    >
      {props.file &&
      <div>
        <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 20 }}>
            <div>Uploaded { dayjs(props.file.created).format("YYYY-MM-DD") }</div>

            {props.file.deleted &&
            <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 4 }} className={styles.warning}>
              <Icon iconName='Error' />
              <div title={ TranscriptionHelper.formatDate(props.file.deleted) }>Automatically deleted { dayjs(props.file.deleted).fromNow() }</div>
            </Stack>
            }
        </Stack>
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' tokens={ { childrenGap: 8 }} style={{ margin: '30px 0'}}>
            <FileStatus file={ props.file } />
            <CommandButton iconProps={ {iconName: 'Delete'}} onClick={ () => setShowConfirmDialog(true) }>Delete</CommandButton>
        </Stack>

        <div className={ styles.timeTable } >
          <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm6 ms-md3">
                <h3>Placed in queue</h3>
                { TranscriptionHelper.formatDate(props.file.created) }
              </div>
              <div className="ms-Grid-col ms-sm6 ms-md3">
                <h3>Started</h3>
                { TranscriptionHelper.formatDate(props.file.started) }
              </div>
              <div className="ms-Grid-col ms-sm6 ms-md3">
                <h3>Ended</h3>
                { TranscriptionHelper.formatDate(props.file.ended) }
              </div>
              <div className="ms-Grid-col ms-sm6 ms-md3">
                <h3>Transcription time</h3>
                { duration ? duration + ' minutes' : '-' }
              </div>
            </div>
          </div>
        </div>

        <h2 className={styles.subheading}>Input</h2>

        <Label>File</Label>
        <div className={styles.fileContainer}>
          <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 8 }} >
            <Icon iconName='FileCode' style={{fontSize: '20px'}}/>
            <div>{ props.file.fileName }</div>
          </Stack>
          <DefaultButton iconProps={ { iconName: 'Download' } } onClick={() => { onClickDownload(transcriptionFileEntry) } }>Download</DefaultButton>
        </div>

        {props.file.audioLength && props.file.audioLength > 0 ?
          <div className={styles.fieldDescription} title={props.file.audioLength + ' seconds'}>            
            Audio length:{' '}
            { props.file.audioLength > 60 ? 
              (props.file.audioLength / 60).toFixed() +  ' minutes'
              : 
              props.file.audioLength.toFixed(0) + ' seconds' }
          </div>
          : 
          <></>
        }

        <Label>Terms</Label>
        <div className={styles.fileContainer}>
          <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 8 }} >
            <Icon iconName='FileCode' style={{fontSize: '20px'}}/>
            <div>{ dictionaryFileEntry.fileName }</div>
          </Stack>
          <Stack horizontal verticalAlign='center' tokens={ { childrenGap: 8 }} >        
            <DefaultButton iconProps={ { iconName: 'DocumentSearch' } } onClick={() => { onClickPreview(dictionaryFileEntry) } }>Preview</DefaultButton>
            <DefaultButton iconProps={ { iconName: 'Download'} } onClick={() => { onClickDownload(dictionaryFileEntry) } }>Download</DefaultButton>
          </Stack>
        </div>

        <div className={ styles.timeTable } >
          <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm6 ms-md3">
                <h3>Language</h3>
                <div className={styles.mb2}>{ TranscriptionHelper.languageName(props.file.language) }</div>
              </div>

              { import.meta.env.VITE_BILLING_COSTCENTER_VISIBLE === "true" &&
                <div className="ms-Grid-col ms-sm6 ms-md3">
                  <h3>Cost center</h3>
                  <div>{ props.file.costCenter ?? '' }</div>
                </div>
              }
              { import.meta.env.VITE_BILLING_COSTACTIVITY_VISIBLE === "true" &&
                <div className="ms-Grid-col ms-sm6 ms-md3">
                  <h3>Cost ativity</h3>
                  <div>{ props.file.costActivity ?? '' }</div>
                </div>
              }
            </div>
          </div>
        </div>

        <h2 className={styles.subheading}>Result</h2>

        { props.file.status === 'Completed' && menuItemsDownload.length > 0 &&
          <Stack horizontal tokens={ { childrenGap: 8 }} className={styles.mt2}>
            <DefaultButton text="Preview transcription" iconProps={ { iconName: 'DocumentSearch'} }
              menuProps={ {
                items: menuItemsPreview,
                onItemClick: (_event, item) => { onClickPreview(item?.data) }
              }}>
            </DefaultButton>
            <PrimaryButton text="Download transcription" iconProps={ { iconName: 'Download'} }
              menuProps={ {
                items: menuItemsDownload,
                onItemClick: (_event, item) => { onClickDownload(item?.data) } 
              }}>
            </PrimaryButton>
          </Stack>
        }

        <div className={styles.m4}>            
          <Toggle onText="Show logfiles" offText="Show logfiles" checked={showLogFiles} onChange={(_event, checked) => setShowLogFiles(checked || false)} />
        </div>


        { showLogFiles && props.file.results.length > 0 &&
        <DetailsList
          items={ props.file.results }
          columns={columns}
          compact={true}
          layoutMode={DetailsListLayoutMode.justified}
          //selection={selection}
          //selectionPreservedOnEmptyClick={false}
          selectionMode={SelectionMode.none}
        />
        }

      </div>
      }

      { errorMessage &&
      <p className={styles.warning}>{errorMessage}</p>
      }

      { loading && progress &&
      <ProgressIndicator label="Downloading" description={ TranscriptionHelper.formatFileSize(progress.loaded) + ' / ' + TranscriptionHelper.formatFileSize(progress.total)} percentComplete={ progress.progress } />
      }

      <PreviewModal file={ previewFile } isOpen={showPreviewModal} onDismiss={ onDismissPreviewModal} />

      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={() => setShowConfirmDialog(false)}
        dialogContentProps={ { title: 'Delete the file and all transcriptions?' }}
        // modalProps={dialogModalProps}
      >
        <DialogFooter>
          <PrimaryButton onClick={ onClickDeleteConfirmed } text="Yes" />
          <DefaultButton onClick={() => setShowConfirmDialog(false)} text="No" />
        </DialogFooter>
      </Dialog>

    </Panel>
  );
}

export default DetailsPanel;