import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import './Reviews.css';

function Reviews({ isAdmin }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  console.log(`Admin:`, isAdmin)
  const handleChange = (event, setter) => {
    const { value } = event.target;
    setter(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const reviewsCollection = collection(firestore, 'Reviews');
      await addDoc(reviewsCollection, {
        rating: parseFloat(rating), // Convert rating to float
        comment: comment,
        date: currentDate
      });

      setRating('');
      setComment('');

      alert('Review added successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review. Please try again later.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(firestore, 'Reviews', reviewId));
      setReviews(reviews.filter(review => review.id !== reviewId));
      alert('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsCollection = collection(firestore, 'Reviews');
        const snapshot = await getDocs(reviewsCollection);
        const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);
  

  const ReviewContainer = ({ id, rating, comment, date, isAdmin }) => (
  <div className="review-post">
    {console.log(`Review: isAdmin - ${isAdmin}`)}
      <h3>Rating: {rating}</h3>
      {comment && <p>{comment}</p>}
      <em>{date}</em>
      {<button onClick={() => handleDeleteReview(id)}>Delete</button>}

    </div>
  );

  return (
    <div className="reviews-page">
      <h2 className="reviews-title">Add Review</h2>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="rating">Rating (1-5):</label>
          <input
            type="number"
            id="rating"
            value={rating}
            min="1"
            max="5"
            step="0.5"
            onChange={e => handleChange(e, setRating)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Comment (Optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={e => handleChange(e, setComment)}
          />
        </div>
        <div className="form-group">
          <button type="submit">Add Review</button>
        </div>
      </form>
      
      <div className="reviews-container">
        {/* Display reviews */}
        {reviews.map((review) => (
          <ReviewContainer
          key={review.id}
          id={review.id}
          rating={review.rating}
          comment={review.comment}
          date={review.date}
          isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

export default Reviews;
