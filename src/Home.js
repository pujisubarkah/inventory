import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import OrderFormModal from './components/OrderFormModal'; // Import the modal component

const Home = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null); // The product to be ordered

    useEffect(() => {
        const fetchProducts = async () => {
            // Fetch products along with their stock
            const { data: productsData, error: productsError } = await supabase
                .from('product')
                .select('*');

            if (productsError) {
                console.error('Error fetching products:', productsError.message);
                return;
            }

            // Map through products and calculate the total quantity_change
            const updatedData = productsData.map(product => {

                return {
                    ...product,
                    image_url: product.image_url.replace('ibb.co', 'ibb.co.com'),
                };
            });

            setProducts(updatedData);
        };

        fetchProducts();
    }, []);

    // Function to open the modal
    const openModal = (product) => {
    setSelectedProduct(product); // Set the product to be ordered
    setIsModalOpen(true);        // Open the modal
    };

    // Function to close the modal
    const closeModal = () => {
    setIsModalOpen(false);       // Close the modal
    setSelectedProduct(null);    // Clear the selected product
    };


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                    <div className="flex items-center p-4">
                        <img 
                            src={product.image_url} 
                            alt={product.product_name} 
                            className="w-20 h-20 object-cover rounded-lg mr-4"
                        />
                        <div>
                            <h3 className="text-lg font-semibold">{product.product_name}</h3>
                            <p className="text-gray-600">Stok: {product.quantity_change}</p>
                        </div>
                    </div>
                    <button className="m-4 w-[calc(100%-2rem)] bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded">
                        Buat Permintaan
                    </button>
                </div>
            ))}
            {/* Modal component */}
            <OrderFormModal 
                product={selectedProduct} 
                isOpen={isModalOpen} 
                onClose={closeModal} 
            />
        </div>
    );
};

export default Home;

