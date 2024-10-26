import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Resizer from 'react-image-file-resizer';

const AddProductModal = ({ visible, onClose }) => {
    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [categoryId, setCategoryId] = useState(''); // Store selected category ID
    const [quantity, setQuantity] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]); // State to hold categories

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('product_category')
                .select('*');

            if (error) {
                console.error('Error fetching categories:', error);
            } else {
                setCategories(data);
            }
        };

        fetchCategories();
    }, []);

    const handleImageUpload = async (file) => {
        const apiKey = 'bfd49879de15fa360d0c35da9ea4daa3'; // Replace with your ImgBB API Key
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.url; // Return image URL
        } else {
            throw new Error('Image upload failed');
        }
    };

    const handleImageResize = (file) => {
        return new Promise((resolve, reject) => {
            Resizer.imageFileResizer(
                file,
                800, // Width
                800, // Height
                'JPEG', // Format
                100, // Quality
                0, // Rotation
                (uri) => {
                    resolve(uri);
                },
                'blob' // Output type
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let uploadedImageUrl = '';

            // Handle image upload if a file is selected
            if (imageFile) {
                const resizedImage = await handleImageResize(imageFile); // Resize image
                uploadedImageUrl = await handleImageUpload(resizedImage); // Upload resized image
            }

            // Insert into products table
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert([{ 
                    product_name: productName, 
                    product_code: productCode, 
                    category_id: categoryId, // Use selected category ID
                    image_url: uploadedImageUrl 
                }])
                .select();

            if (productError) {
                console.error('Error inserting product:', productError);
                return;
            }

            // Insert into product_stock table
            const productId = productData[0].id; // Get newly created product ID
            const { error: stockError } = await supabase
                .from('product_stock')
                .insert([{ product_id: productId, quantity_change: quantity }]);

            if (stockError) {
                console.error('Error inserting product stock:', stockError);
            }

            // Reset form fields
            setProductName('');
            setCategoryId(''); // Reset category
            setProductCode('');
            setQuantity(0);
            setImageFile(null);

            // Close modal
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
                        <label className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
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
