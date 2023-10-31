import React from 'react'
import emptyImg from '@/assets/empty.png';
import styles from './index.less'

const Empty = (props) => {
  return (
    <div className={styles.empty}>
      <img src={emptyImg} alt="Empty" />
      <div className={styles.font}>No Data</div>
    </div>
  )
}

export default Empty
