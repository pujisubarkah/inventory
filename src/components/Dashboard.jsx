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
        console.log("Selected productId:", productId);  // Debug log
        setModalId(productId); // Set the selected product ID
        setModalQuantityChange(quantity); // Set the initial quantity
        setShowModalEdit(true); // Open the modal
    };

    const handleEditProduct = async (addedQuantity) => {
        if (!modalId) {
            console.error("Error: modalId is empty or undefined");
            return; // Prevent update if modalId is missing
        }
    
        try {
            // Step 1: Fetch the current quantity_change value for the specified product
            const { data, error: fetchError } = await supabase
                .from('product_stock')
                .select('quantity_change')
                .eq('product_id', modalId)
                .single(); // Fetch only one record as each product has a unique entry in product_stock
    
            if (fetchError) {
                throw new Error(`Failed to fetch product stock for product_id ${modalId}: ${fetchError.message}`);

            }
    
            // Check if data was returned; if not, it means product_id is missing in product_stock
            if (!data) {
                console.error(`No stock entry found for product_id ${modalId}. Make sure the product exists in product_stock.`);

                return;
            }
    
            // Step 2: Calculate the new quantity_change by adding the added quantity
            const newQuantityChange = (data.quantity_change || 0) + addedQuantity;
    
            // Step 3: Update the quantity_change in the database
            const { error: updateError } = await supabase
                .from('product_stock')
                .update({ quantity_change: newQuantityChange })
                .eq('product_id', modalId); // Use modalId here to target the correct product
    
            if (updateError) {
                throw new Error(`Failed to update quantity_change for product_id ${modalId}: ${updateError.message}`);

            }
    
            // Close the edit modal and refresh the product list after updating
            setShowModalEdit(false);
            getProducts(); // Refresh product list
        } catch (error) {
            console.error('Error updating product stock:', error.message);
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
                <img src="https://img.freepik.com/premium-vector/mobile-login-flat-design-vector-illustration_1288538-7537.jpg?semt=ais_hybrid" alt="Login required illustration" className="w-1/2 mb-4" style={{ marginBottom: '20px', maxWidth: '20%', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
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
                                    <th className="border-b text-base font-medium p-4 pl-8 text-slate-400 text-left">No</th>
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
                                        <td className="border-b p-4 font-bold">{index + 1}</td>
                                        <td className="border-b p-4 font-bold">{product.product_code}</td>
                                        <td className="border-b p-4 font-bold">{product.product_name}</td>
                                        <td className="border-b p-4 font-bold">
                                            {product.product_stock && product.product_stock.length > 0 ? 
                                                product.product_stock.reduce((total, stock) => total + stock.quantity_change, 0) 
                                                : 0}
                                        </td>
                                        <td className="border-b p-4 font-bold flex">
                                            <button 
                                                onClick={() => handleEditClick(product.id, product.product_stock?.[0]?.quantity_change || 0)} 
                                                className="text-blue-600 hover:text-blue-500"
                                                aria-label="Edit">
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => deleteProduct(product.id)} 
                                                className="text-red-600 hover:text-red-500" 
                                                aria-label="Delete">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-4">
                        <button onClick={exportToExcel} className="py-2 px-4 bg-green-500 text-white rounded shadow">Export to Excel <FaFileExcel /></button>
                    </div>

                    <div className="flex justify-center mt-4">
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            pageCount={totalPage}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={changePage}
                            containerClassName={"pagination"}
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                        />
                    </div>

                    {/* Add Product Modal */}
                    {showModalAdd && (
                        <AddProductModal 
                            onClose={() => setShowModalAdd(false)} 
                            onAddProduct={handleAddProduct} 
                            visible={true}
                        />
                    )}

                    {/* Edit Product Modal */}
                    {showModalEdit && (
                        <EditProductModal 
                            onClose={() => setShowModalEdit(false)} 
                            onEditProduct={handleEditProduct} 
                            productId={modalId}   // Pass modalId as productId
                            quantityChange={modalQuantityChange} 
                            visible={true}
                        />
                    )}
                </div>
            </div>
        </Sidebar>
    );
};

export default Dashboard; 

