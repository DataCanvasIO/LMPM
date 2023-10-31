import React from 'react'
import { Modal, Table, Descriptions, Divider, Typography } from 'antd'
import { IconFont } from 'components/icon'
import { CheckCircleOutlined } from '@ant-design/icons'
import { formatTimeStamp } from 'utils'
import { copyValue } from 'utils/variable'
import { useImmer } from 'use-immer'
import styles from './index.less'

const DetailModal = (props) => {
  const { detailOpen, closeModal, curPrompt } = props
  const [state, setState] = useImmer({
    copy: false
  })

  const onOk = () => {
    closeModal()
  }

  const columns = [
    {
      title: 'Variable name',
      dataIndex: 'name',
      key: 'name',
      render: _ => <Typography.Text style={{ whiteSpace: 'pre' }} ellipsis={{ rows: 1,  tooltip: _ }} >{_}</Typography.Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Default',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: _ => <Typography.Text style={{ whiteSpace: 'pre' }} ellipsis={{ rows: 1,  tooltip: _ ? _ : '--' }} >{_ ? _ : '--'}</Typography.Text>
    },
  ]

  return (
    <Modal
      key='detail'
      title={<Typography.Text ellipsis={{ tooltip: curPrompt.name || 'Prompt Detail' }} style={{ width: 'calc(100% - 20px)' }}>{curPrompt.name || 'Prompt Detail'}</Typography.Text>}
      open={detailOpen}
      onOk={onOk}
      footer={null}
      onCancel={() => { closeModal() }}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
    >
      <div className={styles.modalMain}>
        <Divider orientation="left" orientationMargin="0" dashed className={styles.promptDivider}>
          Prompt
          <span>
            {state.copy && <CheckCircleOutlined className={styles.promptDividerIcon} />}
            {!state.copy && (
              <IconFont
                type="icon-fuzhi"
                className={styles.promptDividerIcon}
                onClick={() => {
                  copyValue(curPrompt.prompt)
                  setState(draft => {
                    draft.copy = true
                  })
                  setTimeout(() => {
                    setState(draft => {
                      draft.copy = false
                    })
                  }, 1500)
                }}
              />
            )}
          </span>
        </Divider>
        <Descriptions className={styles.promptDesc}>
          <Descriptions.Item className={styles.promptText}>
            {curPrompt.prompt || '--'}
          </Descriptions.Item>
        </Descriptions>
        <Divider orientation="left" orientationMargin="0" dashed className={styles.promptDivider}>
          Variables
        </Divider>
        <div className={styles.variablesDesc}>
          <Table
            scroll={{ x: false, y: 200 }}
            className='mlpm-table'
            size='small'
            columns={columns}
            dataSource={curPrompt.variables || []}
            pagination={false}
          />
        </div>
        <Divider orientation="left" orientationMargin="0" dashed className={styles.promptDivider}>
          Info
        </Divider>
        <Descriptions column={2} className={styles.infoDesc}>
          <Descriptions.Item label="Source">
            {curPrompt.source || '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Scene">
            {curPrompt.scene_name || '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {curPrompt.role_name || '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Label">
            <Typography.Text
              ellipsis={{
                tooltip: () => (
                  <>
                    {curPrompt.labes_name.map((cur, ind) => {
                      if (ind === curPrompt.labes_name.length - 1) {
                        return <>{cur}</>
                      }
                      return <>{cur}<span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 8px' }}>|</span></>
                    })}
                  </>
                )
              }}
              style={{ width: '400px' }}
            >
              {curPrompt.labes_name.join(' | ') || '--'}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created time">
            {formatTimeStamp(curPrompt.create_time) || '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Updated time">
            {formatTimeStamp(curPrompt.update_time) || '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Note">
            <Typography.Text ellipsis={{ tooltip: curPrompt.note || '--', rows: 2 }} style={{ width: '850px' }}>
              {curPrompt.note || '--'}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  )
}

export default DetailModal
