import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from 'react-modal';

const EditProductModal = ({ isOpen, onClose }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantityChange, setQuantityChange] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');
            
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        const { data, error } = await supabase
            .from('product_stock')
            .insert([
                { product_id: selectedProduct.id, quantity_change: quantityChange }
            ]);

        if (error) {
            console.error('Error updating quantity:', error);
        } else {
            console.log('Quantity updated:', data);
            setQuantityChange(0);
            onClose(); // Close modal after update
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit Product Quantity">
            <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
                <h2 className="text-2xl font-bold mb-4">Edit Product Quantity</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Select Product:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedProduct ? selectedProduct.id : ''}
                            onChange={(e) => {
                                const product = products.find(p => p.id === parseInt(e.target.value));
                                setSelectedProduct(product);
                            }}
                            required
                        >
                            <option value="">Select a product</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.product_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Quantity Change:</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md"
                            type="number"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(Number(e.target.value))}
                            required
                        />
                    </div>
                    <button
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                        type="submit"
                    >
                        Update Quantity
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default EditProductModal;
