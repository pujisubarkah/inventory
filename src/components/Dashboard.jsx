import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate";
import AddProductModal from "./AddProductModal"; 
import EditProductModal from "./EditProductModal";
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
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [modalId, setModalId] = useState("");

    useEffect(() => {
        getProducts();
    }, [page, search, showModalAdd, showModalEdit]);

    const getProducts = async () => {
        try {
            const { data, error, count } = await supabase
                .from('products')
                .select('id, product_name, product_code, product_stock(quantity_change)', { count: 'exact' })
                .ilike('product_name', `%${search}%`)
                .range(page * limit, (page + 1) * limit - 1); 

            if (error) throw error;

            setProducts(data);
            setTotalRow(count);
            setTotalPage(Math.ceil(count / limit));
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    const [notificationCount, setNotificationCount] = useState(0);


    const searchData = (e) => {
        e.preventDefault();
        setPage(0);
        getProducts();
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



    return (
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
                    <div className="w-1/3 mt-1 flex rounded-md shadow-sm">
                        <form onSubmit={searchData} className="w-full">
                            <input 
                                type="text" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-3 py-2 border rounded-none rounded-l-md border-gray-300 focus:outline-none focus:ring-primary focus:ring-1 focus:border-indigo-400 sm:text-sm" 
                                placeholder="Cari produk..."
                                />
                        </form>
                        <button className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-sky-700 hover:bg-sky-600 px-4 text-sm text-white">    
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        </button>
                        <button className="relative">
                        <FaBell className="h-6 w-6 text-gray-700" />
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                    </button>

                    </div>
                </div>

                <div className="w-full flex justify-center mt-16">
                    <table className="border-collapse table-auto w-11/12 text-sm self-center">
                        <thead>
                            <tr>
                                
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">ID</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">kode</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Nama Produk</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Jumlah Stok</th>
                                <th className="border-b text-base dark:border-slate-600 font-medium p-4 text-slate-400 dark:text-slate-200 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{product.id}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{product.product_code}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{product.product_name}</td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                        {product.product_stock && product.product_stock.length > 0 ? 
                                            product.product_stock.reduce((total, stock) => total + stock.quantity_change, 0) 
                                            : 0}
                                    </td>
                                    <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400 flex">
                                    <button 
                                        onClick={() => { setModalId(product.id); setShowModalEdit(true); }} 
                                        className="text-blue-600 hover:text-blue-500"
                                        aria-label="Edit"
                                        >
                                            <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => deleteProduct(products.id)} 
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
                        previousClassName={"mx-1"}
                        nextClassName={"mx-1"}
                        activeClassName={"font-bold"}
                        pageLinkClassName={"border p-2 rounded"}
                        previousLinkClassName={"border p-2 rounded"}
                        nextLinkClassName={"border p-2 rounded"}
                    />
                )}
                {message && <p className="text-red-600 text-center mt-2">{message}</p>}
            </div>

            {showModalAdd && <AddProductModal 
                onClose={() => setShowModalAdd(false)} 
                onAdd={handleAddProduct} visible={true} />}
                
            {showModalEdit && <EditProductModal 
                onClose={() => setShowModalEdit(false)} 
                onEdit={handleEditProduct} productId={modalId} visible={true} />}
            
        </div>
    
    );
};

export default Dashboard;