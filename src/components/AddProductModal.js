import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Resizer from 'react-image-file-resizer';

const AddProductModal = ({ visible, onClose }) => {
    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [imageFile, setImageFile] = useState(null);

    const handleImageUpload = async (file) => {
        const apiKey = 'bfd49879de15fa360d0c35da9ea4daa3'; // Ganti dengan API Key ImgBB Anda
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.url; // Kembalikan URL gambar
        } else {
            throw new Error('Image upload failed');
        }
    };

    const handleImageResize = (file) => {
        return new Promise((resolve, reject) => {
            Resizer.imageFileResizer(
                file,
                800, // Lebar
                800, // Tinggi
                'JPEG', // Format
                100, // Kualitas
                0, // Rotasi
                (uri) => {
                    resolve(uri);
                },
                'blob' // Tipe output
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let uploadedImageUrl = '';

            // Tangani unggahan gambar jika ada file yang dipilih
            if (imageFile) {
                const resizedImage = await handleImageResize(imageFile); // Ukur ulang gambar
                uploadedImageUrl = await handleImageUpload(resizedImage); // Unggah gambar yang sudah diubah ukurannya
            }

            // Sisipkan ke tabel produk
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert([{ 
                    product_name: productName, 
                    product_code: productCode, 
                    category_name: productCategory,
                    image_url: uploadedImageUrl 
                }])
                .select();

            if (productError) {
                console.error('Error inserting product:', productError);
                return;
            }

            // Sisipkan ke tabel product_stock
            const productId = productData[0].id; // Ambil ID produk yang baru dibuat
            const { error: stockError } = await supabase
                .from('product_stock')
                .insert([{ product_id: productId, quantity_change: quantity }]);

            if (stockError) {
                console.error('Error inserting product stock:', stockError);
            }

            // Reset field form
            setProductName('');
            setProductCategory('');
            setProductCode('');
            setQuantity(0);
            setImageFile(null);

            // Tutup modal
            onClose();

        } catch (error) {
            console.error('Error inserting data:', error);
        }
    };

    const handleOnClose = (e) => {
        if (e.target.id === "background") onClose();
    };

    if (!visible) return null;

    return (
        <div id="background" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleOnClose}>
            <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-md shadow-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Add Product</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Product Code:</label>
                        <input
                            type="text"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Product Name:</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Product Name:</label>
                        <input
                            type="text"
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                        >
                            Tambah Barang
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
