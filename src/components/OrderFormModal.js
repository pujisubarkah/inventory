import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  // Import your AuthContext
import { useNavigate } from 'react-router-dom';  // For redirecting to login
import { supabase } from '../supabaseClient';

const OrderFormModal = ({ product, isOpen, onClose }) => {
    const [quantity, setQuantity] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const { user } = useContext(AuthContext);  // Get the current logged-in user
    const navigate = useNavigate(); // Initialize navigate

    // Handle quantity input change
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(value);

        if (value > product.quantity_change) {
            setErrorMessage('Permintaan melebihi stok!');
        } else {
            setErrorMessage('');
        }
    };

    // Function to add item to cart in Supabase
    const addToCart = async (product, quantity) => {
        try {
            // Insert the item into the 'cart' table
            const { error } = await supabase
                .from('cart_product')  // Assuming your table is called 'cart'
                .insert({
                    // Foreign key from auth.users
                    product_id: product.id,
                    quantity: quantity,
                    user_id: user.id,
                    status_id: (await supabase.from('order_status').select('id').eq('status', 'Add to Cart').single()).data.id,  // Get the id for 'Add to Cart' status
                });

            if (error) {
                throw new Error(error.message);
            }

            alert('Pesanan berhasil ditambahkan ke keranjang!');  // Keep this alert
            onClose();  // Close modal after successful add to cart
        } catch (error) {
            console.error('Error adding to cart:', error.message);
            setErrorMessage('Terjadi kesalahan saat menambahkan ke keranjang.');
        }
    };

    // Handle form submit to add product to cart
    const handleSubmit = () => {
        if (!user) {
            // If user is not logged in, show alert and redirect to login
            alert('Kamu harus login dulu sebelum memasukkan ke keranjang!');
            navigate('/'); // Redirect to the home page
            return; // Prevent further execution
        }

        if (quantity <= product.quantity_change) {
            addToCart(product, quantity);  // Add product to cart using Supabase
            onClose(); // Close modal after adding to cart
        } else {
            setErrorMessage('Permintaan melebihi stok!');
        }
    };

    if (!isOpen || !product) return null;  // Don't render modal if it's not open or product is null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">{product.product_name}</h2>
                <p className="mb-2">Stok tersedia: {product.quantity_change}</p>
                
                {/* Quantity Input */}
                <input 
                    type="number" 
                    value={quantity} 
                    onChange={handleQuantityChange} 
                    className="border border-gray-300 p-2 mb-2 w-full"
                    placeholder="Masukkan jumlah pesanan"
                />

                {/* Error Message for Stock */}
                {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

                {/* Add to Cart Button */}
                <button 
                    onClick={handleSubmit} 
                    disabled={quantity > product.quantity_change} 
                    className={`mt-4 w-full bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded ${quantity > product.quantity_change ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Tambahkan ke Keranjang
                </button>

                {/* Cancel Button */}
                <button 
                    onClick={onClose} 
                    className="w-full mt-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded"
                >
                    Batal
                </button>
            </div>
        </div>
    );
};

export default OrderFormModal;
