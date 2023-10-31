import React, { useEffect } from 'react'
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons'
import { useImmer } from 'use-immer'
import styles from './index.less'

const FieldSort = (props) => {
  const { field, defaultValue, value, onChange } = props
  const [state, setState] = useImmer({ sort: 'desc' })

  useEffect(() => {
    if(['desc', 'asc'].includes(defaultValue)) {
      setState(draft => {
        draft.sort = defaultValue
      })
    }
  }, [])

  useEffect(() => {
    if(['desc', 'asc'].includes(value)) {
      setState(draft => {
        draft.sort = value
      })
    }
  }, [value])

  const handleChange = () => {
    const newSort = state.sort === 'desc' ? 'asc' : 'desc'
    onChange(newSort)
    setState(draft => {
      draft.sort = newSort
    })
  }

  return (
    <div className={styles.fieldSort} onClick={handleChange}>
      <div className={styles.sortTitle}>{field}</div>
      <div className={styles.sortIcon}>
        <CaretUpOutlined className={state.sort === 'asc' ? styles.iconActive : null} />
        <CaretDownOutlined className={state.sort === 'desc' ? styles.iconActive : null} />
      </div>
    </div>
  )
}

export default FieldSort
