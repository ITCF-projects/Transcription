import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = (): JSX.Element => {
    return (
        <>
            <Header />          
            <Outlet />
        </>
    );
};

export default Layout;
