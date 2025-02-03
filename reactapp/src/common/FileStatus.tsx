import { Icon } from '@fluentui/react'
import styles from '../App.module.scss'

interface IFileStatus {
  file: ITranscriptionInfo;
}

const FileStatus = (props: IFileStatus): JSX.Element => {
  
  let className = '';
  let iconName = '';
  let statusTitle = props.file.status;

  switch (props.file.status?.toLowerCase()) {
    case 'completed': 
      iconName = 'Accept';
      className = styles.completed;
      break;
    case 'transcribed': 
      iconName = 'Accept';
      className = styles.completed;
      break;
    case 'transcribing': 
      iconName = 'Settings';
      className = styles.transcribing;
      break;
    case 'failed': 
      iconName = 'Error';
      className = styles.error;
      break;
    case 'error': 
      iconName = 'Error';
      className = styles.error;
      break;
    case 'unsupported': 
      iconName = 'Error';
      className = styles.error;
      break;
    case 'new': 
      iconName = 'BuildQueue';
      className = styles.new;
      statusTitle = 'In queue';
      break;
  }

  return (
    <div className={styles.fileStatus + ' ' + className}>
      {iconName && 
      <div className={ styles.statusIcon }>
        <Icon iconName={ iconName } />
      </div>
      }
      <div>{statusTitle}</div>
    </div>
  );
}

export default FileStatus;