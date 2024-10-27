import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import html2pdf from 'html2pdf.js';

const HistorySummary = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('user_cart_summary')
                    .select('*') // Ensure this includes product_id and final_quantity
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching cart items:', error.message);
                } else {
                    console.log('Fetched cart items:', data); // Log the fetched data
                    setCartItems(data);
                }
            }
            setLoading(false);
        };

        fetchItems();
    }, [user]);

    const downloadPDF = () => {
        const element = document.getElementById('cart-summary');
        const options = {
            margin: 1,
            filename: 'cart_summary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', orientation: 'portrait', format: 'letter', margin: 0.5 }
        };

        html2pdf().from(element).set(options).save();
    };

    const handleCompleteItem = async (itemId) => {
        console.log('Completing item with ID:', itemId);

        if (!itemId) {
            console.error('Item ID is undefined');
            return;
        }

        // Find the item to get its details
        const itemToComplete = cartItems.find(item => item.id === itemId);
        if (!itemToComplete) {
            console.error('Item not found in cartItems');
            return; 
        }

        // Log the item details to ensure product_id is present
        console.log('Completing item:', itemToComplete);

        // Insert the completed item into the completed_cart table
        const { error: insertError } = await supabase
            .from('completed_cart')
            .insert([{ 
                user_id: user.id, 
                product_id: itemToComplete.product_id, 
                quantity: itemToComplete.final_quantity 
            }]);

        if (insertError) {
            console.error('Error inserting into completed_cart:', insertError.message);
            return; 
        }

        // Delete the completed item from cart_product using product_id
        const { error: deleteError } = await supabase
            .from('cart_product')
            .delete()
            .eq('id', itemId); 

        if (deleteError) {
            console.error('Error deleting items from cart_product:', deleteError.message);
            return; 
        }

        // Fetch the updated cart items from user_cart_summary
        const { data: updatedData, error: fetchError } = await supabase
            .from('user_cart_summary')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) {
            console.error('Error fetching updated cart items:', fetchError.message);
        } else {
            setCartItems(updatedData);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                    &times;
                </button>
                <div className="cart-summary" id="cart-summary">
                    <h2 className="text-xl font-bold mb-4">Bukti Pengeluaran Barang Persediaan</h2>
                    {cartItems.length > 0 ? (
                        <>
                            <p className="font-bold">Nama: {cartItems[0]?.nama_lengkap}</p>
                            <p className="font-bold">Unit Kerja: {cartItems[0]?.unit_kerja}</p>
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="py-1 px-2 border">No</th>
                                        <th className="py-1 px-2 border">Kode Barang</th>
                                        <th className="py-1 px-2 border">Nama Barang</th>
                                        <th className="py-1 px-2 border">Jumlah</th>
                                        <th className="py-1 px-2 border">Status</th>
                                        <th className="py-1 px-2 border">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.filter(item => item.status !== 'selesai').map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="border px-2 py-1">{index + 1}</td>
                                            <td className="border px-2 py-1">{item.product_code}</td>
                                            <td className="border px-2 py-1">{item.product_name}</td>
                                            <td className="border px-2 py-1">{item.final_quantity}</td> {/* Changed here */}
                                            <td className="border px-2 py-1">{item.status}</td>
                                            <td className="border px-2 py-1">
                                                {/* Show button for "silakan diambil" and "selesai" statuses */}
                                                {item.status === 'Silakan Diambil' || item.status === 'Selesai' ? (
                                                    <button 
                                                        onClick={() => handleCompleteItem(item.id)}
                                                        className="bg-green-500 text-white py-1 px-2 rounded"
                                                    >
                                                        Selesai
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={downloadPDF} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 mr-2">
                                Download PDF
                            </button>
                        </>
                    ) : (
                        <p>Pesanan Anda Selesai</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorySummary;
