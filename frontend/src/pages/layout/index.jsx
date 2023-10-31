import React from 'react'
import { Link, useLocation } from 'umi'
import { Layout } from 'antd'
import Menu from '@/pages/components/menu'
import { IconFont } from 'components/icon'
import styles from './index.less'

const { Header, Content } = Layout

const BasicLayout = (props) => {
  const { routes } = props
  const location = useLocation();

  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={styles.head}>
        <Link className={styles.homeIcon} to="/">LMPM</Link>
        <div className={styles.menuItems}>
          <Menu menuRoutes={routes[0].routes}/>
        </div>
        <div className={styles.guideContain}>
          <Link to="/Prompt-Guide">
            <div className={`${styles.questionContain} ${location.pathname === '/Prompt-Guide' && styles.active}`}>
              <IconFont type="icon-bangzhu" style={{ fontSize: 20, cursor: 'pointer' }}/>
            </div>
          </Link>
        </div>
      </Header>
      <Content className={styles.container}>
        <div className={styles.content}>
          {props.children}
        </div>
      </Content>
    </Layout>
  )
}

export default BasicLayout
