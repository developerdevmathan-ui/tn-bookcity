import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate inputs
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // 1. Send email/password to Laravel
            const response = await api.post('/auth/login', { email, password });
            
            // 2. If success, save token and redirect to Admin
            login(response.data.token);
            navigate('/admin'); 
            
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Admin Login</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" placeholder="Email"
                        className="w-full p-2 border rounded"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" placeholder="Password"
                        className="w-full p-2 border rounded"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}