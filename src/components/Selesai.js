import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate";
import * as XLSX from 'xlsx'; 
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import Sidebar from "./Sidebar";

const Selesai = () => {
    const [order, setOrder] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRow, setTotalRow] = useState(0);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getOrder();
    }, [page]);

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

    const changePage = ({ selected }) => {
        setPage(selected);
        if (selected === 9) {
            setMessage("Jika belum menemukan produk yang dicari, Silahkan cari lewat kolom pencarian dengan keyword lebih spesifik!");
        } else {
            setMessage("");
        }
    };

    const exportToExcel = () => {
        const worksheetData = filteredOrder.map((order, index) => ({
            'No': page * limit + index + 1, // Adding the row number
            'Tanggal': order.created_at.split('T')[0], // Extracting date
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

    const [user, setUser] = useState(null);

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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery('');
    };

    const filteredOrder = order.filter(order => 
        searchQuery === '' || order.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Sidebar>
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
                                {filteredOrder.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                        <td className="border-b p-4 font-bold">{page * limit + index + 1}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.created_at.split('T')[0]}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.nama_lengkap}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.unit_kerja}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.product_code}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.product_name}</td>
                                        <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold">{order.quantity}</td>
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
                            className="flex justify-center mt-4"
                            previousLabel={"← Previous"}
                            nextLabel={"Next →"}
                            breakLabel={"..."}
                            pageCount={totalPage}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={changePage}
                            containerClassName={"flex space-x-2"}
                            pageClassName={"cursor-pointer"}
                            pageLinkClassName={"py-2 px-4 bg-white border rounded-md hover:bg-gray-200"}
                            previousClassName={"cursor-pointer"}
                            previousLinkClassName={"py-2 px-4 bg-white border rounded-md hover:bg-gray-200"}
                            nextClassName={"cursor-pointer"}
                            nextLinkClassName={"py-2 px-4 bg-white border rounded-md hover:bg-gray-200"}
                            activeClassName={"bg-gray-400 text-white"}
                        />
                    )}
                </div>
            </div>
        </Sidebar>
    );
};

export default Selesai;
