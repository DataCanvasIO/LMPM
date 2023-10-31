import request, { AbortController } from 'umi-request'
import { message } from 'antd'
import { stringify as qsStringify } from 'qs'
import { UUID } from './index'

const saveReqKey = {}

// http error handler
const errorHandler = ( error, url) => {
  const { response, name } = error
  if (name && name === 'AbortError') {
    return error
  } else if (response && response.status) {
    const { status, url } = response
    proxyRequest.config.errorCallback(status, url)
  } else if (!response) {
    proxyRequest.config.noResponseCallback()
  }
  return response
}

function http(url, options) {
  const method = options.method ? options.method : ''
  const key = options.key || url + method
  let cancel = false
  if (options.cancel === true) {
    cancel = true
  }

  if (cancel && saveReqKey[key] && saveReqKey.hasOwnProperty(key)) {
    saveReqKey[key].forEach((item) => item.abort())
    delete saveReqKey[key]
  }

  const controller = new AbortController() 
  options.handleCancel && options.handleCancel(controller)
  const { signal } = controller
  const defaultOptions = {
    credentials: 'include',
  }

  const newOptions = { ...defaultOptions, ...options }
  newOptions.headers = { ...newOptions.headers, requestId: UUID() }
  if (!newOptions.headers.projectId) delete newOptions.headers.projectId
  newOptions.getResponse = true
  newOptions.signal = signal
  if (cancel) {
    saveReqKey[key] = [controller]
  }

  if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE' || newOptions.method === 'PATCH') {
    if (!(newOptions.body instanceof FormData)) {
      if (typeof newOptions.body === 'object' && !Array.isArray(newOptions.body)) {
        const { ...body } = newOptions.body
        delete body.loadingId
        newOptions.body = body
      }
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...newOptions.headers,
      }
      newOptions.body = JSON.stringify(newOptions.body)
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      }
    }
  }

  newOptions.headers = {
    ...newOptions.headers,
    ...proxyRequest.config.getHeaders?.(),
  }

  return new Promise((resolve, reject) => {
    request(url, newOptions)
      .then((response) => {
        if (options.needCode || options.needHandleResDataByCode) {
          resolve(response.data)
          return
        }
        if (response.data.code === 0 || response.data.status === 0) {
          resolve(response.data.data)
          return
        }
        if (response.data.code === 590403 || response.data.status === 590403) {
          // config.forceLogout()
          proxyRequest.config.forceLogout()
          reject(new Error('Logout'))
          return
        }
        if (response.data.code === 600403 || response.data.status === 600403) {
          // 403
          proxyRequest.config.authLimit()
          // reject(new Error('no auth'))
          return
        }
        message.error(response?.data?.data?.message)
        if (options.messageHandler) {
          proxyRequest.config.errorMessageHandler?.(response.data)
          resolve(false)
        } else {
          proxyRequest.config.logicErrorCallback?.(response.data)
          resolve(false)
          // reject(new Error('logic error callback'))
        }
      })
      .catch((error) => {
        reject(errorHandler(error, url))
      }).finally(() => {
        delete saveReqKey[key]
      })
  })
}

/**
 *  the proxy of request
 * @param url
 * @param options
 * @returns {*}
 */
function proxyRequest(url, options) {
//   const storeRequest = ZetMicroStore.get('request')
//   //  proxyRequest !== storeRequest 当前request不是子应用的
//   if (storeRequest && proxyRequest !== storeRequest) {

//     // 设置config
//     if (proxyRequest.config !== storeRequest.config) {
//       proxyRequest.config = storeRequest.config
//     }

//     return storeRequest(url, options)
//   }

  options = options || {}
  const prefix = options.prefix || proxyRequest.config.prefix
  if (options.hasOwnProperty('prefix')) { // 设置options里的prefix不生效
    delete options.prefix
  }
  url = url.startsWith(prefix) ? url : `${prefix ? prefix : ''}${url}`

  return http(url, options)
}

proxyRequest.config = {
  // prefix
  prefix: '',
  // logout
  forceLogout: () => { },
  // 403
  authLimit: () => { },
  // HTTP error code
  errorCallback: (status, url) => { },
  // no response
  noResponseCallback: () => { },
  logicErrorCallback: (response) => { },
  errorMessageHandler: (response) => { },
  getHeaders: () => {
    return {}
  },
}

/**
 * @param url
 * @param data   such as : {name = xxx ,age = xx } equel : url ? name=xxx&age=xx
 * @param options
 * @returns {*}
 */
proxyRequest.get = (url, data, options) => {
  options = options || {}
  url = encodeURI(url)
  // indices 将参数中的数组变成传入多个相同的key
  // eg: request.get(url, { a: ['b', 'c', 'd'] }, { indices: false })
  // 得到 url?a=b&a=c&a=d'
  url = data ? `${url}?${qsStringify(data, { indices: options.indices === false ? !!false : true })}` : url
  return proxyRequest(url, options)
}

/**
 *
 * @param url
 * @param data
 * @param options
 * @returns {*}
 */
proxyRequest.post = (url, data, options) => {
  options = options || {}
  options.body = data
  options.method = 'POST'
  return proxyRequest(url, options)
}

/**
 *
 * @param url
 * @param data
 * @param options
 * @returns {*}
 */
proxyRequest.put = (url, data, options) => {
  options = options || {}
  options.body = data || {}
  options.method = 'PUT'
  return proxyRequest(url, options)
}

/**
 *
 * @param url
 * @param data
 * @param options
 * @returns {*}
 */
proxyRequest.delete = (url, data, options) => {
  options = options || {}
  options.body = data || {}
  options.method = 'DELETE'
  return proxyRequest(url, options)
}

/**
 *
 * @param url
 * @param data
 * @param options
 * @returns {*}
 */
proxyRequest.patch = (url, data, options) => {
  options = options || {}
  options.body = data || {}
  options.method = 'PATCH'
  return proxyRequest(url, options)
}

/**
 * get file blob
 * @param url
 * @param isReadAsText is read as text
 * @returns
 */
proxyRequest.getBlob = (url, isReadAsText = true) => {
  if (isReadAsText) {
    return new Promise((resolve, reject) => {
      request.get(url, {
        responseType: 'blob',
      }).then(blob => {
        const reader = new FileReader()
        reader.readAsText(blob, 'utf-8')
        reader.onload = (data) => {
          resolve(data)
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  return request.get(url, {
    responseType: 'blob',
  })
}

/**
 * file upload
 * @param action
 * @param data
 * @param name
 * @param fileList
 * @returns
 */
proxyRequest.upload = ({ action, data, name, fileList }) => {
  const options = {}
  options.method = 'POST'
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
  }
  formData.append(name, fileList)
  options.body = formData
  return proxyRequest(action, options)
}

proxyRequest._http = http

export default proxyRequest