import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "rc-slider/assets/index.css";
import "react-toastify/dist/ReactToastify.css";
const DetailCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(""); // Thêm phần tên người dùng
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Xác định người dùng đã đăng nhập hay chưa
  const [cartCount, setCartCount] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [hasCommented, setHasCommented] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Kiểm tra đăng nhập và lấy thông tin fullname
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      const savedFullname = localStorage.getItem("fullname");
      setFullname(savedFullname || "Người dùng");
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Lấy thông tin chi tiết khóa học
  useEffect(() => {
    const fetchCourseDetail = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `https://multicourse.onrender.com/api/courses/detail/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCourse(data.courseDetail);

          if (
            data.courseDetail.comments.some(
              (comment) => comment.author === fullname
            )
          ) {
            setHasCommented(true);
          }
        } else {
          console.error("Error fetching course detail:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id, fullname]);

  const handleAddToCart = async (courseId) => {
    const newCartCount = cartCount + 1;
    setCartCount(newCartCount);
    localStorage.setItem("cartCount", newCartCount);

    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/cart/add-to-cart/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Add product to cart successfully!", {
          position: "top-right",
          autoClose: 3000, // Đóng sau 3 giây
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.error(`Lỗi: ${data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.warn("Comments cannot be left blank!");
      return;
    }

    const commentData = {
      courseId: id,
      rating: newRating,
      comment: newComment,
    };

    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/comments/create-course-comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(commentData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourse((prevCourse) => ({
          ...prevCourse,
          comments: [
            ...prevCourse.comments,
            {
              author: fullname,
              rating: newRating,
              comment: newComment,
              date: new Date(),
            },
          ],
        }));

        setNewComment("");
        setNewRating(5);
        setHasCommented(true);
        toast.success("Comment has been added!");
      } else {
        toast.error(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while submitting the comment.!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer />
      <div className="container mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-teal-600 text-xl font-semibold">
            Loading data...
          </p>
        ) : course ? (
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden md:grid md:grid-cols-2 md:gap-8 p-8 transition-transform duration-300 hover:shadow-lg hover:scale-105">
            <div className="relative group">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-80 object-cover rounded-xl shadow-md transition duration-500 group-hover:scale-105 group-hover:shadow-lg"
              />
              <div className="absolute top-2 left-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs uppercase font-semibold shadow-md">
                {course.category}
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <h2 className="text-4xl font-extrabold text-teal-700">
                {course.title}
              </h2>
              <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                {course.description}
              </p>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-3xl text-teal-800 font-semibold">
                  {course.price} VNĐ
                </p>
                <p className="text-sm text-gray-500 italic">
                  Created on: {new Date(course.createAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(course._id);
                }}
                className="mt-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-600 text-xl font-medium">
            No course information found.
          </p>
        )}

        <div className="mt-10 bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-3xl font-bold text-teal-700">Comments</h3>

          {isAuthenticated && !hasCommented && (
            <div className="mt-6 p-5 bg-gray-100 rounded-lg shadow-lg transition-all hover:shadow-2xl">
              <h4 className="text-lg font-semibold text-teal-700">
                Write your comment
              </h4>
              <textarea
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
                placeholder="Nhập bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>

              <div className="mt-4 flex items-center space-x-2">
                <span className="text-gray-700 font-medium">Evaluate:</span>
                {[...Array(5)].map((_, i) => (
                  <button key={i} onClick={() => setNewRating(i + 1)}>
                    <span
                      className={`text-2xl ${
                        i < newRating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCommentSubmit}
                className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
              >
                Submit a comment
              </button>
            </div>
          )}

          {hasCommented && (
            <p className="text-gray-600 mt-4 italic">
              You have commented on this course.
            </p>
          )}

          {course?.comments?.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {course.comments.map((comment, index) => (
                <li
                  key={index}
                  className="flex space-x-4 p-4 bg-gray-50 rounded-lg shadow-md hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-teal-500 text-white font-bold rounded-full flex items-center justify-center text-xl">
                    {comment.author?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-teal-700">
                      {comment.author || "Người dùng ẩn danh"}
                    </p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${
                            i < comment.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 mt-2">{comment.comment}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(comment.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailCourse;
