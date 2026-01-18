import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Load cart from LocalStorage on startup
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Save cart to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // 3. Add to Cart Function
    const addToCart = (book) => {
        setCart((prevCart) => {
            // Check if book is already in cart
            const existingItem = prevCart.find(item => item.id === book.id);
            
            if (existingItem) {
                // If exists, just increase quantity
                return prevCart.map(item => 
                    item.id === book.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            // If new, add it with quantity 1
            return [...prevCart, { ...book, quantity: 1 }];
        });
    };

    // 4. Remove from Cart
    const removeFromCart = (bookId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== bookId));
    };

    // 5. Update Quantity
    const updateQuantity = (bookId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(bookId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === bookId ? { ...item, quantity } : item
            )
        );
    };

    // 6. Clear Cart
    const clearCart = () => {
        setCart([]);
    };

    // 7. Calculate Total Price
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);