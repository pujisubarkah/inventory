import React from 'react';

const Home = () => {
    const navigateToRuangan = () => {
        window.location.href = '/ruangan';

    };
    
    const navigateToPersediaan = () => {
        window.location.href = '/persediaan';

    };

    return (
        <div className="home-container" style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ marginBottom: '10px', fontSize: '3rem' }}>Layanan BULP LAN</h1>
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>Pesan ruangan dan barang persediaan di Bagian ULP LANRI</p>
            <div className="flex justify-center items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 max-w-4xl">
                    <div className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white p-8">
                        <div className="flex items-center mb-4">
                            <img 
                                src="https://sp-ao.shortpixel.ai/client/q_lossy,ret_img,w_1000,h_658/http://limus.id/wp-content/uploads/2018/11/WhatsApp-Image-2018-11-30-at-16.29.512-1000x658.jpeg"
                                alt="Layanan BMN, Permintaan Barang Persediaan"
                                className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">PERSEDIAAN</h3>
                                <p className="text-gray-600">Layanan BMN</p>
                            </div>
                        </div>
                        <button 
                            onClick={navigateToPersediaan}
                            className="w-full bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded">
                            Permintaan Barang
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white p-8">
                        <div className="flex items-center mb-4">
                            <img 
                                src="https://cms.workfrom.id/wp-content/uploads/2023/03/10.-ruang-rapat-minimalis.jpg"
                                alt="Layanan Rumah Tangga Peminjaman Ruangan"
                                className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">RUANGAN</h3>
                                <p className="text-gray-600">Layanan RT</p>
                            </div>
                        </div>
                        <button 
                            onClick={navigateToRuangan}
                            className="w-full bg-[darkred] hover:bg-red-600 text-white font-bold py-2 rounded"
                            >
                            Peminjaman Ruangan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;