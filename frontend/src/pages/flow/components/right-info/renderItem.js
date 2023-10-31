import React from 'react'
import { Form, Input, Button, Select, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IconFont } from 'components/icon'


const booleanOptions = [
  {
    value: true,
    label: 'True'
  },
  {
    value: false,
    label: 'False'
  },
]

const uploadProps = {
  accept: '.json,.xml,.md,.xls,.xlsx,.tsv,.csv,.txt,.doc,.docx',
  action: '/api/chat/model/upload/file',
  maxCount: 1,
  progress: {
    strokeColor: {
      '0%': '#7340C8',
      '100%': '#7340C8',
    },
    showInfo: false,
    strokeWidth: 2,
  },
  showUploadList: {
    showRemoveIcon: true,
    removeIcon: <IconFont type="icon-shanchu" />,
  },
  iconRender: () => <IconFont type="icon-lianjie1" />,
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onRemove(info) {
    console.log('removeinfo', info)
  }
};

const renderItem = (item) => {
  const type = item.type?.toLowerCase()
  if (['select'].includes(type)) {
    return <Select options={item.defaultValue.split(';').filter(f => f).map(item => ({ label: item, value: item }))} />
  } else if(['json', 'jsonarray'].includes(type)) {
    return <Input.TextArea autoSize={{ minRows: 3, maxRows: 30 }} />
  } else if (['int', 'double'].includes(type)) {
    return <Input autocomplete='off' />
  } else if (['password'].includes(type)) {
    return <Input.Password />
  } else if (['boolean'].includes(type)) {
    return <Select options={booleanOptions} />
  } else if (['file'].includes(type)) {
    return <Upload {...uploadProps} key={item.name}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  }else {
    return <Input autocomplete='off' />
  }
}

export default renderItem
