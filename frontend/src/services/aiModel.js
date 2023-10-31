import request from '@/utils/request'

export async function getModelList(params) {
  return request.get('/model/list', params)
}

export async function getModelConfig(params) {
  return request.get('/model/config/get', params)
}

export async function getParamsParse(params) {
  return request.post('/model/params/parse', params)
}

export async function saveModel(params) {
  return request.post('/model/save', params, { needCode: true })
}

export async function updateModel(params) {
  return request.post('/model/update', params, { needCode: true })
}

export async function deleteModel(params) {
  return request.post('/model/delete', params)
}

export async function defaultModel(params) {
    return request.post('/model/default', params);
}
export async function overviewQuickguide(params) {
    return request.get('/overview/quickguide', params, {needCode: true});
}
export async function modelNameCheck(params) {
    return request.post('/model/name/check', params);
}