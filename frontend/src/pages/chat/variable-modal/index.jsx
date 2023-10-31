import React, { useEffect } from 'react'
import { Modal, Form, Input, Upload, message, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IconFont } from 'components/icon'
import styles from './index.less'

const VarModal = (props) => {
  const [form] = Form.useForm()
  const { varList = [], varOpen, closeModal } = props

  useEffect(() => {
    if (varList.length > 0) {
      const fieldValues = {}
      varList.forEach(cur => {
        if (cur.type === 'file' && cur.defaultValue !== '') {
          fieldValues[cur.var[0]] = [{
            name: cur.defaultValue.split('/').slice(-1),
            status: 'success',
            response: {
              code: 0,
              data: cur.defaultValue
            },
          }]
        } else if (cur.type === 'text') {
          fieldValues[cur.var[0]] = cur.defaultValue
        }
      })
      form.setFieldsValue(fieldValues)
    }
  }, [varList])

  const uploadRemove = (file) => {
    console.log(file)
  }

  const uploadChange = async (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  const uploadProps = {
    accept: '.json,.xml,.md,.xls,.xlsx,.tsv,.csv,.txt,.doc,.docx',
    action: '/api/chat/model/upload/file',
    onChange: uploadChange,
    listType: 'text',
    onRemove: uploadRemove,
    maxCount: 1,
    progress: {
      strokeColor: {
        '0%': '#7340C8',
        '100%': '#7340C8',
      },
      strokeWidth: 2,
    },
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <IconFont type="icon-shanchu" />,
    },
    iconRender: () => <IconFont type="icon-lianjie1" />,
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      let status = 1
      Object.entries(values).forEach(cur => {
        if (Object.prototype.toString.call(cur[1]) !== "[object String]" && cur[1][0].status === 'error') {
          status = 0
        }
      })
      if (status) {
        closeModal(values)
      } else {
        message.error('Please upload the file correctly!')
      }
    })
  }

  // 表单valueChange事件
  const handleValueChange = value => {
    console.log(value)
  }

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  return (
    <Modal
      key='variables'
      title="Assigned Variables"
      open={varOpen}
      onOk={handleOk}
      onCancel={() => { closeModal() }}
      maskClosable={false}
      destroyOnClose
      width={640}
      cancelText="Cancel"
      okText="OK"
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValueChange}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="right"
        className={styles.modalMain}
      >
        {varList.map(cur => {
          if(cur.type === 'file') {
            return (
              <Form.Item
                name={cur.var[0]}
                key={cur.var[0]}
                rules={[{ required: true, message: 'Please input something.' }]}
                label={<span style={{ whiteSpace: 'pre-wrap' }}>{<>{`${cur.name}:`}</>}</span>}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload File（ .json, .xml, .md, .xls, .tsv, .csv, .txt, .docx ）</Button>
                </Upload>
              </Form.Item>
            )
          }
          return (
            <Form.Item
              name={cur.var[0]}
              key={cur.var[0]}
              rules={[{ required: true, message: 'Please input something.' }]}
              label={<span style={{ whiteSpace: 'pre-wrap' }}>{<>{`${cur.name}:`}</>}</span>}
            >
              <Input.TextArea placeholder={`plase input variable value`} autoSize={{ minRows: 1, maxRows: 5 }} />
            </Form.Item>
          )
        })}
      </Form>
    </Modal>
  )
}

export default VarModal
