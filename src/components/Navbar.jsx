import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal'; // Ensure path is correct
import { FaShoppingCart } from 'react-icons/fa'; // Import cart icon
import { supabase } from '../supabaseClient'; // Ensure this path is correct

const Navbar = () => {
    const [isModalOpen, setModalOpen] = useState(false); // State for modal
    const [cartItemCount, setCartItemCount] = useState(0); // State for cart item count
    const [user, setUser] = useState(null); // State to store user information

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    // Function for Logout
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error during logout:', error.message);
        } else {
            setUser(null); // Reset user state to null after logout
            setCartItemCount(0); // Optionally reset cart item count
        }
    };

    // Effect to check user status
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        getSession(); // Call getSession when the component mounts

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null); // Set user or null if no session
        });

        return () => {
            authListener.subscription.unsubscribe(); // Clean up the listener
        };
    }, []);

    return (
        <React.Fragment>
            <header className="flex justify-between items-center p-6 bg-[darkred] shadow-md">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center px-4">
                            <img src="/lanri.png" alt="Logo" className="w-16 h-auto mr-4" />
                            <a href="/" className="text-white font-bold text-2xl font-poppins">
                                Sistem Informasi Permintaan Barang Persediaan
                            </a>
                        </div>

                        <div className="flex items-center px-4">
                            <button
                                id="hamburger"
                                name="hamburger"
                                type="button"
                                className="block absolute right-4 lg:hidden"
                            >
                                <span className="hamburger-line origin-top-left transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line origin-bottom-left transition duration-300 ease-in-out"></span>
                            </button>

                            <nav
                                id="nav-menu"
                                className="hidden absolute py-5 bg-white shadow-lg rounded-lg max-w-[250px] w-full right-5 top-full lg:block lg:static lg:bg-transparent lg:max-w-full lg:shadow-none"
                            >
                                <ul className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 p-4 lg:p-0">
                                    <li className="group flex items-center">
                                        <i className="fas fa-pencil-alt text-white mr-2"></i>
                                        <a href="/" className="text-white font-bold text-xl font-poppins">
                                            ATK+Cetakan
                                        </a>
                                    </li>
                                    <li className="group flex items-center">
                                        <i className="fas fa-lightbulb text-white mr-2"></i>
                                        <a href="/" className="text-white font-bold text-xl font-poppins">
                                            Alat Listrik
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* Keranjang (Cart Icon) */}
                        <div className="relative">
                            <button className="text-white relative">
                                <FaShoppingCart size={24} />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Login/Logout Section */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-white font-bold">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 rounded-none hover:bg-white hover:text-red-500 transition duration-300"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={openModal}
                                className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 mx-8 rounded hover:bg-white hover:text-red-500 transition duration-300"
                            >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                LOGIN
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Modal Login */}
            <LoginModal isOpen={isModalOpen} onClose={closeModal} />
        </React.Fragment>
    );
};

export default Navbar;
