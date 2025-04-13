import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileAlt,
  FaStar,
  FaBook,
  FaComments,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaVideo,
  FaFilePdf,
  FaMoneyBillWave,
  FaLayerGroup,
} from "react-icons/fa";

const PurchasedCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "https://multicourse.onrender.com/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        console.log("User profile data:", data);
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(
          `https://multicourse.onrender.com/api/courses/detail/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course detail");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/create-course-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit comment");
      }

      const updatedResponse = await fetch(
        `https://multicourse.onrender.com/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setComment("");
        setRating(5);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditComment(comment.comment);
    setEditRating(comment.rating);
    setShowEditModal(true);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/update-course-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            commentId: editingComment._id,
            rating: editRating,
            comment: editComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update comment");
      }

      const updatedResponse = await fetch(
        `https://multicourse.onrender.com/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setShowEditModal(false);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        "https://multicourse.onrender.com/api/comments/delete-course-comment",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            commentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment");
      }

      // Refresh course data
      const updatedResponse = await fetch(
        `https://multicourse.onrender.com/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
      }
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  const { courseDetail, lessons } = course;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Courses
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="md:w-1/2">
                <img
                  src={courseDetail.image}
                  alt={courseDetail.title}
                  className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="md:w-1/2">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {courseDetail.title}
                </h1>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {courseDetail.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl">
                    <FaBook className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-indigo-600">Lessons</p>
                      <p className="font-semibold">
                        {course?.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-purple-100 text-purple-700 px-4 py-3 rounded-xl">
                    <FaMoneyBillWave className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-purple-600">Price</p>
                      <p className="font-semibold">
                        {course?.courseDetail?.price.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-green-100 text-green-700 px-4 py-3 rounded-xl">
                    <FaLayerGroup className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-green-600">Category</p>
                      <p className="font-semibold">
                        {course?.courseDetail?.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-3 rounded-xl">
                    <FaCalendarAlt className="mr-3 text-xl" />
                    <div>
                      <p className="text-sm text-blue-600">Created At</p>
                      <p className="font-semibold">
                        {new Date(courseDetail.createAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 text-2xl mr-2" />
                    <div>
                      <p className="text-sm text-yellow-600">Average Rating</p>
                      <p className="font-semibold text-yellow-700">
                        {courseDetail.average_rating.toFixed(1)}/5.0
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaComments className="text-indigo-500 text-xl mr-2" />
                    <div>
                      <p className="text-sm text-indigo-600">Total Reviews</p>
                      <p className="font-semibold text-indigo-700">
                        {courseDetail.comments.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  Course Lessons
                </h2>
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold">
                  {lessons.length} Lessons
                </span>
              </div>

              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {lesson.number}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {lesson.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4">
                          {lesson.document_url && (
                            <a
                              href={lesson.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                            >
                              <FaFilePdf className="mr-2" />
                              View Materials
                            </a>
                          )}
                        </div>

                        {lesson.comments && lesson.comments.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-4">
                              Lesson Feedback ({lesson.comments.length})
                            </h4>
                            <div className="space-y-4">
                              {lesson.comments.map((comment) => (
                                <div
                                  key={comment._id}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                        <FaUser className="text-indigo-600 text-sm" />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-800 text-sm">
                                          {comment.author}
                                        </span>
                                        <div className="flex items-center text-yellow-500 mt-1">
                                          <FaStar className="mr-1 text-sm" />
                                          <span className="text-xs">
                                            {comment.rating}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        comment.date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">
                                    {comment.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {courseDetail.comments && courseDetail.comments.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center mb-8">
                  <FaComments className="text-indigo-600 mr-3 text-2xl" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Course Reviews
                  </h2>
                  <span className="ml-4 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {courseDetail.comments.length} reviews
                  </span>
                </div>
                <div className="space-y-6">
                  {courseDetail.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-full mr-3">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">
                              {comment.author}
                            </span>
                            <div className="flex items-center text-yellow-500 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`mr-1 ${
                                    i < comment.rating
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                          {comment.author === userProfile?.fullname && (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-2 rounded-full hover:bg-indigo-50"
                                title="Edit comment"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                                title="Delete comment"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Edit Review
                  </h2>
                  <form onSubmit={handleUpdateComment} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-3xl transition-transform duration-200 hover:scale-110 ${
                              star <= editRating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            <FaStar />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Comment
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        rows="4"
                        required
                      />
                    </div>
                    {submitError && (
                      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        {submitError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
                      >
                        {submitting ? "Updating..." : "Update Review"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div className="bg-white p-8 rounded-xl shadow-sm mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Add Your Review
              </h2>
              <form onSubmit={handleSubmitComment} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-transform duration-200 hover:scale-110 ${
                          star <= rating ? "text-yellow-500" : "text-gray-300"
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    rows="4"
                    placeholder="Share your thoughts about this course..."
                    required
                  />
                </div>
                {submitError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 font-medium"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedCourseDetail;
