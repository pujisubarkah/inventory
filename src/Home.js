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
                .from('products')
                .select('id, product_name, image_url');

            if (productsError) {
                console.error('Error fetching products:', productsError.message);
                return;
            }

            // Fetch product stocks separately to sum quantity_change
            const { data: stocksData, error: stocksError } = await supabase
                .from('product_stock')
                .select('product_id, quantity_change');

            if (stocksError) {
                console.error('Error fetching product stocks:', stocksError.message);
                return;
            }

            // Map through products and calculate the total quantity_change
            const updatedData = productsData.map(product => {
                const stockEntries = stocksData.filter(stock => stock.product_id === product.id);
                const totalQuantity = stockEntries.reduce((total, stock) => total + stock.quantity_change, 0);

                return {
                    ...product,
                    totalQuantity, // Add the total quantity_change to the product object
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
                    <img 
                        src={product.image_url} 
                        alt={product.product_name} 
                        className="w-auto h-20 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">{product.product_name}</h3>
                        <p className="text-gray-600">Stok: {product.id.quantity_change}</p> {/* Display totalQuantity */}
                        <button className="mt-4 w-full bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded">
                            Buat Permintaan
                        </button>
                    </div>
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

