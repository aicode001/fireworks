import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { db } from './db'
import { users, products, orders, orderItems } from './db/schema'
import { eq } from 'drizzle-orm'

const app = new Elysia()
    .use(cors())
    .use(html())
    .use(swagger({
        path: '/swagger',
        documentation: {
            info: {
                title: '烟花商城 API',
                version: '1.0.0',
                description: '烟花售卖系统 API 文档'
            },
            tags: [
                { name: 'Products', description: '商品相关接口' },
                { name: 'Orders', description: '订单相关接口' },
                { name: 'Admin', description: '管理员接口' }
            ]
        }
    }))
    .use(jwt({
        name: 'jwt',
        secret: 'your-secret-key-change-in-production'
    }))

    // ============ Shop Frontend ============
    .get('/', () => `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>烟花小铺</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 pb-24" x-data="shopCart()">
    <!-- 头部 -->
    <header class="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 class="text-xl font-bold text-center">🎆 2025 烟花直营店</h1>
    </header>

    <!-- 列表 -->
    <div class="p-4 space-y-4">
        <template x-for="item in products" :key="item.id">
            <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg text-gray-800" x-text="item.name"></h3>
                    <p class="text-red-500 font-semibold">¥<span x-text="item.price"></span></p>
                    <p x-show="item.limit" class="text-xs text-gray-400" x-text="'限购' + item.limit + '单'"></p>
                    <p class="text-xs text-gray-500" x-text="'库存: ' + item.stock"></p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="minus(item)" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">-</button>
                    <span class="w-4 text-center font-bold" x-text="cart[item.id] || 0"></span>
                    <button @click="plus(item)" class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold">+</button>
                </div>
            </div>
        </template>
    </div>

    <!-- 底部结算栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div>
            <p class="text-gray-500 text-sm">合计金额</p>
            <p class="text-2xl font-bold text-red-600">¥<span x-text="totalPrice"></span></p>
        </div>
        <button @click="checkout" class="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg active:scale-95 transition-transform">
            立即下单
        </button>
    </div>

    <script>
        function shopCart() {
            return {
                products: [],
                cart: {},
                get totalPrice() {
                    return this.products.reduce((sum, p) => sum + (this.cart[p.id] || 0) * p.price, 0)
                },
                async init() {
                    const res = await fetch('/api/products');
                    this.products = await res.json();
                },
                plus(item) {
                    let count = this.cart[item.id] || 0;
                    if(item.limit && count >= item.limit) {
                        alert('该商品限购' + item.limit + '件哦');
                        return;
                    }
                    if(count >= item.stock) {
                        alert('库存不足');
                        return;
                    }
                    this.cart[item.id] = count + 1;
                },
                minus(item) {
                    let count = this.cart[item.id] || 0;
                    if(count > 0) this.cart[item.id] = count - 1;
                },
                async checkout() {
                    if(this.totalPrice === 0) return alert('请先选择商品');
                    const name = prompt('请输入联系人姓名');
                    const phone = prompt('请输入联系电话');
                    if(!name || !phone) return;
                    
                    const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({name, phone, cart: this.cart, total: this.totalPrice})
                    });
                    const data = await res.json();
                    alert(data.message);
                    if(data.success) this.cart = {};
                }
            }
        }
    </script>
</body>
</html>
    `)

    // ============ API Endpoints ============

    // Get all products
    .get('/api/products', async () => {
        const allProducts = await db.select().from(products)
        return allProducts
    })

    // Create order
    .post('/api/orders', async ({ body }) => {
        try {
            // Create order
            const [order] = await db.insert(orders).values({
                customerName: body.name,
                customerPhone: body.phone,
                totalPrice: body.total,
                status: 'pending'
            }).returning()

            if (!order) {
                throw new Error('Failed to create order')
            }

            // Create order items
            for (const [productId, quantity] of Object.entries(body.cart)) {
                if (quantity > 0) {
                    const [product] = await db.select().from(products).where(eq(products.id, parseInt(productId)))

                    if (!product) {
                        throw new Error(`Product with id ${productId} not found`)
                    }

                    await db.insert(orderItems).values({
                        orderId: order.id,
                        productId: parseInt(productId),
                        quantity: quantity,
                        price: product.price
                    })
                }
            }

            return { success: true, message: '下单成功！我们将尽快联系您送货。', orderId: order.id }
        } catch (error) {
            console.error('Order creation error:', error)
            return { success: false, message: '下单失败，请稍后重试' }
        }
    }, {
        body: t.Object({
            name: t.String(),
            phone: t.String(),
            cart: t.Record(t.String(), t.Number()),
            total: t.Number()
        })
    })

    // Admin Login
    .post('/api/admin/login', async ({ body, jwt }) => {
        try {
            const [user] = await db.select().from(users).where(eq(users.username, body.username))

            if (!user) {
                return { success: false, message: '用户名或密码错误' }
            }

            const isValid = await Bun.password.verify(body.password, user.password)

            if (!isValid) {
                return { success: false, message: '用户名或密码错误' }
            }

            const token = await jwt.sign({ userId: user.id, username: user.username })

            return { success: true, token, username: user.username }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: '登录失败' }
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })

    // Get all orders (Admin only)
    .get('/api/admin/orders', async ({ headers }) => {
        // In production, verify JWT token here
        const allOrders = await db.select().from(orders)
        return allOrders
    })

    // Get order details with items (Admin only)
    .get('/api/admin/orders/:id', async ({ params }) => {
        const orderId = parseInt(params.id)
        const [order] = await db.select().from(orders).where(eq(orders.id, orderId))
        const items = await db.select({
            id: orderItems.id,
            productId: orderItems.productId,
            productName: products.name,
            quantity: orderItems.quantity,
            price: orderItems.price
        })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, orderId))

        return { order, items }
    })

    // Update order status (Admin only)
    .patch('/api/admin/orders/:id', async ({ params, body }) => {
        const orderId = parseInt(params.id)
        await db.update(orders)
            .set({ status: body.status, updatedAt: new Date().toISOString() })
            .where(eq(orders.id, orderId))
        return { success: true }
    }, {
        body: t.Object({
            status: t.String()
        })
    })

    // Create product (Admin only)
    .post('/api/admin/products', async ({ body }) => {
        const [product] = await db.insert(products).values(body).returning()
        return { success: true, product }
    }, {
        body: t.Object({
            name: t.String(),
            price: t.Number(),
            limit: t.Optional(t.Number()),
            stock: t.Number()
        })
    })

    // Update product (Admin only)
    .put('/api/admin/products/:id', async ({ params, body }) => {
        const productId = parseInt(params.id)
        await db.update(products)
            .set({ ...body, updatedAt: new Date().toISOString() })
            .where(eq(products.id, productId))
        return { success: true }
    }, {
        body: t.Object({
            name: t.String(),
            price: t.Number(),
            limit: t.Optional(t.Number()),
            stock: t.Number()
        })
    })

    // Delete product (Admin only)
    .delete('/api/admin/products/:id', async ({ params }) => {
        const productId = parseInt(params.id)
        await db.delete(products).where(eq(products.id, productId))
        return { success: true }
    })

    .listen(3000)

console.log('🚀 烟花App运行在: http://localhost:3000')
console.log('📚 API文档: http://localhost:3000/swagger')