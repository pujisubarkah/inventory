import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const SatisfactionModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [testimonial, setTestimonial] = useState('');

  const handleStarClick = (rate) => {
    setRating(rate);
  };

  const handleStarMouseOver = (rate) => {
    setHoverRating(rate);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = () => {
    // Handle the rating and testimonial submission logic here
    alert(`You rated: ${rating} stars\nTestimonial: ${testimonial}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Ceritakan Pengalamanmu</h2>
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              size="2x"
              className={`cursor-pointer ${
                (hoverRating || rating) >= star ? 'text-yellow-500' : 'text-gray-300'
              }`}
              onClick={() => handleStarClick(star)}
              onMouseOver={() => handleStarMouseOver(star)}
              onMouseLeave={handleStarMouseLeave}
            />
          ))}
        </div>
        <textarea
          className="w-full p-2 border rounded-md mb-4"
          rows="4"
          placeholder="Tell us more about your experience (optional)"
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating}
            className={`px-4 py-2 rounded-md ${rating ? 'bg-blue-600 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionModal;
 
