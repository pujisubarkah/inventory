import React, { useState } from 'react';
import OrderFormModal from './OrderFormModal';

const ProductCard = ({ item }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOrderClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="product-card">
      <img src={item.image_url} alt={item.name} />
      <h3>{item.name}</h3>
      <p>Stok: {item.stock}</p>
      <button onClick={handleOrderClick} style={{ backgroundColor: '#8B0000', color: 'white' }}>Pesan</button>

      {isModalOpen && (
        <OrderFormModal item={item} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ProductCard;
