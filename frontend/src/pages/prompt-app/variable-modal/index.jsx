import React from 'react'
import { Modal, Table, Button } from 'antd'
import styles from './index.less'

const VariableModal = (props) => {
  const { activeApp, variableOpen, closeModal } = props

  const columns = [
    {
      title: 'Variable',
      dataIndex: 'variable',
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 120,
    },
    {
      title: 'Default value',
      dataIndex: 'defaultValue',
      render: _ => <>{_ || '--'}</>
    },
  ]

  return (
    <Modal
      key='variable'
      title='Input variables'
      open={variableOpen}
      // onOk={closeModal}
      onCancel={closeModal}
      maskClosable={false}
      destroyOnClose
      width={640}
      wrapClassName="variable-modal"
      footer={<Button onClick={closeModal}>Cancel</Button>}
    >
      <div className={styles.mainTable}>
        <Table
          size='small'
          dataSource={activeApp.input_info}
          scroll={{ x: false, y: 390 }}
          columns={columns}
          pagination={false}
          rowKey="id"
        />
      </div>
    </Modal>
  )
}

export default VariableModal
