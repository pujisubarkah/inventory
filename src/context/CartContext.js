import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity) => {
        const existingItem = cartItems.find(item => item.product.id === product.id);
        if (existingItem) {
            // Update quantity if the product already exists in the cart
            setCartItems(cartItems.map(item => 
                item.product.id === product.id
                    ? { ...existingItem, quantity: existingItem.quantity + quantity }
                    : item
            ));
        } else {
            // Add new item to the cart
            setCartItems([...cartItems, { product, quantity }]);
        }
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook for easier access to the Cart context
export const useCart = () => {
    return useContext(CartContext);
};
