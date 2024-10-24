import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate";
import * as XLSX from 'xlsx'; 
import { FaFileExcel, FaSearch } from 'react-icons/fa'; 
import { FaBell } from 'react-icons/fa';
import Sidebar from "./Sidebar";


const Pesanan = () => {
    const [order, setOrder] = useState([]);
    const [status, setStatus] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRow, setTotalRow] = useState(0);
    const [message, setMessage] = useState("");
    const [notificationCount, setNotificationCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [statusFilter, setStatusFilter] = useState(''); // State for category filter


    useEffect(() => {
        getOrder();
        getStatus();
    }, [page]);

    const getOrder = async () => {
        try {
            const { data, error, count } = await supabase
                .from('user_cart_summary')
                .select('*')
                .range(page * limit, (page + 1) * limit - 1);

            if (error) throw error;

            setOrder(data);
            setTotalRow(count);
            setTotalPage(Math.ceil(count / limit));
        } catch (error) {
            console.error('Error fetching order:', error.message);
        }
    };

    const getStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('order_status')
                .select('*');

            if (error) throw error;

            setStatus(data);
        } catch (error) {
            console.error('Error fetching order:', error.message);
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
        const worksheetData = order.map(order => ({
            'Produk': order.product_name,
            'Jumlah Pesanan': order.quantity,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, 'Orders_List.xlsx');
    };


    const [user, setUser] = useState(null); // State to store user information

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

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4 w-full">
                <img src="https://img.freepik.com/premium-vector/mobile-login-flat-design-vector-illustration_1288538-7537.jpg?semt=ais_hybrid" alt="Login required illustration" className="w-1/2 mb-4"  style={{ marginBottom: '20px', maxWidth: '20%', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                <p className="text-xl font-semibold">Anda harus login sebagai admin untuk mengakses dashboard</p>
            </div>
        );
    }
    
    const handleQuantityChange = async (itemId, newQuantity) => {
        const { error } = await supabase
            .from('cart_product')
            .update({ final_quantity: newQuantity })
            .eq('id', itemId);

        if (error) {
            console.error('Error updating quantity:', error.message);
            alert('Gagal mengubah jumlah: ' + error.message);
        } else {
            setOrder(order.map(item => item.id === itemId ? { ...item, final_quantity: newQuantity } : item));
        }
    };

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
        const filteredOrder = order.filter(order => 
            (statusFilter === '' || order.status === statusFilter) &&
            (searchQuery === '' || order.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    return (
        <Sidebar>
        <div className="p-4 w-full">
            {/* Category Filter and Search Bar Container */}
            <div className="flex justify-end mb-4 space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                        <FaBell className="h-6 w-6 text-gray-700" />
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                </div>
                {/* Category Filter */}
                <select
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-md border focus:outline-none"
                >
                    <option value=""><i>Pilih Status</i></option>
                    {status.map((statusOption) => (
                        <option key={statusOption.id} value={statusOption.status}>
                            {statusOption.status}
                        </option>
                    ))}
                </select>
        
                {/* Search Bar */}
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
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Diterima</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrder.map((order, index) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{index + 1}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.created_at.split('T')[0]}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.nama_lengkap}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.unit_kerja}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.product_code}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.product_name}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{order.quantity}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                                        <input
                                            type="number"
                                            value={order.final_quantity}
                                            onChange={(e) => handleQuantityChange(order.id, e.target.value)}
                                            className="w-full text-left"
                                                />
                                    </td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                                        <select
                                            value={order.status}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                const statusOption = status.find(option => option.status === newStatus);
                                                const newStatusId = statusOption ? statusOption.id : null;
                                                const { error } = await supabase
                                                    .from('cart_product')
                                                    .update({ status_id: newStatusId })
                                                    .eq('id', order.id);

                                                if (error) {
                                                    console.error('Error updating status:', error.message);
                                                    alert('Gagal mengubah status: ' + error.message);
                                                } else {
                                                    setOrder(filteredOrder.map(item => item.id === order.id ? { ...item, status: newStatus } : item));
                                                }
                                            }}
                                            className="w-full text-left"
                                        >
                                            {status.map((statusOption) => (
                                                <option key={statusOption.id} value={statusOption.status}>
                                                    {statusOption.status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-4">
                    <button onClick={exportToExcel} className="py-2 px-4 bg-green-600 text-white rounded">
                        <FaFileExcel className="inline-block mr-1" />
                        Export to Excel
                    </button>
                </div>

                {totalRow > 0 && (
                    <ReactPaginate
                        previousLabel={"<"}
                        nextLabel={">"}
                        breakLabel={"..."}
                        pageCount={totalPage}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={changePage}
                        containerClassName={"flex justify-center mt-4"}
                        pageClassName={"mx-1"}
                        pageLinkClassName={"px-3 py-1 border rounded"}
                        activeLinkClassName={"bg-blue-500 text-white"}
                        previousLinkClassName={"px-3 py-1 border rounded"}
                        nextLinkClassName={"px-3 py-1 border rounded"}
                    />
                )}
                {message && <p className="text-center text-gray-500 mt-4">{message}</p>}
                <br></br><br></br>
            </div>
        </div>
        </Sidebar>
    );
};

export default Pesanan;
