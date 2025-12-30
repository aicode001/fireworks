import { useState } from 'react'
import ProductManagement from './ProductManagement'
import OrderManagement from './OrderManagement'

export default function Dashboard({ username, onLogout, token }) {
    const [activeTab, setActiveTab] = useState('products')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎆</span>
                            <h1 className="text-xl font-bold text-gray-800">烟花管理系统</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">欢迎, {username}</span>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition ${activeTab === 'products'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            商品管理
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition ${activeTab === 'orders'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            订单管理
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'products' && <ProductManagement token={token} />}
                {activeTab === 'orders' && <OrderManagement token={token} />}
            </main>
        </div>
    )
}
