import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PesanProductModal = ({ showModalAdd, setShowModalAdd, newOrder, setNewOrder, handleAddOrder }) => {
    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('product_code, product_name');
            if (error) {
                console.error("Error fetching products:", error);
            } else {
                setAvailableProducts(data);
            }
        };

        fetchProducts();
    }, []);

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProducts = newOrder.products.map((product, i) =>
            i === index ? { ...product, [name]: value } : product
        );

        // Update product name based on selected product code
        if (name === "product_code") {
            const selectedProduct = availableProducts.find(product => product.product_code === value);
            if (selectedProduct) {
                updatedProducts[index].nama_barang = selectedProduct.product_name; // Set nama_barang based on selection
            } else {
                updatedProducts[index].nama_barang = ''; // Reset if no match found
            }
        }

        setNewOrder({ ...newOrder, products: updatedProducts });
    };

    const handleAddProduct = () => {
        setNewOrder({
            ...newOrder,
            products: [...newOrder.products, { product_code: '', nama_barang: '', permintaan: '' }],
        });
    };

    const handleRemoveProduct = () => {
        if (newOrder.products.length > 0) {
            const updatedProducts = newOrder.products.slice(0, -1); // Remove last product
            setNewOrder({ ...newOrder, products: updatedProducts });
        }
    };

    const handleQuantityChange = (index, e) => {
        const { value } = e.target;
        const quantity = parseInt(value);
        const product = newOrder.products[index];

        // Check stock availability from product_stock table
        checkStockAvailability(product.product_code, quantity);

        const updatedProducts = newOrder.products.map((prod, i) =>
            i === index ? { ...prod, permintaan: value } : prod
        );
        setNewOrder({ ...newOrder, products: updatedProducts });
    };

    const checkStockAvailability = async (product_code, quantity) => {
        const { data, error } = await supabase
            .from('product_stock')
            .select('quantity')
            .eq('product_code', product_code)
            .single();

        if (error) {
            console.error("Error checking stock:", error);
            return;
        }

        if (data && quantity > data.quantity) {
            alert("Permintaan melebihi jumlah stok yang tersedia!");
        }
    };

    return (
        showModalAdd && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded shadow-lg w-1/3 p-6">
                    <h2 className="text-lg font-semibold mb-4">Tambah Order</h2>
                    <form onSubmit={handleAddOrder}>
                        <div className="mb-4">
                            <label className="block mb-1">Nama Pemesan</label>
                            <input
                                type="text"
                                value={newOrder.nama_pemesan}
                                onChange={e => setNewOrder({ ...newOrder, nama_pemesan: e.target.value })}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Unit Kerja</label>
                            <input
                                type="text"
                                value={newOrder.unit_kerja}
                                onChange={e => setNewOrder({ ...newOrder, unit_kerja: e.target.value })}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Products</label>
                            {newOrder.products.map((product, index) => (
                                <div key={index} className="flex mb-2">
                                    <select
                                        name="product_code"
                                        value={product.product_code}
                                        onChange={e => handleProductChange(index, e)}
                                        className="border rounded p-2 w-1/3 mr-2"
                                        required
                                    >
                                        <option value="">Pilih Kode Barang</option>
                                        {availableProducts.map((item) => (
                                            <option key={item.product_code} value={item.product_code}>
                                                {item.product_code} 
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="nama_barang"
                                        placeholder="Nama Barang"
                                        value={product.nama_barang}
                                        className="border rounded p-2 w-1/3 mr-2"
                                        readOnly
                                    />
                                    <input
                                        type="number"
                                        name="permintaan"
                                        placeholder="Permintaan"
                                        value={product.permintaan}
                                        onChange={e => handleQuantityChange(index, e)}
                                        className="border rounded p-2 w-1/3"
                                        required
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="bg-blue-500 text-white rounded p-2 mt-2"
                            >
                                Tambah Produk
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveProduct}
                                className="bg-yellow-500 text-white rounded p-2 mt-2 ml-2"
                            >
                                Kurang Produk
                            </button>
                        </div>
                        <button type="submit" className="bg-green-500 text-white rounded p-2">
                            Tambah Order
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModalAdd(false)}
                            className="bg-red-500 text-white rounded p-2 ml-2"
                        >
                            Tutup
                        </button>
                    </form>
                </div>
            </div>
        )
    );
};

export default PesanProductModal;
