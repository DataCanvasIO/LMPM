import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import Editor from 'components/editor'
import { Modal } from 'antd'
import { useParams } from 'umi'
import { getScript, saveScript } from 'services/flow'
import styles from './index.less'

let time = null

const ScriptModal = (props) => {
  const { id: flowId } = useParams()
	const { handleModalVisible, rightInfo , changeNodeParams } = props
  const [state, setState] = useImmer({
		value: '',
  })

  const queryScript = () => {
		const p = { 
			flow_id: flowId,
			node_id: rightInfo.id,
		}
		getScript(p).then(res => {
			if (res) {
				setState(d => {
					d.value = res.script_content
				})
			}
		})
	}

	const handleOk = () => {
		const p = { 
			flow_id: flowId,
			node_id: rightInfo.id,
			script_content: state.value
		}
		saveScript(p).then(res => {
			if (res) {
				handleModalVisible(false)
				setState(d => {
					d.value = res
				})
				const sc = JSON.parse(JSON.stringify(rightInfo.params.script))
				if (sc[0]) {
					sc[0].value = res.script_path
					changeNodeParams({
						...rightInfo,
						params: {
							...rightInfo.params,
							script: sc
						}
					})
				}
			}
		})
	}

	const handleEditorChange = (v) => {
		setState(d => {
			d.value = v
		})
	}

  useEffect(() => {
		queryScript()
  }, [])
	
	return (
    <Modal 
      title="Edit Script"
      onOk={handleOk}
      open={props.visible}
      onCancel={() => handleModalVisible(false)}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
    >
      <div className={styles.scriptModal}>
        <Editor 
          value={state.value} 
					name="script"
          onChange={handleEditorChange} 
          style={{ width: '100%' }} 
					mode="python"
					theme="github"
        />
      </div>
		</Modal>
  )
}

export default ScriptModal
