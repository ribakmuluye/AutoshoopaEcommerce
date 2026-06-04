import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addReview } from '../../store/slices/reviewSlice';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write a review (minimum 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(addReview({
        productId,
        reviewData: {
          rating,
          comment: comment.trim(),
          user_id: user.uid,
          user_name: user.name,
          user_image: user.profile_image
        }
      })).unwrap();

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
            Rating
          </label>
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  <FaStar
                    className="w-8 h-8 cursor-pointer"
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Comment */}
        <div className="mb-4">
          <label 
            htmlFor="comment" 
            className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            className="w-full px-3 py-2 border border-light-borderHover dark:border-dark-borderHover rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your review here (minimum 10 characters)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 