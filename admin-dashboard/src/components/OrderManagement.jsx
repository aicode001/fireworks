import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
}

const statusLabels = {
    pending: '待处理',
    confirmed: '已确认',
    delivered: '已送达',
    cancelled: '已取消'
}

export default function OrderManagement({ token }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderDetails, setOrderDetails] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/orders`)
            const data = await response.json()
            setOrders(data.sort((a, b) => b.id - a.id))
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`)
            const data = await response.json()
            setOrderDetails(data)
            setSelectedOrder(orderId)
        } catch (error) {
            console.error('Failed to fetch order details:', error)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            fetchOrders()
            if (selectedOrder === orderId) {
                fetchOrderDetails(orderId)
            }
        } catch (error) {
            console.error('Failed to update order status:', error)
        }
    }

    if (loading) {
        return <div className="text-center py-12">加载中...</div>
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">订单管理</h2>
                <p className="text-gray-600 mt-1">共 {orders.length} 个订单</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-y-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => fetchOrderDetails(order.id)}
                                        className={`cursor-pointer hover:bg-gray-50 ${selectedOrder === order.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                                        <td className="px-4 py-3 text-sm text-red-600 font-semibold">¥{order.totalPrice}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    {orderDetails ? (
                        <div>
                            <h3 className="text-xl font-bold mb-4">订单详情 #{orderDetails.order.id}</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-sm text-gray-500">客户姓名</label>
                                    <p className="font-medium">{orderDetails.order.customerName}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">联系电话</label>
                                    <p className="font-medium">{orderDetails.order.customerPhone}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">下单时间</label>
                                    <p className="font-medium">{new Date(orderDetails.order.createdAt).toLocaleString('zh-CN')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">订单状态</label>
                                    <div className="mt-2 flex gap-2">
                                        {Object.entries(statusLabels).map(([status, label]) => (
                                            <button
                                                key={status}
                                                onClick={() => updateOrderStatus(orderDetails.order.id, status)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition ${orderDetails.order.status === status
                                                        ? statusColors[status]
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">订单商品</h4>
                                <div className="space-y-2">
                                    {orderDetails.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                                            </div>
                                            <p className="text-red-600 font-semibold">¥{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-lg">总计</span>
                                    <span className="font-bold text-2xl text-red-600">¥{orderDetails.order.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <p>请选择一个订单查看详情</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
