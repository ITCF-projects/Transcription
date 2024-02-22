import styles from './App.module.scss'

import Header from './components/Header'
import Footer from './components/Footer'
import MyTranscriptions from './components/MyTranscriptions'
import { loginRequest } from "./authConfig";

import { Spinner } from '@fluentui/react';
import { MsalAuthenticationTemplate, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";

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
  
  return (
    <MsalAuthenticationTemplate 
        interactionType={InteractionType.Redirect} 
        authenticationRequest={loginRequest} 
        errorComponent={ErrorComponent} 
        loadingComponent={LoadingComponent}
    >
      <Header />
      {/* <div className={styles.hero}>
        Authentication in progress...
      </div> */}

      <div className={styles.hero}>
          <h1>Transcribe</h1>
          <p>AI-powered transcription service that prioritizes the safety and security of your data</p>
      </div>
      <AuthenticatedTemplate>
        <MyTranscriptions />
        <Footer />
      </AuthenticatedTemplate>
     
    </MsalAuthenticationTemplate>
  )
}

export default App
