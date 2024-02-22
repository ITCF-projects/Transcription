import liuLogo from '../assets/liu.svg'
import umuLogo from '../assets/umu.svg'
import guLogo from '../assets/gu.svg'
import ltuLogo from '../assets/ltu.svg'

import styles from '../App.module.scss'
import { Stack } from '@fluentui/react'

const Footer = (): JSX.Element => {
  return (<div className={styles.footer}>

    <h2>A collaboration between</h2>

    <Stack horizontal horizontalAlign={'center'} wrap verticalAlign={'center'} tokens={{ childrenGap: 24 }} >
      <Stack horizontal horizontalAlign={'center'} wrap verticalAlign={'center'} tokens={{ childrenGap: 24 }} >
        <a href="https://www.liu.se" target="_blank">
          <img src={liuLogo} className="" alt="Linköping university" />
        </a>
        <a href="https://www.gu.se" target="_blank">
          <img src={guLogo} className="" alt="Göteborg university" />
        </a>
      </Stack>
      <Stack horizontal horizontalAlign={'center'} wrap verticalAlign={'center'} tokens={{ childrenGap: 24 }} >
        <a href="https://www.umu.se" target="_blank">
          <img src={umuLogo} className="" alt="Umeå university" />
        </a>
        <a href="https://www.ltu.se" target="_blank">
          <img src={ltuLogo} className="" alt="Luleå university" />
        </a>
      </Stack>
    </Stack>
  </div>);
}

export default Footer
