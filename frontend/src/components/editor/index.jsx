import React, { useState, useEffect, useRef } from 'react'
import AceEditor from 'react-ace'
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/mode-python"
import styles from './index.less'

const Editor = props => {
  const ref = useRef(null)
  const { className, value, theme, onChange, ...otherProps } = props
  // const [EdValue, setEdValue] = useState(value)

  const onChangeHandle = (value) => {
    // setEdValue(value)
    onChange && onChange(value)
  }

  // useEffect(() => {
  //   setEdValue(value)
  // }, [value])

  return (
    <AceEditor
      ref={ref}
      className={styles.ace_editor}
      setOptions={{
        useWorker: false,
        showLineNumbers: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
      }}
      showPrintMargin={false}
      // enableBasicAutocompletion
      // enableLiveAutocompletion
      {...otherProps}
      value={value || ''}
      onChange={onChangeHandle}
      onLoad={editor => {
        setTimeout(() => {
          const session = editor.getSession();
          const undoManager = session.getUndoManager();
          undoManager.reset();
          session.setUndoManager(undoManager);
        }, 200)
      }}
    />
  )
}

export default Editor
