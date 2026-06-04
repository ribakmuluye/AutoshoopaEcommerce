import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviews } from '../../store/slices/reviewSlice';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchProductReviews(productId));
  }, [dispatch, productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading reviews: {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-light-textMuted dark:text-dark-textMuted text-center py-4">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {review.user_image ? (
                <img
                  src={review.user_image}
                  alt={review.user_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-light-textMuted dark:text-dark-textMuted" />
              )}
              <div>
                <h4 className="font-medium text-light-text dark:text-dark-text">{review.user_name}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`w-4 h-4 ${
                        index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-sm text-light-textMuted dark:text-dark-textMuted">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="mt-3 text-light-textSecondary dark:text-dark-textSecondary">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList; 