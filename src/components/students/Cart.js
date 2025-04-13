import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [cartId, setCartId] = useState(null); // Lưu trữ cartId
  const navigate = useNavigate(); // Khởi tạo navigate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null); // Thêm state mới
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Thêm state mới
  useEffect(() => {
    // Lấy giỏ hàng từ API
    const fetchCartItems = async () => {
      try {
        const response = await fetch(
          "https://multicourse.onrender.com/api/cart",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const data = await response.json();

        console.log("API Response:", data); // Kiểm tra phản hồi từ API

        if (response.ok && data.cart_items && Array.isArray(data.cart_items)) {
          setCartItems(data.cart_items);
          setTotalPrice(data.total_price); // Cập nhật tổng giá trị
          setCartId(data._id); // Lưu cartId từ API response
        } else {
          console.log(
            "Lỗi khi lấy giỏ hàng:",
            data.message || "Không có giỏ hàng"
          );
          setCartItems([]); // Trả về giỏ hàng trống nếu không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setCartItems([]); // Trả về giỏ hàng trống nếu có lỗi
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/cart/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCartItems((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) => item.course._id !== itemId
          );

          const updatedTotalPrice = updatedItems.reduce(
            (total, item) => total + item.course.price,
            0
          );
          setTotalPrice(updatedTotalPrice);

          return updatedItems;
        });
        toast.success("Deleted successfully!"); // Thêm thông báo toast
      } else {
        const errorData = await response.json();
        toast.error("Failed to delete item!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Failed to delete item!");
    }
    setIsDeleteModalOpen(false); // Đóng modal sau khi xóa
  };

  // Thêm hàm mới để xử lý việc mở modal xác nhận xóa
  const openDeleteConfirmation = (itemId) => {
    setDeleteItemId(itemId);
    setIsDeleteModalOpen(true);
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(
        `https://multicourse.onrender.com/api/orders/create-order/${cartId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsModalOpen(true);
      } else {
        const errorData = await response.json();
        console.error(
          "Lỗi khi tạo đơn hàng:",
          errorData.message || "Không rõ lỗi"
        );
        if (errorData.message === "Not enough balance") {
          toast.error("Not enough balance! ");
        } else {
          console.log(errorData.message);
          toast.error("Payment failed!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Payment failed!");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mx-auto px-4 sm:px-6 py-10">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? "course" : "courses"}{" "}
              in cart
            </p>
          </div>
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse">
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-lg font-semibold">
                Welcome to E-Learning
              </span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-10 flex flex-col items-center bg-white rounded-xl shadow-lg p-12">
            <div className="text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                Your cart is empty
              </h2>
              <p className="mt-2 text-gray-600">No courses in your cart yet</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center mx-auto"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <li
                      key={item._id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex space-x-6">
                        <img
                          src={item.course.image}
                          alt={item.course.title}
                          className="w-32 h-24 object-cover rounded-lg shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {item.course.title}
                              </h3>
                              <div className="flex items-center mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                                  <svg
                                    className="w-4 h-4 mr-1.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                  </svg>
                                  {item.course.category}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  openDeleteConfirmation(item.course._id)
                                }
                                className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center space-x-1 mt-2"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                            <p className="text-2xl font-bold text-teal-600">
                              {item.course.price.toLocaleString()} VND
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{totalPrice.toLocaleString()} VND</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-gray-800">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-teal-600">
                        {totalPrice.toLocaleString()} VND
                      </span>
                    </div>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-teal-500 text-white py-4 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>Proceed to Payment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center transform scale-105 w-[400px]">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to remove this course from your cart? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(deleteItemId)}
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo mua hàng thành công */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center transform scale-105">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🎉 Purchase Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully purchased this course. 🎓
            </p>
            <button
              onClick={() => {
                setIsModalOpen(false);
                navigate("/my-courses");
              }}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              🎯 Go to My Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
