import request from '@/utils/request'

// 获取右侧model列表
export async function getModelList(params) {
  return request.get('/chat/model/configuration', params)
}

// 获取底侧prompt分组列表
export async function getPromptGroup(params) {
  return request.get('/prompt/scenegroup/list', params)
}

// 获取底侧所有prompt列表
export async function getPromptAll(params) {
  return request.get('/prompt/list', params)
}

// chat对话同步发送接口
export async function syncSendMsg(params) {
  return request.post('/chat/model/sync/completions', params)
}
