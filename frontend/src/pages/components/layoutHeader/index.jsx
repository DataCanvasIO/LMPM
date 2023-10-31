import React from 'react'
import { Row, Col } from 'antd'
import styles from './index.less'

const BasicHeader = (props) => {
  const { title, children } = props

  return (
    <Row className={styles.basicHeader} justify="space-between">
      <Col span={4} className={styles.title}>{title}</Col>
      <Col className={styles.content}>{children}</Col>
    </Row>
  )
}

export default BasicHeader