import React from "react"
import { Form, Select, Input, Row, Col } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { IconFont } from 'components/icon'
import Editor from 'components/editor'
import styles from '../index.less'

const typeOptions = [
  { value: 'String', label: 'String' },
  { value: 'Int', label: 'Int' },
  { value: 'Double', label: 'Double' },
  { value: 'Password', label: 'Password' },
  { value: 'Select', label: 'Select' },
  { value: 'Boolean', label: 'Boolean' },
]
const booleanOptions = [
  {
    value: true,
    label: 'true'
  },
  {
    value: false,
    label: 'false'
  },
]
const jsonOptions = [
  { value: 'Json', label: 'Json' },
  { value: 'Jsonarray', label: 'Jsonarray' },
  { value: 'String', label: 'String' },
]
const layoutWrapperCol = { span: 19, offset: 5 }

const Step2Form = (props) => {
  const { formData, modelKey, ...otherProps } = props

  const getMessageResultItem = (prevIteValue) => {
    return prevIteValue === 'Select'
    ? <textarea style={{ width: '100%', height: 100, resize: 'none' }}/>
    : <Editor height={100} theme="chrome" mode="json" />
  }

  const getCommonFormItem = (prevIteValue) => {
    return prevIteValue === 'Boolean' ? <Select options={booleanOptions}/> : <Input autocomplete='off' placeholder="Input default value"/>
  }

  return (
    <div {...otherProps}>
      <div className={styles.warningMsg}>
        <div style={{float: 'left'}}>
          <IconFont type="icon-tishi" style={{ marginRight: 8, fontSize: 17 }}/>
        </div>
        <div className={styles.confModel}>
          <div>
            Configurate the large model request parameter variabels，they would be used in Prompt Engineer.
          </div>
          {modelKey === 'OpenAI' && (
            <div className={styles.defaultValues}>
              Default values are given for the following variables, you can change the values
            </div>
          )}
        </div>
      </div>
      {Object.keys(formData).map((ite, idx) => {
        const isDefault = ite.indexOf('Default') > -1
        const attrs = { name: ite }
        if(isDefault) {
          attrs.wrapperCol = layoutWrapperCol
        } else {
          attrs.label = ite
        }
        if(idx % 2 === 0) {
          return (
            <Form.Item {...attrs}>
              <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={['result', 'message', 'stream_result'].includes(ite) ? jsonOptions : typeOptions} />
            </Form.Item>
          )
        } else {
          const prevIte = Object.keys(formData)[idx - 1]
          console.log('prevIte-----', prevIte)
          return (
            <Form.Item
              className={styles.step2Item}
              noStyle
              shouldUpdate={(prevValues, curValues) => prevValues[prevIte] !== curValues[prevIte]}
            >
              {({ getFieldValue }) => {
                return (
                  <>
                    <Form.Item
                      dependencies={[prevIte]}
                      {...attrs}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if(_.field.indexOf('Default') > -1 && ['Jsonarray', 'Json'].includes(getFieldValue(prevIte))) {
                              try {
                                JSON.parse(getFieldValue(_.field))
                                return Promise.resolve()
                              } catch(e) {
                                return Promise.reject(new Error('JSON Format Error'))
                              }
                            } else if(['messageDefault', 'resultDefault'].includes(_.field) && !value) {
                              return Promise.reject(new Error('Required'))
                            } else {
                              return Promise.resolve()
                            }
                          },
                        }),
                      ]}
                    >
                      {['Jsonarray', 'Json', 'Select'].includes(getFieldValue(prevIte))
                        ? getMessageResultItem(getFieldValue(prevIte))
                        : getCommonFormItem(getFieldValue(prevIte))
                      }
                    </Form.Item>
                    {getFieldValue(prevIte) === 'Select' && (
                      <Row className={styles.optionsPrompt}>
                        <Col offset={5}>
                          <QuestionCircleOutlined style={{ marginRight: 3 }} />
                          <span className={styles.customizePrompt}>
                            You can customize options and use ';' to separate multiple options
                          </span>
                        </Col>
                      </Row>
                    )}
                     {['Jsonarray', 'Json'].includes(getFieldValue(prevIte)) && (
                        <Row className={styles.optionsPrompt}>
                          <Col offset={5}>
                            <QuestionCircleOutlined style={{marginRight: 3}}/>
                            <span className={styles.customizePrompt}>
                              You can use {'${}'} to add variables, for example, {prevIte !== 'result' && "you can use {'${role}'} to add role"}  and you can use {prevIte === 'result' ? '${result_content}' : '${content}'} to add {prevIte === 'result' ? "result_content" : "content"}.
                            </span>
                          </Col>
                        </Row>
                      )}
                  </>
                )
              }}
            </Form.Item>
          )
        }
      })}
    </div>
  )
}

export default Step2Form
