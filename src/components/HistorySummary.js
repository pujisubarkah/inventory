// HistorySummary.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext'; // Pastikan path ini benar
import { supabase } from '../supabaseClient'; // Pastikan path ini benar
import html2pdf from 'html2pdf.js'; // Import library html2pdf

const HistorySummary = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false); // State untuk modal kepuasan
    const [selectedItem, setSelectedItem] = useState(null); // Item yang dipilih untuk rating
    const [rating, setRating] = useState(0); // State untuk nilai rating yang dipilih
    const [comment, setComment] = useState(''); // State untuk komentar

    useEffect(() => {
        const fetchItems = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('user_cart_summary') // Mengambil data dari view
                    .select('*')
                    .eq('user_id', user.id); // Filter berdasarkan user_id

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
        const element = document.getElementById('cart-summary'); // Ambil elemen yang akan dicetak
        const options = {
            margin: 1,
            filename: 'cart_summary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', orientation: 'portrait', format: 'letter', margin: 0.5 }
        };

        html2pdf().from(element).set(options).save(); // Mengunduh PDF
    };

    const handleCompleteItem = (itemId) => {
        setSelectedItem(itemId); // Set item yang dipilih untuk rating
        setIsRatingModalOpen(true); // Buka modal kepuasan
        setRating(0); // Reset rating saat membuka modal
        setComment(''); // Reset komentar saat membuka modal
    };

    const handleRatingSubmit = async () => {
        if (selectedItem && rating > 0) {
            console.log(`Submitting rating: User ID: ${user.id}, Product ID: ${selectedItem}, Rating: ${rating}, Comment: ${comment}`);
            
            const { data, error } = await supabase
                .from('ratings') // Tabel untuk menyimpan rating dan komentar
                .insert([
                    {
                        user_id: user.id,
                        product_id: selectedItem,
                        rating: rating,
                        comment: comment, // Menyimpan komentar
                    }
                ]);

            if (error) {
                console.error('Error submitting rating:', error.message);
            } else {
                console.log('Rating submitted successfully:', data);
                setIsRatingModalOpen(false); // Tutup modal setelah submit
            }
        } else {
            console.error('Invalid data for rating submission');
        }
    };

    const handleStarClick = (value) => {
        setRating(value); // Update nilai rating ketika bintang diklik
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                    &times; {/* Tombol tutup modal */}
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
                                        <th className="py-1 px-2 border">Aksi</th> {/* Kolom baru untuk tombol */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item, index) => (
                                        <tr key={item.product_id}>
                                            <td className="border px-2 py-1">{index + 1}</td>
                                            <td className="border px-2 py-1">{item.product_code}</td>
                                            <td className="border px-2 py-1">{item.product_name}</td>
                                            <td className="border px-2 py-1">{item.quantity}</td>
                                            <td className="border px-2 py-1">{item.status}</td>
                                            <td className="border px-2 py-1">
                                                <button
                                                    className="bg-green-500 text-white py-1 px-2 rounded"
                                                    onClick={() => handleCompleteItem(item.product_id)}
                                                >
                                                    Selesai
                                                </button>
                                            </td> {/* Tombol selesai di setiap produk */}
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

            {/* Modal Kepuasan */}
            {isRatingModalOpen && (
                <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Beri Penilaian Anda</h2>
                        <p>Berikan rating untuk produk ini:</p>
                        <div className="flex justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)} // Tangani klik pada bintang
                                    className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Tulis komentar Anda..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)} // Update komentar saat ditulis
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
                            className="bg-red-500 text-white py-2 px-4 rounded mt-2"
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
