import React, { useState } from 'react';
import CartSummary from './CartSummary'; // Sesuaikan dengan path yang benar

const InventoryPage = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleOpenCart = () => {
        setIsCartOpen(true);
    };

    const handleCloseCart = () => {
        setIsCartOpen(false);
    };

    return (
        <div>
            <h1>Halaman Persediaan</h1>
            <button onClick={handleOpenCart} className="bg-green-500 text-white py-2 px-4 rounded">
                Buka Keranjang
            </button>
            
            {isCartOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded shadow-lg">
                        <CartSummary onClose={handleCloseCart} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
