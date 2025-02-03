import { ActionButton } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';
import styles from '../App.module.scss';

interface IPageHeader {
    title: string;
    backTo?: string;
}

const PageHeader = (props: IPageHeader): JSX.Element => {
    const navigate = useNavigate();

    return (
        <div className={styles.pageHeader}>
            <h1>
                {props.title}                
            </h1>
            {props.backTo &&
                <ActionButton
                    iconProps={{ iconName: 'Back' }}
                    onClick={() => {
                        navigate(props.backTo ?? '');
                    }}
                >
                    Back
                </ActionButton>
            }
        </div>
    );
};

export default PageHeader;
