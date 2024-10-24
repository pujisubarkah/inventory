// HistorySummary.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import html2pdf from 'html2pdf.js';

const HistorySummary = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [show, setShow] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('user_cart_summary')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching cart items:', error.message);
                } else {
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
        setSelectedItem(itemId);
        setIsRatingModalOpen(true);
        setRating(0);
        setComment('');

        // Insert the completed item into the completed_cart table
        const { data, error: insertError } = await supabase
            .from('completed_cart')
            .insert([{ 
                user_id: user.id, 
                product_id: itemId,
            }]);

        if (insertError) {
            console.error('Error inserting into completed_cart:', insertError.message);
            return;
        }

        // Remove the item from the cart_product table
        const { error: deleteError } = await supabase
            .from('cart_product')  // Menghapus dari tabel asli
            .delete()
            .eq('product_id', itemId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error deleting item from cart_product:', deleteError.message);
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
            setCartItems(updatedData); // Update the cartItems after deleting the completed item
        }
    };

    const handleRatingSubmit = async () => {
        if (selectedItem === null) {
            console.error('No item selected for rating');
            return;
        }
        if (rating < 1 || rating > 5) {
            console.error('Rating must be between 1 and 5');
            return;
        }
        if (comment.trim() === '') {
            console.error('Comment cannot be empty when rating is provided');
            return;
        }

        const { data, error } = await supabase
            .from('ratings')
            .insert([{
                user_id: user.id,
                product_id: selectedItem,
                rating: rating,
                comment: comment,
            }]);

        if (error) {
            console.error('Error submitting rating:', error.message);
        } else {
            console.log('Rating submitted successfully:', data);
            setIsRatingModalOpen(false);
            setSelectedItem(null);
            setRating(0);
            setComment('');
            setShow(false);
            onClose();
        }
    };

    const handleStarClick = (value) => {
        setRating(value);
    };

    if (loading || !show) return null; // Don't render if loading or modal is not shown

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
                                        <tr key={item.product_id}>
                                            <td className="border px-2 py-1">{index + 1}</td>
                                            <td className="border px-2 py-1">{item.product_code}</td>
                                            <td className="border px-2 py-1">{item.product_name}</td>
                                            <td className="border px-2 py-1">{item.quantity}</td>
                                            <td className="border px-2 py-1">{item.status}</td>
                                            <td className="border px-2 py-1">
                                                <button 
                                                    onClick={() => handleCompleteItem(item.product_id)} 
                                                    className="bg-green-500 text-white py-1 px-2 rounded"
                                                >
                                                    Selesai
                                                </button>
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
                        <p>Keranjang Anda kosong.</p>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {isRatingModalOpen && (
                <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Beri Penilaian Anda</h2>
                        <p>Berikan rating untuk produk ini:</p>
                        <div className="flex justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Tulis komentar Anda..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                        />
                        <button
                            onClick={handleRatingSubmit}
                            className="bg-green-500 text-white py-2 px-4 rounded"
                        >
                            Kirim Rating
                        </button>
                        <button
                            onClick={() => setIsRatingModalOpen(false)}
                            className="text-gray-600 mt-2"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorySummary;
