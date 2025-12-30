import { db } from './index'
import { users, products } from './schema'

async function seed() {
    console.log('🌱 Seeding database...')

    // Create default admin user (password: admin123)
    // In production, use proper password hashing like bcrypt
    const hashedPassword = await Bun.password.hash('admin123')

    await db.insert(users).values({
        username: 'admin',
        password: hashedPassword
    }).onConflictDoNothing()

    // Seed initial products
    const initialProducts = [
        { name: '超级加特林15', price: 15, limit: 2, stock: 100 },
        { name: '蓝色海洋加特林', price: 38, stock: 50 },
        { name: '金钛柳加特林', price: 48, stock: 30 },
        { name: '流星水母(带接驳器)', price: 13, stock: 80 },
        { name: '狼嚎火箭', price: 25, stock: 60 },
        { name: '孔雀开屏', price: 38, stock: 40 },
        { name: '王者之风三分钟', price: 68, stock: 20 },
        { name: '36寸加长仙女棒', price: 6, stock: 200 },
        { name: '仙女变变变', price: 8, stock: 150 },
        { name: '绝地坦克', price: 38, stock: 35 },
        { name: '彩菊烟花', price: 9, stock: 120 },
        { name: '手持顺风车', price: 40, stock: 25 }
    ]

    for (const product of initialProducts) {
        await db.insert(products).values(product).onConflictDoNothing()
    }

    console.log('✅ Database seeded successfully!')
}

seed().catch(console.error)
