import { defineConfig } from 'umi';
import theme from './theme'
const api = 'http://172.20.52.122:8888/';
const path = require('path');
export default defineConfig({
  publicPath: '/web/',
  title: 'Prompt Manager',
  favicon: './favicon.png',
  nodeModulesTransform: {
    type: 'none',
  },
  theme: {
    ...theme
  },
  locale: {
    default: 'en-US'
  },
  antd: {},
  routes: [
    {
      path: '/',
      component: '@/pages/layout',
      routes: [
        { path: '/', component: '@/pages/index', exact: true, name: 'home', parentKey: 0, key: 'home', isHide: true, },
        { path: '/Overview', component: '@/pages/overview', name: 'Overview', parentKey: 0, key: 'Overview' },
        { path: '/Prompt-Market', component: '@/pages/prompt-market/main', name: 'Prompt Market', parentKey: 0, key: 'Prompt Market' },
        { path: '/AI-Model', component: '@/pages/ai-model', name: 'AI Model', parentKey: 0, key: 'AI Model' },
        { path: '/Prompt-Engineering', component: '@/pages/chat/main', name: 'Prompt Engineering', parentKey: 0, key: 'Prompt Engineering' },
        { path: '/chat', component: '@/pages/chat/main', name: 'Chat', parentKey: 'Prompt Engineering', key: 'promptChat', ic: 'chat' },
        { path: '/flowEdit/:id', component: '@/pages/flow/flowEdit', name: 'flowEdit', parentKey: 'Prompt Engineering', isHide: true },
        { path: '/flowList', component: '@/pages/flow/flowList', name: 'Flow', parentKey: 'Prompt Engineering', key: 'flowList', ic: 'flow' },
        { path: '/Prompt-App', component: '@/pages/prompt-app/main', name: 'Prompt App', parentKey: 0, key: 'Prompt App' },
        { path: '/Prompt-Guide', component: '@/pages/prompt-guide', name: 'Prompt Guide', parentKey: 0, key: 'Prompt Guide', isHide: true, },
        { component: '@/pages/404', name: 'Not Found', parentKey: 0, key: 'Not Found', isHide: true, },
      ]
    },
  ],
  alias: {
    '@': path.resolve(__dirname, './src'),
    utils: path.resolve(__dirname, './src/utils'),
    services: path.resolve(__dirname, './src/services'),
    components: path.resolve(__dirname, './src/components'),
    config: path.resolve(__dirname, './src/config'),
  },
  fastRefresh: {},
  proxy: {
    '/api': {
      target: api,
      changeOrigin: true,
      pathRewrite: { '^api': '/api' },
    },
  },
});
