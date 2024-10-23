import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { FaSearch } from 'react-icons/fa'; // Import search icon
import OrderFormModal from './components/OrderFormModal'; // Import the modal component

const Home = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null); // The product to be ordered
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [categoryFilter, setCategoryFilter] = useState(''); // State for category filter

    useEffect(() => {
        const fetchProducts = async () => {
            // Fetch products along with their stock
            const { data: productsData, error: productsError } = await supabase
                .from('product')
                .select('id, product_name, category_name, image_url, quantity_change');

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


    // Handle search query changes
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Function to handle search action when user presses enter
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Handle search action here, e.g., send searchQuery to the backend or filter displayed items
        console.log('Search for:', searchQuery);
        // Optionally, clear the search after submission
        setSearchQuery('');
    };


    // Filter products based on category
    const filteredProducts = products.filter(product => 
        (categoryFilter === '' || product.category_name === categoryFilter) &&
        (searchQuery === '' || product.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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


    const [user, setUser] = useState(null); // State to store user information

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        checkUser();
    }, []);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4 w-full">
            <img 
                src="https://img.freepik.com/premium-vector/mobile-login-flat-design-vector-illustration_1288538-7537.jpg?semt=ais_hybrid" 
                alt="Login required illustration" 
                className="w-full max-w-xs mb-4" 
                style={{ height: 'auto' }} 
            />
            <p className="text-xl font-semibold mt-4">Anda harus login untuk melihat barang persediaan yang tersedia</p>
            </div>
        );
    }

    return (
        <div className="p-4 w-full">
            {/* Category Filter and Search Bar Container */}
            <div className="flex justify-end mb-4 space-x-4">
                {/* Category Filter */}
                <select
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 rounded-md border focus:outline-none"
                >
                    <option value="">Semua Kategori</option>
                    <option value="Alat Tulis">Alat tulis</option>
                    <option value="Alat Listrik">Alat listrik</option>
                </select>
        
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 rounded-md border focus:outline-none"
                        placeholder="Cari barang persediaan"
                    />
                    <button type="submit" className="bg-white text-darkred p-2 rounded-md">
                        <FaSearch size={18} />
                    </button>
                </form>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                        <button 
                            onClick={() => openModal(product)}  // Correct modal opening function
                            className="m-4 w-[calc(100%-2rem)] bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded">
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
        </div>
    );
};

export default Home;

