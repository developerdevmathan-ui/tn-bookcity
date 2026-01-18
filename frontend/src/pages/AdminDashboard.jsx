import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderList from '../components/OrderList';
import BulkUpload from '../components/BulkUpload'; // <--- Import the new component

export default function AdminDashboard() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition"
                >
                    Logout
                </button>
            </nav>

            {/* Dashboard Content */}
            <div className="max-w-6xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Placeholder for future stats */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Total Orders</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                        <p className="text-gray-500 text-sm">Orders placed</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">💰 Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600">₹0</p>
                        <p className="text-gray-500 text-sm">From all orders</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">📚 Total Books</h3>
                        <p className="text-3xl font-bold text-purple-600">0</p>
                        <p className="text-gray-500 text-sm">In inventory</p>
                    </div>
                </div>

                {/* Bulk Upload Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Inventory</h3>
                    <BulkUpload />
                </div>

                {/* Orders Section */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Orders</h3>
                    <OrderList />
                </div>
            </div>
        </div>
    );
}