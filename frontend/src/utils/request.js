import { extend } from 'umi-request'
import { notification } from 'antd'
import Http from './http'

const codeMessage = {
  200: 'The server successfully returned the requested data.',
  404: 'The request was made for a non-existent record and the server did not take any action.',
  500: 'The server encountered an error. Please check the server.',
  502: 'Gateway error.',
  503: 'Service unavailable, server temporarily overloaded or under maintenance.',
  504: 'gateway timeout.',
}

Http.config = {
  prefix: '/api',
  // // HTTP错误状态码
  errorCallback: (status, url) => {
    const errorText = codeMessage[status]
    notification.error({
      message: `request error ${status}: ${url}`,
      description: errorText,
    })
  },
  // 无状态返回
  noResponseCallback: () => {
    notification.error({
      description: 'Your network has encountered an exception and cannot connect to the server!',
      message: 'network anomaly',
    })
  },
  // getHeaders: () => {
  //   return {}
  // },
}

export default Http