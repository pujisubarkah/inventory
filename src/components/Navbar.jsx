import React, { useState } from 'react';
import LoginModal from './LoginModal'; // Pastikan pathnya sesuai



const Navbar = () => {
    const [isModalOpen, setModalOpen] = useState(false); // State untuk modal

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return ( 
        <React.Fragment>
            <header className="flex justify-between items-center p-4 bg-[darkred] shadow-md">
                <div className="container w-4/5">
                    <div className="flex items-center justify-between relative">
                        <div className="px-4">
                            <a href="#hero" className="text-white font-bold text-2xl">Sistem Informasi Permintaan Barang Persediaan</a>
                        </div>

                        <div className="flex items-center px-4">
                            <button id="hamburger" name="hamburger" type="button" className="block absolute right-4 lg:hidden">
                                <span className="hamburger-line origin-top-left transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line transition duration-300 ease-in-out"></span>
                                <span className="hamburger-line origin-bottom-left transition duration-300 ease-in-out"></span>
                            </button>

                            <nav id="nav-menu" className="hidden absolute py-5 bg-white shadow-lg rounded-lg max-w-[250px] w-full right-5 top-full lg:block lg:static lg:bg-transparent lg:max-w-full lg:shadow-none">
                            <ul className="flex space-x-6"> {/* Menggunakan space-x-4 untuk menambah jarak antara menu */}
                                <li className="group">
                            <a href="#hero" className="text-white font-bold text-2xl">ATK+Cetakan</a>
                                </li>
                            <li className="group">
                            <a href="#about" className="text-white font-bold text-2xl">Alat Listrik</a>
                                </li>
                                    <li className="group">
                                        <button onClick={openModal} className="bg-transparent border border-white text-white text-base font-bold py-2 px-5 mx-8 rounded-none hover:bg-white hover:text-red-500 transition duration-300">LOGIN</button>
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