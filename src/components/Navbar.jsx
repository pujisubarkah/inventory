import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal'; // Ensure path is correct
import CartSummary from './CartSummary'; // Import CartSummary component
import HistorySummary from './HistorySummary'; // Import HistorySummary component
import { FaShoppingCart } from 'react-icons/fa'; // Import cart icon
import { FaHistory } from 'react-icons/fa'; // Import history icon
import { supabase } from '../supabaseClient'; // Ensure this path is correct

const Navbar = () => {
    const [isModalOpen, setModalOpen] = useState(false); // State for modal
    const [isCartOpen, setCartOpen] = useState(false); // State for cart visibility
    const [isHistoryOpen, setHistoryOpen] = useState(false); // State for history visibility
    const [cartItemCount, setCartItemCount] = useState(0); // State for cart item count
    const [itemCount, setItemCount] = useState(0); // State for total item count
    const [user, setUser] = useState(null); // State to store user information
    

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const toggleCart = () => setCartOpen(!isCartOpen); // Function to toggle cart visibility
    const closeCart = () => setCartOpen(false); // Function to close cart
    const toggleHistory = () => setHistoryOpen(!isHistoryOpen); // Function to toggle cart visibility    
    const closeHistory = () => setHistoryOpen(false); // Function to close cart



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

    // Effect to check user status and fetch cart item count
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser) {
                // Fetch cart items for the logged-in user with status 'Add to Cart'
                const { data: cartData, error: cartError } = await supabase
                    .from('user_cart_summary') // Tabel yang menyimpan data keranjang
                    .select('quantity') // Ambil kolom quantity
                    .eq('user_id', currentUser.id) // Filter berdasarkan user_id
                    .eq('status', 'Add to Cart');

                if (cartError) {
                    console.error('Error fetching cart items:', cartError.message);
                } else {
                    // Hitung total item dalam keranjang dengan status 'Add to Cart'
                    const totalCartItems = cartData.reduce((acc, item) => acc + item.quantity, 0);
                    setCartItemCount(totalCartItems); // Update state cartItemCount
                }

                // Fetch all cart items for the logged-in user regardless of status
                const { data: allData, error: allError } = await supabase
                    .from('user_cart_summary') // Tabel yang menyimpan data keranjang
                    .select('quantity') // Ambil kolom quantity
                    .eq('user_id', currentUser.id); // Filter berdasarkan user_id

                if (allError) {
                    console.error('Error fetching all cart items:', allError.message);
                } else {
                    // Hitung total item dalam keranjang tanpa memperhatikan status
                    const totalItems = allData.reduce((acc, item) => acc + item.quantity, 0);
                    setItemCount(totalItems); // Update state itemCount
                }
            }
        };

        getSession(); // Call getSession when the component mounts

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            
            // Ulangi logika pengambilan data keranjang setelah login/logout
            if (currentUser) {
                const fetchCartData = async () => {
                    const { data, error } = await supabase
                        .from('user_cart_summary')
                        .select('quantity')
                        .eq('user_id', currentUser.id)
                        .eq('status','Add to Cart');

                    if (error) {
                        console.error('Error fetching cart items:', error.message);
                    } else {
                        const totalItems = data.reduce((acc, item) => acc + item.quantity, 0);
                        setCartItemCount(totalItems);
                    }
                    // Fetch all cart items for the logged-in user regardless of status
                    const { data: allData, error: allError } = await supabase
                        .from('user_cart_summary') // Tabel yang menyimpan data keranjang
                        .select('quantity') // Ambil kolom quantity
                        .eq('user_id', currentUser.id); // Filter berdasarkan user_id

                    if (allError) {
                        console.error('Error fetching all cart items:', allError.message);
                    } else {
                        // Hitung total item dalam keranjang tanpa memperhatikan status
                        const totalItems = allData.reduce((acc, item) => acc + item.quantity, 0);
                        setItemCount(totalItems); // Update state itemCount
                    }
                        };
                        fetchCartData();
                    } else {
                        setCartItemCount(0); // Reset cart count if user logs out
                    }
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
                                Layanan BULP LANRI
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Keranjang (Cart Icon) */}
                            <div className="relative">
                                <button className={`text-white relative ${cartItemCount > 0 ? 'text-yellow-400' : ''}`} onClick={toggleCart}>
                                    <FaShoppingCart size={24} />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Histori (History Icon) */}
                            <div className="relative">
                                <button className={`text-white relative ${itemCount > 0 ? 'text-yellow-400' : ''}`} onClick={toggleHistory}>
                                    <FaHistory size={24} />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {itemCount}
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
                                        className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 rounded hover:bg-white hover:text-red-500 transition duration-300"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={openModal}
                                    className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 rounded hover:bg-white hover:text-red-500 transition duration-300"
                                >
                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                    LOGIN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal Login */}
            <LoginModal isOpen={isModalOpen} onClose={closeModal} />

            {/* Cart Summary Modal */}
            {isCartOpen && <CartSummary onClose={() => setCartOpen(false)} />} {/* Menutup modal */}

            {/* History Summary Modal */}
            {isHistoryOpen && <HistorySummary onClose={() => setHistoryOpen(false)} />} {/* Menutup modal */}
        </React.Fragment>
    );
};

export default Navbar;
