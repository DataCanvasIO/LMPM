import { message } from 'antd'

export const parseTempVar = text => {
  const allVar = text.match(/\${.*?\}/g) || [] // ['${xxx[text]:default}', '${ooo[file]:file/default.doc}']
  const allVarList = allVar.map(cur => {
    const curVar = cur.slice(2, -1) // xxx[text]:default 或 ooo[file]:file/default.doc
    const typeList = curVar.match(/\[.*?\]/g) || [] // ['[text]'] 或 ['[file]']
    let name = '' // 初始化变量字段名
    let type = 'text' // 初始化变量类型
    let defaultValue = '' // 初始化变量默认值
    if (typeList.length === 0) { // 如果正则未匹配到，说明没配置变量类型
      const defIndex = curVar.indexOf(':') // 此时看看有没有配置默认值
      name = defIndex === -1 ? curVar : curVar.slice(0, defIndex)
      defaultValue = defIndex === -1 ? '' : curVar.slice(defIndex + 1)
    } else {
      name = curVar.split(typeList[0])[0]
      type = typeList[0].slice(1, -1) === 'file' ? 'file' : 'text'
      const defIndex = curVar.split(typeList[0]).slice(1).join(typeList[0]).indexOf(':')
      defaultValue = defIndex === -1 ? '' : curVar.split(typeList[0]).slice(1).join(typeList[0]).slice(defIndex + 1)
    }
    return {
      var: [cur], // 变量
      name, // 变量字段名
      type, // 变量类型 text/file
      defaultValue, // 变量默认值
      value: '', // 变量真实值
    }
  })

  // 变量列表按照变量字段名去掉空串并去重
  const map = new Map()
  allVarList.forEach(item => {
    // 前面覆盖后面就加这个判断，后面覆盖前面可以不加这个判断 -- (!map.has(item.name))
    if (item.name !== '') {
      if (!map.has(item.name)) {
        map.set(item.name, item)
      } else {
        const cur = map.get(item.name)
        map.set(item.name, { ...cur, var: Array.from(new Set([ ...cur.var, ...item.var ])) })
      }
    }
  })

  return [...map.values()]
}

export const jsonValidator = str => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

// 先给要复制的文本或者按钮加上点击事件后，并将要复制的值传过来
export const copyValue = async val => {
  if (navigator.clipboard && window.isSecureContext) {
    message.success('Copy successful!')
    return navigator.clipboard.writeText(val)
  } else {
    // 创建text area
    const textArea = document.createElement('textarea')
    textArea.value = val
    // 使text area不在viewport，同时设置不可见
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    message.success('Copy successful!')
    return new Promise((res, rej) => {
      // 执行复制命令并移除文本框
      document.execCommand('copy') ? res() : rej()
      textArea.remove()
    })
  }
}

export const formMessage = {
  required: 'Please input something.'
}
