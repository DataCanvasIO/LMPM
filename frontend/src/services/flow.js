import request from '@/utils/request'

export async function getEdgeList(params) {
  return request.get('/aps/edge/bsox/list', { params })
}

// flowList
export async function getFlowList(params) {
  return request.get('/flow/list', params)
}

// flowadd
export async function createFlow(params) {
  return request.post('/flow/add', params)
}

// flowcopy
export async function copyFlow(params) {
  return request.post('/flow/copy', params)
}

// delete
export async function deleteFlow(params) {
  return request.delete('/flow/delete', params)
}

// module tree
export async function getModuleTree(params) {
  return request.get('/flow/module/tree', params)
}

// create node
export async function createNode(params) {
  return request.post('/flow/node/create', params)
}

// get flow
export async function getFlow(params) {
  return request.get('/flow/pmflow/get', params)
}

// save flow
export async function saveFlow(params) {
  return request.post('/flow/pmflow/save', params)
}

// get script
export async function getScript(params) {
  return request.get('/flow/node/script/get', params)
}

// save script
export async function saveScript(params) {
  return request.post('/flow/node/script/save', params)
}

// publish flow
export async function publishFlow(params) {
  return request.post('/flow/pmflow/publish', params)
}

// applist
export async function getAppList(params) {
  return request.get('/app/list', params)
}

// variablelist
export async function getVariablesList(params) {
  return request.get('/flow/pmflow/variables', params)
}

// flow run
export async function runFlow(params) {
  return request.post('/flow/pmflow/run', params)
}

// flow status
export async function getFlowStatus(params) {
  return request.get('/flow/pmflow/run/status', params)
}

// publish status
export async function getFlowPublishStatus(params) {
  return request.get('/flow/publish/status', params)
}

// publish status
export async function editFlowInfo(params) {
  return request.post('/flow/edit', params)
}

// check input
export async function checkInput(params) {
  return request.get('/flow/pmflow/inputNode/check', params)
}