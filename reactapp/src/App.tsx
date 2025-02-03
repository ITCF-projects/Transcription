import { InteractionType } from "@azure/msal-browser";
import { AuthenticatedTemplate, MsalAuthenticationTemplate } from "@azure/msal-react";

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import styles from './App.module.scss';
import { loginRequest } from "./authConfig";
import Header from './components/Header';
import Layout from "./components/Layout";
import HistoryPage from "./pages/HistoryPage";
import ErrorPage from "./pages/ErrorPage";
import FaqPage from "./pages/FaqPage";
import StartPage from "./pages/StartPage";

function ErrorComponent(error: any): JSX.Element {
  return <p>An Error Occurred: {error}</p>;
}

function LoadingComponent(): JSX.Element {
  return (
    <div>
      <Header />
      <div className={styles.hero}>
        Authentication in progress...
      </div>
    </div>);
}


function App() {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<Layout />} errorElement={<ErrorPage />}>
            <Route index element={<StartPage />} />
            <Route key="faq" path="faq" element={<FaqPage />} />
            <Route key="history" path="history" element={<HistoryPage title='History' showAllHistory={false}/>} />
            <Route key="history-admin" path="history-admin" element={<HistoryPage title='History for all' showAllHistory={true} />} />
            <Route path="/*" element={<h1>404 - Page Not Found</h1>} />
        </Route>
    )
  );

  return (
    <MsalAuthenticationTemplate 
        interactionType={InteractionType.Redirect} 
        authenticationRequest={loginRequest} 
        errorComponent={ErrorComponent} 
        loadingComponent={LoadingComponent}
    >
      <AuthenticatedTemplate>

        <RouterProvider router={router} />

      </AuthenticatedTemplate>
    </MsalAuthenticationTemplate>
  )
}

export default App
