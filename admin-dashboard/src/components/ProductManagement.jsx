import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config/api'

const API_URL = API_BASE_URL

export default function ProductManagement({ token }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        img: '',
        limit: '',
        stock: ''
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`)
            const data = await response.json()
            setProducts(data)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB')
            return
        }

        setUploading(true)
        try {
            const uploadData = new FormData()
            uploadData.append('file', file)

            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: uploadData
            })

            const result = await response.json()

            if (result.success) {
                // Build full URL for the image
                const imgUrl = `${API_URL}${result.url}`
                setFormData({ ...formData, img: imgUrl })
            } else {
                alert(result.message || '上传失败')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('上传失败，请重试')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            ...(formData.img && { img: formData.img }),
            ...(formData.limit && { limit: parseInt(formData.limit) })
        }

        try {
            if (editingProduct) {
                await fetch(`${API_URL}/api/admin/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                await fetch(`${API_URL}/api/admin/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            fetchProducts()
            closeModal()
        } catch (error) {
            console.error('Failed to save product:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('确定要删除这个商品吗？')) return

        try {
            await fetch(`${API_URL}/api/admin/products/${id}`, {
                method: 'DELETE'
            })
            fetchProducts()
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                price: product.price.toString(),
                img: product.img || '',
                limit: product.limit?.toString() || '',
                stock: product.stock.toString()
            })
        } else {
            setEditingProduct(null)
            setFormData({ name: '', price: '', img: '', limit: '', stock: '' })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingProduct(null)
        setFormData({ name: '', price: '', img: '', limit: '', stock: '' })
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const clearImage = () => {
        setFormData({ ...formData, img: '' })
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    if (loading) {
        return <div className="text-center py-12">加载中...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">商品管理</h2>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                    + 添加商品
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图片</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">限购</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">库存</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.img ? (
                                        <img
                                            src={product.img}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded border border-gray-200"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/48?text=无图片'}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">无图片</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">¥{product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.limit || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => openModal(product)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingProduct ? '编辑商品' : '添加商品'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">商品图片</label>

                                {/* Image Preview */}
                                {formData.img && (
                                    <div className="mb-3 relative inline-block">
                                        <img
                                            src={formData.img}
                                            alt="预览"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/128?text=图片加载失败'}
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition inline-flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                上传中...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                选择图片
                                            </>
                                        )}
                                    </label>
                                    <span className="text-xs text-gray-400">支持 JPG、PNG、GIF，最大 5MB</span>
                                </div>

                                {/* Or enter URL manually */}
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-500 mb-1">或输入图片URL</label>
                                    <input
                                        type="url"
                                        value={formData.img}
                                        onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">限购数量（可选）</label>
                                <input
                                    type="number"
                                    value={formData.limit}
                                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
