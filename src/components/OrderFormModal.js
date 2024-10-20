import React from 'react';

const OrderFormModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null; // Ensure product is defined and modal is open before rendering

    const handleFormSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here

        // After form submission, close the modal
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Pesan Barang</h2>
                <p className="mb-2">Barang: {product.product_name}</p> {/* Access product safely */}
                <form onSubmit={handleFormSubmit}>
                    <label className="block mb-2">
                        Jumlah:
                        <input
                            type="number"
                            min="1"
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            required
                        />
                    </label>
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose} // Call onClose when user clicks 'Cancel'
                            className="mr-2 px-4 py-2 bg-gray-300 rounded"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[darkred] text-white rounded"
                        >
                            Pesan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderFormModal;
