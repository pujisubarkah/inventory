import React, { useState } from 'react';

const OrderFormModal = ({ product, isOpen, onClose, addToCart }) => {
    const [quantity, setQuantity] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(value);

        if (value > product.quantity_change) {
            setErrorMessage('Permintaan melebihi stok!');
        } else {
            setErrorMessage('');
        }
    };

    const handleSubmit = () => {
        if (quantity <= product.quantity_change) {
            addToCart(product, quantity); // Tambahkan produk ke keranjang
            alert('Pesanan berhasil ditambahkan ke keranjang!');
            onClose();
        } else {
            setErrorMessage('Permintaan melebihi stok!');
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">{product.product_name}</h2>
                <p className="mb-2">Stok tersedia: {product.quantity_change}</p>
                
                <input 
                    type="number" 
                    value={quantity} 
                    onChange={handleQuantityChange} 
                    className="border border-gray-300 p-2 mb-2 w-full"
                    placeholder="Masukkan jumlah pesanan"
                />

                {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

                <button 
                    onClick={handleSubmit} 
                    disabled={quantity > product.quantity_change} 
                    className={`mt-4 w-full bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded ${quantity > product.quantity_change ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Tambahkan ke Keranjang
                </button>
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
