import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate"; 
import * as XLSX from 'xlsx'; 
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import Sidebar from "./Sidebar";
import PesanProductModal from "./PesanProductModal";

const Selesai = () => {
    const [order, setOrder] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRow, setTotalRow] = useState(0);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    // State untuk menyimpan informasi order baru
    const [newOrder, setNewOrder] = useState({
        product_code: '',
        product_name: '',
        quantity: '',
        products: [],
    });

    // State untuk menyimpan informasi pengguna
    const [user, setUser] = useState(null);

    useEffect(() => {
        getOrder();
    }, [page]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role_id')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error.message);
                    setUser(null);
                } else if (profile.role_id === 1) {
                    setUser(user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUser();
    }, []);

    const getOrder = async () => {
        try {
            const { data, error, count } = await supabase
                .from('completed_cart_view')
                .select('*', { count: 'exact' })
                .range(page * limit, (page + 1) * limit - 1);

            if (error) throw error;

            setOrder(data);
            setTotalRow(count);
            setTotalPage(Math.ceil(count / limit));
        } catch (error) {
            console.error('Error fetching order:', error.message);
        }
    };

    const handleAddOrder = async (e) => {
        e.preventDefault();
        const { nama_pemesan, unit_kerja, products } = newOrder;

        // Periksa apakah semua kolom terisi
        if (!nama_pemesan || !unit_kerja || products.some(p => !p.kode_barang || !p.nama_barang || p.permintaan === '')) {
            alert("Semua kolom harus diisi!");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('completed_cart')
                .insert([{ nama_pemesan, unit_kerja, products }])
                .single();

            if (error) throw error;

            console.log("Order berhasil ditambahkan:", data);
            setShowModalAdd(false);
            getOrder();
        } catch (error) {
            console.error("Error:", error.message);
            alert("Error adding order");
        }
    };

    const changePage = ({ selected }) => {
        setPage(selected);
        if (selected === 9) {
            setMessage("Jika belum menemukan produk yang dicari, Silahkan cari lewat kolom pencarian dengan keyword lebih spesifik!");
        } else {
            setMessage("");
        }
    };

    const exportToExcel = () => {
        const worksheetData = order.map((order, index) => ({
            'No': page * limit + index + 1,
            'Tanggal': order.created_at.split('T')[0],
            'Nama Pemesan': order.nama_lengkap,
            'Unit Kerja': order.unit_kerja,
            'Kode Barang': order.product_code,
            'Nama Barang': order.product_name,
            'Permintaan': order.quantity,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, 'Orders_List.xlsx');
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4 w-full">
                <img 
                    src="https://img.freepik.com/premium-vector/mobile-login-flat-design-vector-illustration_1288538-7537.jpg?semt=ais_hybrid" 
                    alt="Login required illustration" 
                    className="w-1/2 mb-4"  
                    style={{ marginBottom: '20px', maxWidth: '20%', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
                />
                <p className="text-xl font-semibold">Anda harus login sebagai admin untuk mengakses dashboard</p>
            </div>
        );
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(''); // Kosongkan input pencarian setelah submit
    };

    const filteredOrder = order.filter(order => 
        searchQuery === '' || order.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = () => {
        setNewOrder({ ...newOrder, products: [...newOrder.products, { kode_barang: '', nama_barang: '', permintaan: '' }] });
    };

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProducts = newOrder.products.map((product, i) => i === index ? { ...product, [name]: value } : product);
        setNewOrder({ ...newOrder, products: updatedProducts });
    };

    return (
        <Sidebar>
            <div className="w-full mt-24">
                <div className="flex justify-between w-11/12 mx-auto">
                    <div className="w-1/3">
                        <button 
                            onClick={() => setShowModalAdd(true)} 
                            className="py-2 px-3 font-medium text-white rounded shadow flex items-center"
                            style={{ backgroundColor: '#a2003b', transition: 'background-color 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#900028'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a2003b'}
                        >
                            Pesan Lewat Admin
                        </button>
                    </div>
                </div>
                <div className="p-4 w-full">
                    <h1 className="text-2xl font-bold mb-4 text-center">Daftar Permintaan Barang</h1>
                    <div className="flex justify-end mb-4 space-x-4">
                        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full px-4 py-2 rounded-md border focus:outline-none"
                                placeholder="Cari nama pegawai"
                            />
                            <button type="submit" className="bg-white text-darkred p-2 rounded-md">
                                <FaSearch size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="w-full mt-24">
                        <div className="w-full flex justify-center mt-16">
                            <table className="border-collapse table-auto w-11/12 text-sm self-center">
                                <thead>
                                    <tr>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">No</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Tanggal</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Nama Pemesan</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Unit Kerja</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Kode Barang</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Nama Barang</th>
                                        <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Permintaan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrder.length > 0 ? filteredOrder.map((order, index) => (
                                        <tr key={order.id}>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{page * limit + index + 1}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.created_at.split('T')[0]}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.nama_lengkap}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.unit_kerja}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.product_code}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.product_name}</td>
                                            <td className="border-b text-center p-4 dark:border-slate-600">{order.quantity}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4">Data tidak ditemukan</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="flex justify-center my-4">
                        <ReactPaginate
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            pageCount={totalPage}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={changePage}
                            containerClassName={"flex justify-center items-center"}
                            pageClassName={"mx-1"}
                            pageLinkClassName={"border border-gray-400 rounded-full px-2 py-1"}
                            previousLinkClassName={"border border-gray-400 rounded-full px-2 py-1"}
                            nextLinkClassName={"border border-gray-400 rounded-full px-2 py-1"}
                            activeClassName={"bg-gray-300"}
                        />
                    </div>
                    {message && <p className="text-red-600 text-center">{message}</p>}
                    <div className="flex justify-center">
                        <button
                            onClick={exportToExcel}
                            className="flex items-center px-4 py-2 text-white bg-green-600 rounded shadow hover:bg-green-700 focus:outline-none"
                        >
                            <FaFileExcel className="mr-2" /> Export to Excel
                        </button>
                    </div>
                </div>
            </div>

            <PesanProductModal
                showModalAdd={showModalAdd}
                setShowModalAdd={setShowModalAdd}
                newOrder={newOrder}
                setNewOrder={setNewOrder}
                handleAddOrder={handleAddOrder}
                handleAddProduct={handleAddProduct}
                handleProductChange={handleProductChange}
            />
        </Sidebar>
    );
};

export default Selesai;