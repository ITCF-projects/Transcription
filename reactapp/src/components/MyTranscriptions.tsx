import React, { useState, useEffect } from 'react';
import styles from '../App.module.scss'
import { DefaultButton, IconButton, DetailsListLayoutMode, CompoundButton, IColumn, Link, SelectionMode, ShimmeredDetailsList } from '@fluentui/react';
import { AxiosError } from 'axios';
import DetailsPanel from './DetailsPanel';
import UploadPanel from './UploadPanel';
import TranscriptionHelper from '../common/TranscriptionHelper';
import FileStatus from '../common/FileStatus';
import useApi from '../hooks/useApi';


const MyTranscriptions = (): JSX.Element => {

  const { getTranscriptions, downloadFile } = useApi();

  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [detailsFile, setDetailsFile] = useState<ITranscriptionInfo>();
  const [showShimmer, setShowShimmer] = useState<boolean>(true);  
  const [files, setFiles] = useState<ITranscriptionInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  let loading: boolean = false;

  useEffect(() => {
    getFileList(true);

    // Auto refresh every 5sec
    const interval = setInterval(() => {

      // Only refresh if brower has focus (save resources)
      if (document.visibilityState == 'visible') {
        if (!loading) {
          console.log("Refresh, interval: " + import.meta.env.VITE_REFRESH_INTERVAL_MS);
          getFileList(false);
        } else {
          console.log("Skip refresh (still loading)");
        }
      } else {
        console.log("Skip refresh (browser not visible)");
      }
    }, import.meta.env.VITE_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    }

  }, []);

  useEffect(() => {
    if (showDetailsPanel && detailsFile) {
      const newDetailsFile = files.find(f => f.identity === detailsFile.identity);
      if (newDetailsFile) {
        setDetailsFile(newDetailsFile);
      }
    }
  }, [files]);

  const openDetailsPanel = (file: ITranscriptionInfo) => {
    setDetailsFile(file);
    setShowDetailsPanel(true);
  }

  const _copyAndSort = <T,>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] => {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }; 

  const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newFiles = _copyAndSort(files, currColumn.fieldName!, currColumn.isSortedDescending);
    setFiles(newFiles);   
    setColumns(newColumns);    
  };

  const initialColumns: IColumn[] = 
  [
    { key: 'fileName', fieldName: 'fileName', name: 'Filename', minWidth:100, isResizable: true,
      onRender: (file: ITranscriptionInfo) => {
        return (
            <Link className={styles.detailsListCell} onClick={() => openDetailsPanel(file)} title={file.fileName}>{file.fileName}</Link>
        );
      },
    },
    { key: 'language', fieldName: 'language', name: 'Language', minWidth: 80, maxWidth:100, isResizable: true,
      className: styles.hiddenSM, 
      headerClassName: styles.hiddenSM,
      onRender: (file: ITranscriptionInfo) => {
        return (
          <div className={styles.detailsListCell}>{ TranscriptionHelper.languageName(file.language) }</div>
        );          
      },
    },
    { key: 'status', fieldName: 'status', name: 'Status', minWidth: 120, maxWidth:140, isResizable: true,
      onRender: (file: ITranscriptionInfo) => {
        return (
          <div className={styles.detailsListCell}><FileStatus file={ file } /></div>
        );          
      },
    },
    { key: 'created', fieldName: 'created', name: 'Upload date', minWidth: 100, maxWidth:120, isResizable: true,
      isSorted: true,
      isSortedDescending: true,
      onRender: (file: ITranscriptionInfo) => {        
        return (
          <div className={styles.detailsListCell}>{ TranscriptionHelper.formatDate(file.created) }</div>
        );      
      },
    },
    { key: 'download', name: '', minWidth: 120, maxWidth:160, isResizable: true,
      className: styles.hiddenMD, 
      headerClassName: styles.hiddenMD,
      onRender: (file: ITranscriptionInfo) => {        
        if (file.status === 'Completed') {
          const menuItems = TranscriptionHelper.getSubtitleMenuItems(file);
          return (
            menuItems.length > 0 ? 
            <DefaultButton text="Download" menuProps={
                {
                  items: menuItems,
                  onItemClick: (_event, item) => { downloadFile(item?.data) }
                } 
              }
            />
            : 
            <div></div>            
          );          
        } else {
          return (<div></div>);
        }
      },
    },
    { key: 'show', name: '', minWidth: 20, maxWidth:20, isResizable: true,
      className: styles.hiddenSM, 
      headerClassName: styles.hiddenSM,
      onRender: (file: ITranscriptionInfo) => {
        return (
            <IconButton 
              iconProps={ { iconName: 'ChevronRightMed'} } 
              style={{textAlign: 'right'}}
              ariaHidden={true}
              onClick={() => openDetailsPanel(file)}>                            
            </IconButton>
        );
      },
    },
  ];
  
  const [columns, setColumns] = useState<IColumn[]>(initialColumns);

  // Attach onColumnClick on each render (otherwise files is empty in _onColumnClick)
  // ref: https://stackoverflow.com/questions/62373062/fluentui-detailslist-oncolumnclick-with-react-hooks-gives-empty-items
  columns.forEach(c => { c.onColumnClick = _onColumnClick });

  const getFileList = async (showLoading: boolean) => {
    loading = true;

    if (showLoading) {
      setShowShimmer(true);
    }

    getTranscriptions()
      .then((data: ITranscriptionInfo[]) => {
        console.log("getTranscriptions:");
        console.log(data);

        const sortColumn = columns.find(c => c.isSorted);
        if (sortColumn && sortColumn.fieldName) {
          data = _copyAndSort(data, sortColumn.fieldName, sortColumn.isSortedDescending);
        }
        setFiles(data);
        setErrorMessage('');
      })
      .catch((error: AxiosError) => {        
        console.log("Error getting transcriptions", error);
        setErrorMessage("Error getting translations: " + error.message);
      })
      .finally(() => {
        setShowShimmer(false);
        loading = false;
      })
  }

  const onDismissDetails = (refresh: boolean): void => {
    setShowDetailsPanel(false);
    setDetailsFile(undefined);
    if (refresh) {
      getFileList(true);
    }
  };

  const onDismissUpload = (refresh: boolean): void => {
    setShowUploadPanel(false);
    if (refresh) {
      getFileList(true);
    }
  };

  // const selection = new Selection({
  //   onSelectionChanged: () => {
  //     var selectedFiles = selection.getSelection() as ITranscriptionInfo[];
  //     console.log("Selected files:", selectedFiles);
  //   }
  // });

  return (
    <div className={styles.content}>

      <CompoundButton iconProps={{ iconName: 'CircleAddition' }} onClick={() => setShowUploadPanel(true)} secondaryText='Upload a file'
        styles={{
          root: { width: '100%', maxWidth: '100%', marginBottom: '20px'},  
          textContainer: { flexGrow: 0 },
        }}>
        Create new transcription
      </CompoundButton>

      <h2>My transcriptions</h2>
      <ShimmeredDetailsList
        enableShimmer={showShimmer}
        shimmerLines={4}
        items={files || []}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        //selection={selection}
        //selectionPreservedOnEmptyClick={false}
        selectionMode={SelectionMode.none}
      />

      { errorMessage &&
      <p className={styles.warning}>{errorMessage}</p>
      }

      <UploadPanel isOpen={showUploadPanel} onDismiss={ onDismissUpload }></UploadPanel>           

      {detailsFile &&
      <DetailsPanel file={detailsFile} isOpen={showDetailsPanel} onDismiss={ onDismissDetails }></DetailsPanel>
      }

    </div>
  );
}

export default MyTranscriptions;