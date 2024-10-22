// CartSummary.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext'; // Pastikan path ini benar
import { supabase } from '../supabaseClient'; // Pastikan path ini benar
import html2pdf from 'html2pdf.js'; // Import library html2pdf

const CartSummary = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCartItems = async () => {
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

        fetchCartItems();
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

    const handleOrder = async () => {
        // Mengirim pesanan ke tabel orders
        const { error } = await supabase
            .from('orders') // Gantilah dengan tabel yang sesuai untuk menyimpan pesanan
            .insert(cartItems.map(item => ({
                user_id: user.id,
                product_id: item.product_id,
                quantity: item.quantity,
                message: 'Pesanan dari ' + item.unit_kerja // Pesan bisa disesuaikan
            })));

        if (error) {
            console.error('Error placing order:', error.message);
            alert('Gagal mengirim pesanan: ' + error.message);
        } else {
            alert('Pesanan berhasil dikirim!');

            // Hapus item dari cart setelah pesanan berhasil
            const { error: deleteError } = await supabase
                .from('user_cart_summary') // Gantilah dengan tabel yang sesuai untuk menyimpan cart
                .delete()
                .eq('user_id', user.id); // Pastikan Anda menggunakan filter yang benar

            if (deleteError) {
                console.error('Error clearing cart:', deleteError.message);
            } else {
                setCartItems([]); // Kosongkan state cartItems
            }

            onClose(); // Menutup modal setelah pesanan berhasil
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
                    &times; {/* Tombol tutup modal */}
                </button>
                <div className="cart-summary" id="cart-summary">
                    <h2 className="text-xl font-bold mb-4">Bukti Pengeluaran Barang Persediaan</h2>
                    {cartItems.length > 0 ? (
                        <>
                            <p className="font-bold">Nama: {cartItems[0]?.username}</p>
                            <p className="font-bold">Unit Kerja: {cartItems[0]?.unit_kerja}</p>
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="py-1 px-2 border">No</th>
                                        <th className="py-1 px-2 border">Kode Barang</th>
                                        <th className="py-1 px-2 border">Nama Barang</th>
                                        <th className="py-1 px-2 border">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item, index) => (
                                        <tr key={item.product_id}>
                                            <td className="border px-2 py-1">{index + 1}</td>
                                            <td className="border px-2 py-1">{item.product_code}</td>
                                            <td className="border px-2 py-1">{item.product_name}</td>
                                            <td className="border px-2 py-1">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={downloadPDF} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 mr-2">
                                Download PDF
                            </button>
                            <button onClick={handleOrder} className="bg-red-500 text-white py-2 px-4 rounded mt-4">
                                Pesan
                            </button>
                        </>
                    ) : (
                        <p>Keranjang Anda kosong.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
