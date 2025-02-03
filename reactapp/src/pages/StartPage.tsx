import { Link } from 'react-router-dom';
import styles from '../App.module.scss';
import Footer from '../components/Footer';
import MyTranscriptions from '../components/MyTranscriptions';

const StartPage = (): JSX.Element => {
    return (
        <div className={styles.content}>

            <div className={styles.hero}>
                <h1>Transcribe</h1>
                <p>AI-powered transcription service that prioritizes the safety and security of your data. This service has been audited and <b>is suitable</b> for use with information classified as "sensitive personal data".</p>
                <p>Please refer to <Link to='faq'>common questions (in swedish)</Link> as your first stop when in need of support.</p>
            </div>

            <MyTranscriptions />
            
            <Footer />

        </div>
    );
};

export default StartPage;
