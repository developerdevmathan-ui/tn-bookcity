import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    
    // Checkout form state
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        city: '',
        state: '',
        postal_code: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.customer_name || !formData.customer_email || !formData.shipping_address) {
            setError('Please fill in all required fields');
            return;
        }

        if (cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setIsProcessing(true);

        try {
            // Send order to backend
            const response = await api.post('/orders', {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                shipping_address: formData.shipping_address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                cart: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            // Clear cart and redirect
            clearCart();
            navigate('/order-success', { state: { order: response.data.order } });

        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.error || 'Checkout failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Your cart is empty 🛒</h2>
                    <p className="text-gray-600 mb-6">Start adding books to your cart!</p>
                    <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // Tax and shipping calculation
    const subtotal = cartTotal;
    const tax = subtotal * 0.05; // 5% tax
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <Link to="/" className="text-blue-600 hover:underline">← Continue Shopping</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b hover:bg-gray-50 transition">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">₹{item.price}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-lg font-bold text-gray-700 hover:text-blue-600 transition"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-lg font-bold text-gray-700 hover:text-blue-600 transition"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="text-lg font-bold text-green-700 w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        
                                        {/* Remove Button */}
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"
                                            title="Remove from cart"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary & Checkout Form */}
                    <div className="lg:col-span-1">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 mb-6 border-b pb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (5%):</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold">Total:</span>
                                <span className="text-2xl font-bold text-green-700">₹{total.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={() => setShowCheckoutForm(!showCheckoutForm)}
                                className="w-full bg-green-600 text-white text-lg px-4 py-3 rounded hover:bg-green-700 transition font-bold"
                            >
                                {showCheckoutForm ? 'Hide Checkout' : 'Proceed to Checkout →'}
                            </button>
                        </div>

                        {/* Checkout Form */}
                        {showCheckoutForm && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-xl font-bold mb-4">Delivery Details</h3>

                                {error && (
                                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Name *</label>
                                        <input 
                                            type="text"
                                            name="customer_name"
                                            placeholder="Full Name"
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.customer_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Email *</label>
                                        <input 
                                            type="email"
                                            name="customer_email"
                                            placeholder="your@email.com"
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.customer_email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Phone</label>
                                        <input 
                                            type="tel"
                                            name="customer_phone"
                                            placeholder="Your Phone"
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.customer_phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Address *</label>
                                        <input 
                                            type="text"
                                            name="shipping_address"
                                            placeholder="Street Address"
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.shipping_address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">City</label>
                                            <input 
                                                type="text"
                                                name="city"
                                                placeholder="City"
                                                className="w-full border rounded p-2 text-sm"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">State</label>
                                            <input 
                                                type="text"
                                                name="state"
                                                placeholder="State"
                                                className="w-full border rounded p-2 text-sm"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Postal Code</label>
                                        <input 
                                            type="text"
                                            name="postal_code"
                                            placeholder="Postal Code"
                                            className="w-full border rounded p-2 text-sm"
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-bold disabled:bg-gray-400"
                                    >
                                        {isProcessing ? 'Processing...' : 'Place Order'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}