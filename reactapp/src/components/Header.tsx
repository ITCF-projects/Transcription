import styles from '../App.module.scss'

import { Link, Text, Callout, ActionButton, Persona, PersonaSize } from '@fluentui/react'
import { useBoolean, useId } from '@fluentui/react-hooks';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';


const Header = (): JSX.Element => {

  const [showMenu, { toggle: toggleShowMenu }] = useBoolean(false);
  const buttonId = useId('callout-button');

  const { instance, accounts } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
        postLogoutRedirectUri: "/",
    });
  }
  
  const accountName = (accounts && accounts.length >= 1 ? accounts[0].name : '');
  const accountUsername = (accounts && accounts.length >= 1 ? accounts[0].username : '');

  return (
    <div className={styles.suitebar}>
      <div className={styles.suitebarLeft}>
        <Link href={'/'}>
          { import.meta.env.VITE_APP_TITLE }
        </Link>
      </div>
      <div className={styles.suitebarRight}>

        <AuthenticatedTemplate>

        <ActionButton onClick={ toggleShowMenu } id={buttonId} ariaLabel='Account menu' >
          <Persona size={PersonaSize.size32} hidePersonaDetails text={ accountName } />
        </ActionButton> 

        {showMenu && (
          <Callout
            style={ { width: 320, maxWidth: '90%', padding: '20px 24px' }}
            role="dialog"
            gapSpace={0}
            target={`#${buttonId}`}
            onDismiss={toggleShowMenu}
            setInitialFocus
          >
            <Text as="h1" block variant="xLarge" className={styles.title}>
              { accountName }
            </Text>
            <Text block variant="small">
              { accountUsername }
            </Text>
            <br/>
            <Link onClick={() => handleLogout()}>Sign out</Link>
          </Callout>
        )}

        </AuthenticatedTemplate>

      </div>
    </div>
  )
}

export default Header
