import request from '@/utils/request'

// 获取app列表
export async function getAppList(params) {
  return request.get('/app/list', params)
}

// 删除app
export async function deleteApp(params) {
  return request.post('/app/delete', params)
}

// 更新app名称
export async function updateAppName(params) {
  return request.post('/app/update', params)
}

// 获取SDK
export async function getSDK(id) {
  return request.get('/app/sdk/demo/get', { id }, { needCode: true });
}

// 导出SDK
export async function exportSDK(params) {
  return request.post('/api/app/sdk/export', params, { needCode: true, responseType: 'blob' });
}
