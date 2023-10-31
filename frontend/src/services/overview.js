import request from '@/utils/request'

export async function getOverviewComponent() {
  return request.get('/overview/component')
}

export async function getPromptApp(params) {
  return request.get('/app/list', params)
}