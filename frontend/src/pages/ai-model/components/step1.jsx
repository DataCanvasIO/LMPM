import React from 'react'
import { Form, Input, Radio, Tooltip, Row, Col } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { modelNameCheck } from '@/services/aiModel'
import { debouncePromise } from '@/utils'
import styles from '../index.less'

const Step1Form = (props) => {
  const { modelKey, editId, ...otherProps } = props
  const str = '${...}'
  const getTransBold = (text) => {
    return <span style={{fontWeight: 'bold'}}>{text}</span>
  }
  const tooltipText = <div>AI Model config contains nine parts.    Respectively are {getTransBold('protocol,method,url,header,modelRole,requestBody,responseBody,responseErrorBody and responseStreamBody')}.<br />
  {getTransBold('Protocol')} is http request's protocol.<br />
  {getTransBold('Method')} is http request's method,it supprt GET,POST,PUT and DELETE and so on.<br />
  {getTransBold('Url')} is http request's url.<br />
  {getTransBold('Header')} is http request's header,it contanis request content type and authorization info.<br />
  {getTransBold('ModelRole')} define send or recieve model message's role info.<br />
  {getTransBold('ResquestBody')} is http request's body,it contains model,message,temperature and stream.   {'${model}'} param is you want to user which one version model.    {'${message}'} param is you want send what message to model and it's required.    {'${temperature}'} is used to adjust the parameters of the variety of generated text.    {'${stream}'} is used to control model return message form.<br/>
  {getTransBold('ResponseBody')} is http response's body,it is used to requestBody's stream param is false,it defined model return result form and correspondence model return content.    {'${result}'} param is required.<br/>
  {getTransBold('ResponseErrorBody')} is a error scenario for http response's body, {'${errorMessage}'} for recognize model return error message.<br />
  {getTransBold('ResponseStreamBody')} is used to requestBody's stream param is true.     {'${stream_result}'} param is required.    If you don't confit it you will not get model return correctly message.<br />
  All of params in this config,use <span>{str}</span> to define and you need set default value in this position.</div>
  const validateModelName = debouncePromise(async (rule, value) => {
    const params = {name: value}
    editId && (params.id = editId)
    const res = await modelNameCheck(params)
    if(res) {
      return Promise.reject('Name already exists!')
    } else {
      return Promise.resolve()
    }
  }, 500)

  return (
    <div {...otherProps}>
      <Form.Item
        labelCol={{ span: 7 }}
        name="modelName"
        label="Model Name"
        required
        rules={[
          { required: true, message: 'Please input something.' },
          { validator: validateModelName }
        ]}
      >
        <Input placeholder='New model name'autocomplete='off' />
      </Form.Item>
      {(modelKey === 'OpenAI' || modelKey === 'Alaya') && ( 
        <Form.Item labelCol={{span: 7}} name="advancedConfigure" label="Connect Configuration">
        <Radio.Group>
            <Radio value="notAdvanced">Default Configuration</Radio>
            <Radio value="isAdvanced">Custom Configuration</Radio>
          </Radio.Group>
        </Form.Item>
      )}
      <Form.Item
        labelCol={{ span: 7 }}
        noStyle
        shouldUpdate={(prevValues, curValues) => prevValues.advancedConfigure !== curValues.advancedConfigure}
      >
        {({ getFieldValue }) => {
          return getFieldValue('advancedConfigure') === 'isAdvanced' || modelKey === 'Others' ? (
            <div className={styles.connectConfigure}>
              <Tooltip placement="right" title={tooltipText}>
                <QuestionCircleOutlined className={styles.circleLine}/>
              </Tooltip>
              <Row>
                <Col offset={modelKey === 'Others' ? 0 : 7}>
                <Form.Item
                  name="connectConfigure"
                  labelCol={{span: modelKey === 'Others' ? 7 : 0}}
                  label={modelKey === 'Others' ? "Connect Configuration" : ""}
                  rules={[{ required: true, message: 'Please input something.' }]}
                >
                  <textarea style={{ resize: 'none' }} className={styles.connectTextarea}/>
                </Form.Item>
                </Col>
              </Row>
            </div>
          ) : <div></div>
        }}
      </Form.Item>
    </div>
  )
}

export default Step1Form
