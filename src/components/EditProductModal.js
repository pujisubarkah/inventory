import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const EditProductStockModal = ({ onClose, visible, productId }) => {
  // Form field states
  const [quantityChange, setQuantityChange] = useState(0);
  const [product, setProduct] = useState(''); // selected product ID
  const [operation, setOperation] = useState('add'); // 'add' or 'subtract'
  const [products, setProducts] = useState([]); // for storing product options

  // Fetch all products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  // Close modal if background is clicked
  const handleOnClose = (e) => {
    if (e.target.id === 'background') onClose();
  };

  // Fetch product data by product ID
  useEffect(() => {
    if (visible && productId) {
      getProductById(productId);
    }
  }, [visible, productId]);

  const getProductById = async (id) => {
    const { data, error } = await supabase
      .from('product_stock')
      .select('*')
      .eq('product_id', id)
      .single();

    if (error) {
      console.error('Error fetching product stock:', error);
    } else {
      setProduct(data.product_id);
      setQuantityChange(data.quantity_change);
    }
  };

  const updateProductStock = async (e) => {
    e.preventDefault();
    try {
      // Fetch the current quantity_change for the selected product
      const { data: existingData, error: fetchError } = await supabase
        .from('product_stock')
        .select('quantity_change')
        .eq('product_id', product)
        .single();

      if (fetchError) {
        console.error('Error fetching current quantity:', fetchError);
        return;
      }

      // Calculate the new quantity_change based on the operation
      const updatedQuantity =
        operation === 'add'
          ? existingData.quantity_change + quantityChange
          : existingData.quantity_change - quantityChange;

      // Update the quantity_change with the new value
      const { data, error } = await supabase
        .from('product_stock')
        .update({
          quantity_change: updatedQuantity,
        })
        .eq('product_id', product);

      if (error) {
        console.error('Error updating product stock:', error);
      } else {
        console.log('Product stock updated successfully:', data);
        onClose(); // Close the modal after successful update
      }
    } catch (error) {
      console.log('Update failed:', error);
    }
  };

  return (
    <div
      onClick={handleOnClose}
      id="background"
      className="fixed inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
    >
      <div className="w-5/12 bg-white rounded shadow p-4 max-h-[60vh] overflow-y-auto">
        <p className="text-xl font-bold text-sky-700">Edit Product Stock</p>
        <br />
        <form onSubmit={updateProductStock}>
          <div className="field py-3">
            <label className="font-semibold text-slate-600">Change Stock Quantity</label>
            <input
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value))}
              className="block w-full bg-slate-100 py-1 px-3 rounded focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
              required
            />
          </div>

          <div className="flex justify-between py-3">
            <button
              type="button"
              onClick={() => setOperation('subtract')}
              className={`flex-1 py-1 mx-1 rounded text-white ${operation === 'subtract' ? 'bg-red-600' : 'bg-slate-300 hover:bg-slate-200'}`}
            >
              <FontAwesomeIcon icon={faMinus} /> Kurang
            </button>
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`flex-1 py-1 mx-1 rounded text-white ${operation === 'add' ? 'bg-green-600' : 'bg-slate-300 hover:bg-slate-200'}`}
            >
              <FontAwesomeIcon icon={faPlus} /> Tambah
            </button>
          </div>

          <button type="submit" className="py-1 px-3 bg-red-700 rounded text-white shadow hover:bg-red-600">
            Update Stock
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductStockModal;
