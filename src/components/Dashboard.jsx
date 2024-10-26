import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import ReactPaginate from "react-paginate";
import AddProductModal from "./AddProductModal"; 
import EditProductModal from "./EditProductModal";
import Sidebar from "./Sidebar";
import * as XLSX from 'xlsx'; 
import { FaFileExcel, FaEdit, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPage, setTotalPage] = useState(0);
    const [totalRow, setTotalRow] = useState(0);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [modalId, setModalId] = useState("");
    const [modalQuantityChange, setModalQuantityChange] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getProducts();
    }, [page, showModalAdd, showModalEdit]);

    const getProducts = async () => {
        try {
            const { data, error, count } = await supabase
            .from('products')
            .select(`
                id,
                product_name,
                product_code,
                product_stock(quantity_change),
                product_category(category_name) 
            `, { count: 'exact' })
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

    const handleEditClick = (productId, quantity) => {
        setModalId(productId);
        setModalQuantityChange(quantity);
        setShowModalEdit(true);
    };

    const handleEditProduct = async (addedQuantity) => {
        if (!modalId) {
            console.error("Error: modalId is empty or undefined");
            return;
        }
    
        try {
            const { data, error: fetchError } = await supabase
                .from('product_stock')
                .select('quantity_change')
                .eq('product_id', modalId)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch product stock for product_id ${modalId}: ${fetchError.message}`);
            }
    
            if (!data) {
                console.error(`No stock entry found for product_id ${modalId}. Make sure the product exists in product_stock.`);
                return;
            }
    
            const newQuantityChange = (data.quantity_change || 0) + addedQuantity;
    
            const { error: updateError } = await supabase
                .from('product_stock')
                .update({ quantity_change: newQuantityChange })
                .eq('product_id', modalId);
    
            if (updateError) {
                throw new Error(`Failed to update quantity_change for product_id ${modalId}: ${updateError.message}`);
            }
    
            setShowModalEdit(false);
            getProducts(); 
        } catch (error) {
            console.error('Error updating product stock:', error.message);
        }
    };

    const exportToExcel = () => {
        const worksheetData = products.map(product => ({
            'Name': product.product_name,
            'Stock Quantity': product.product_stock?.reduce((total, stock) => total + stock.quantity_change, 0) || 0,
            'Category': product.product_category?.category_name || 'N/A' 
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, 'Products_List.xlsx');
    };

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
                    </div>

                    <div className="w-full flex justify-center mt-16">
                        <table className="border-collapse table-auto w-11/12 text-sm self-center">
                            <thead>
                                <tr>
                                   
                                    <th className="border-b text-base font-medium p-4 pl-8 text-slate-400 text-left">Kode Barang</th>
                                    <th className="border-b text-base font-medium p-4 pl-8 text-slate-400 text-left">Category</th>
                                    <th className="border-b text-base font-medium p-4 text-slate-400 text-left">Nama Barang</th>
                                    <th className="border-b text-base font-medium p-4 text-slate-400 text-left">Jumlah Stok</th>
                                    <th className="border-b text-base font-medium p-4 text-slate-400 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                       
                                        <td className="border-b p-4 font-bold">{product.product_code}</td>
                                        <td className="border-b p-4 font-bold">{product.product_category?.category_name || 'N/A'}</td>
                                        <td className="border-b p-4 font-bold">{product.product_name}</td>
                                        <td className="border-b p-4 font-bold">
                                            {product.product_stock?.reduce((total, stock) => total + stock.quantity_change, 0) || 0}
                                        </td>
                                        <td className="border-b p-4 font-bold flex gap-4">
                                            <button onClick={() => handleEditClick(product.id, product.product_stock?.reduce((total, stock) => total + stock.quantity_change, 0) || 0)}>
                                                <FaEdit className="text-blue-500" />
                                            </button>
                                            <button onClick={() => deleteProduct(product.id)}>
                                                <FaTrash className="text-red-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center w-11/12 mx-auto mt-4">
                        <button onClick={exportToExcel} className="flex items-center text-white bg-green-500 px-4 py-2 rounded">
                            <FaFileExcel className="mr-2" />
                            Export to Excel
                        </button>
                        <ReactPaginate
                            previousLabel={"< Prev"}
                            nextLabel={"Next >"}
                            breakLabel={"..."}
                            pageCount={totalPage}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={changePage}
                            containerClassName={"flex space-x-2"}
                            pageClassName={"cursor-pointer"}
                            previousClassName={"cursor-pointer"}
                            nextClassName={"cursor-pointer"}
                            activeClassName={"font-bold text-blue-500"}
                        />
                    </div>
                </div>
            </div>

            {showModalAdd && <AddProductModal onClose={() => setShowModalAdd(false)} onAddProduct={handleAddProduct} />}
            {showModalEdit && (
                <EditProductModal 
                    onClose={() => setShowModalEdit(false)} 
                    onEditProduct={handleEditProduct} 
                    initialQuantity={modalQuantityChange} 
                />
            )}
        </Sidebar>
    );
};

export default Dashboard;

