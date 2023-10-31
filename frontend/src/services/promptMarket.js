import request from '@/utils/request'

// 获取scene、role、label列表
export async function getCategoryList(params) {
  return request.get('/prompt/category/list', params)
}

// 批量更新scene、role、label
export async function postCategoryList(params) {
  return request.post('/prompt/category/batch/operate', params)
}

// 添加scene、role、label
export async function addCategory(params) {
  return request.post('/prompt/category/add', params)
}

// 获取prompt列表
export async function getPromptList(params) {
  return request.get('/prompt/page', params)
}

// 删除prompt
export async function deletePrompt(params) {
  return request.delete('/prompt/delete', params)
}

// 新增prompt
export async function addPrompt(params) {
  return request.post('/prompt/add', params)
}

// 编辑prompt
export async function updatePrompt(params) {
  return request.put('/prompt/update', params)
}

// 删除（角色，场景，标签）校验
export async function validatePrompt(params) {
  return request.get('/prompt/category/delete/validate', params)
}
