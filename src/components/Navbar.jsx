import React, { useState } from 'react';
import LoginModal from './LoginModal'; // Pastikan pathnya sesuai



const Navbar = () => {
    const [isModalOpen, setModalOpen] = useState(false); // State untuk modal

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return ( 
        <React.Fragment>
            <header className="flex justify-between items-center p-6 bg-[darkred] shadow-md">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center px-4">
                            <img src="/lanri.png" alt="Logo" className="w-16 h-auto mr-4" /> {/* Added margin-right */}
                            <a href="/" className="text-white font-bold text-2xl font-poppins">Sistem Informasi Permintaan Barang Persediaan</a>
                        </div>

                        <div className="flex items-center px-4">
                            <button id="hamburger" name="hamburger" type="button" className="block absolute right-4 lg:hidden">
                                <span className="hamburger-line origin-top-left transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line origin-bottom-left transition duration-300 ease-in-out"></span>
                            </button>

                            <nav id="nav-menu" className="hidden absolute py-5 bg-white shadow-lg rounded-lg max-w-[250px] w-full right-5 top-full lg:block lg:static lg:bg-transparent lg:max-w-full lg:shadow-none">
                                <ul className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 p-4 lg:p-0"> {/* Menggunakan space-x-8 untuk menambah jarak antara menu */}
                                    <li className="group flex items-center">
                                        <i className="fas fa-pencil-alt text-white mr-2"></i> {/* Icon untuk ATK+Cetakan */}
                                        <a href="/" className="text-white font-bold text-xl font-poppins">ATK+Cetakan</a>
                                    </li>
                                    <li className="group flex items-center">
                                        <i className="fas fa-lightbulb text-white mr-2"></i> {/* Icon untuk Alat Listrik */}
                                        <a href="/" className="text-white font-bold text-xl font-poppins">Alat Listrik</a>
                                    </li>
                                    <li className="group flex items-center">
                                        <button onClick={openModal} className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 mx-8 rounded hover:bg-white hover:text-red-500 transition duration-300">
                                            <i className="fas fa-sign-in-alt mr-2"></i> {/* Icon untuk LOGIN */}
                                            LOGIN
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal Login */}
            <LoginModal isOpen={isModalOpen} onClose={closeModal} />
        </React.Fragment>
    );
}


export default Navbar;
