import React, { useEffect } from 'react'
import { Modal, Form, Input } from 'antd'
import { asyncName } from 'utils'
import { updateAppName } from 'services/promptApp'

const formLayout = {
  labelCol:{ span: 8 },
  wrapperCol: { span: 12 }
}

const EditModal = (props) => {
  const [form] = Form.useForm()
  const { id, name, closeModal, editOpen } = props

  useEffect(() => {
    form.setFieldsValue({ name })
  }, [name])

  const onOk = () => {
    form.validateFields().then(values => {
      if (values.name !== name) {
        updateAppName({ id, name: values.name }).then(() => {
          closeModal('update')
        })
      } else {
        closeModal('cancel')
      }
    })
  }

  return (
    <Modal
      title="Edit"
      onOk={onOk}
      open={editOpen}
      onCancel={() => closeModal('cancel')}
      maskClosable={false}
      destroyOnClose
      width={640}
      cancelText="Cancel"
      okText="OK"
    >
      <Form form={form} {...formLayout}>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: `Please input something.` },
            asyncName(`/app/name/check?name=`, name)
          ]}
          label="Prompt App Name"
        >
          <Input autocomplete='off' placeholder="please input Prompt App Name" width="280" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditModal
