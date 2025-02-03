import { useRouteError } from 'react-router-dom';
import styles from '../App.module.scss';

const ErrorPage = (): JSX.Element => {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div id="error-page" className={styles.content}>
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
};

export default ErrorPage;
