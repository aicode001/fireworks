// 服务器配置
// 可以通过环境变量覆盖这些配置

export const config = {
    // 服务器端口
    port: parseInt(process.env.PORT || '3000'),

    // 图片存储路径 (可以是绝对路径或相对路径)
    // Linux服务器示例: '/var/www/uploads/image'
    // Windows本地示例: './image' 或 'D:/uploads/image'
    imagePath: process.env.IMAGE_PATH || './image',

    // 图片访问URL前缀
    imageUrlPrefix: process.env.IMAGE_URL_PREFIX || '/image',

    // JWT密钥
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

    // 数据库路径
    dbPath: process.env.DB_PATH || './data.db'
}
