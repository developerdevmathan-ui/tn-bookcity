import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/orders');
            // Handle both paginated and direct response
            const orderData = response.data.data || response.data;
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-cyan-100 text-cyan-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <p className="text-gray-500 text-center">Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                    {error}
                    <button 
                        onClick={fetchOrders}
                        className="ml-4 underline hover:no-underline font-bold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
                <p className="text-gray-500">No orders yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6 border border-gray-200">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-bold">📦 Recent Orders ({orders.length})</h3>
                <button 
                    onClick={fetchOrders}
                    className="text-sm text-blue-600 hover:text-blue-800 font-bold"
                >
                    ↻ Refresh
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-800 uppercase font-bold sticky top-0">
                        <tr>
                            <th className="p-4">Order #</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr 
                                key={order.id} 
                                className="hover:bg-gray-50 transition cursor-pointer"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <td className="p-4 font-mono font-bold text-gray-900">
                                    {order.order_number || `#${order.id}`}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{order.customer_name}</div>
                                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                                </td>
                                <td className="p-4 text-green-700 font-bold text-lg">
                                    ₹{parseFloat(order.total_amount).toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded font-bold">
                                        {order.items?.length || 0} item(s)
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:text-blue-800 font-bold text-sm">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder && (
                <div className="border-t bg-gray-50 p-6">
                    {orders.find(o => o.id === expandedOrder) && (
                        <div>
                            <h4 className="font-bold text-lg mb-4">
                                Order Items for {orders.find(o => o.id === expandedOrder).order_number}
                            </h4>
                            <div className="space-y-2">
                                {orders.find(o => o.id === expandedOrder).items?.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="flex justify-between items-center bg-white p-3 rounded border"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {item.book_title || item.book?.translations?.[0]?.title || 'Unknown Book'}
                                            </p>
                                            <p className="text-xs text-gray-500">SKU: {item.book_sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">x{item.quantity}</p>
                                            <p className="text-green-600 font-bold">₹{parseFloat(item.total_price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}