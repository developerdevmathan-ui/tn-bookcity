import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if token exists in localStorage (saved from previous session)
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token });
        }
        setIsLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token); // Save to browser
        setUser({ token });
    };

    const logout = () => {
        localStorage.removeItem('token'); // Delete from browser
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);