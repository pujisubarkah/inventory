import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate";
import AddProductModal from "./AddProductModal"; 
import EditProductModal from "./EditProductModal";
import Sidebar from "./Sidebar";
import * as XLSX from 'xlsx'; 
import { FaFileExcel } from 'react-icons/fa';  
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRow, setTotalRow] = useState(0);
    const [message, setMessage] = useState("");
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [modalId, setModalId] = useState("");
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        getProducts();
    }, [page, showModalAdd, showModalEdit]);

    const getProducts = async () => {
        try {
            const { data, error, count } = await supabase
                .from('products')
                .select('id, product_name, product_code, product_stock(quantity_change)', { count: 'exact' })
                .range(page * limit, (page + 1) * limit - 1);

            if (error) throw error;

            setProducts(data);
            setTotalRow(count);
            setTotalPage(Math.ceil(count / limit));
        } catch (error) {
            console.error('Error fetching products:', error.message);
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

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            getProducts();
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
    };

    const handleAddProduct = async (newProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .insert(newProduct);

            if (error) throw error;

            setShowModalAdd(false);
            getProducts();
        } catch (error) {
            console.error('Error adding product:', error.message);
        }
    };

    const handleEditProduct = async (updatedProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .update(updatedProduct)
                .eq('id', modalId);

            if (error) throw error;

            setShowModalEdit(false);
            getProducts();
        } catch (error) {
            console.error('Error editing product:', error.message);
        }
    };

    const exportToExcel = () => {
        const worksheetData = products.map(product => ({
            'Name': product.product_name,
            'Stock Quantity': product.product_stock && product.product_stock.length > 0 ? 
                product.product_stock.reduce((total, stock) => total + stock.quantity_change, 0) 
                : 0,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, 'Products_List.xlsx');
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

    return (
        <Sidebar>
        <div>
            <div className="w-full mt-24">
                <div className="flex justify-between w-11/12 mx-auto ">
                    <div className="w-1/3">
                        <button onClick={() => setShowModalAdd(true)} className="py-2 px-3 font-medium text-white rounded shadow flex items-center"
                        style={{ backgroundColor: '#a2003b', transition: 'background-color 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#900028'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a2003b'}>
                            Tambah Produk
                        </button>
                    </div>
                    <div className="relative">
                        <FaBell className="h-6 w-6 text-gray-700" />
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full flex justify-center mt-16">
                    <table className="border-collapse table-auto w-11/12 text-sm self-center">
                        <thead>
                            <tr>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">No</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Kode Barang</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Nama Barang</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Jumlah Stok</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{index + 1}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{product.product_code}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>{product.product_name}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                                        {product.product_stock && product.product_stock.length > 0 ? 
                                            product.product_stock.reduce((total, stock) => total + stock.quantity_change, 0) 
                                            : 0}
                                    </td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-black font-bold flex" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                                        <button 
                                            onClick={() => { setModalId(product.id); setShowModalEdit(true); }} 
                                            className="text-blue-600 hover:text-blue-500"
                                            aria-label="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(product.id)} 
                                            className="text-red-600 hover:text-red-500" 
                                            aria-label="Delete"
                                        >
                                            <FaTrash />
                                        </button>
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
            </div>

            {showModalAdd && (
                <AddProductModal 
                    show={showModalAdd} 
                    onClose={() => setShowModalAdd(false)} 
                    onSubmit={handleAddProduct}
                    visible={showModalAdd}
                />
            )}

            {showModalEdit && (
                <EditProductModal 
                    show={showModalEdit} 
                    onClose={() => setShowModalEdit(false)} 
                    onSubmit={handleEditProduct} 
                    productId={modalId}
                    visible={showModalEdit}
                />
            )}
        </div>
        </Sidebar>
    );
};

export default Dashboard;