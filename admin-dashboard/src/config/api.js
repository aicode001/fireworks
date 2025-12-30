// API 配置
// 开发环境使用 localhost，生产环境使用线上 IP
const isDev = import.meta.env.DEV

export const API_BASE_URL = isDev
    ? 'http://localhost:3000'
    : 'http://180.184.28.73:3000'
