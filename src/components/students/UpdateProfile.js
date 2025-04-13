import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    address: "",
    birthday: "",
  });
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "https://multicourse.onrender.com/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { fullname, phone, gender, address, birthday } = response.data;
        const formattedBirthday = birthday ? birthday.split("T")[0] : "";
        setFormData({
          fullname: fullname || "",
          phone: phone || "",
          gender: gender || "",
          address: address || "",
          birthday: formattedBirthday,
        });
      } catch (error) {
        setErrorMessage("Unable to retrieve user information.");
      }
    };

    fetchUserData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Nếu người dùng nhập ngày sinh, kiểm tra xem nó có phải là ngày trong tương lai không
    if (name === "birthday") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt giờ về 0 để so sánh chính xác

      if (selectedDate > today) {
        toast.error("Ngày sinh không thể ở trong tương lai!");
        return;
      }
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      return;
    }
    const selectedDate = new Date(formData.birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 0 để so sánh chính xác

    if (selectedDate > today) {
      toast.error("Ngày sinh không thể ở trong tương lai!");
      return; // Dừng lại, không gửi request
    }
    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("User profile updated successfully!");
      setErrorMessage("");

      // Hiển thị thông báo trong 2 giây trước khi điều hướng
      setTimeout(() => {
        navigate("/userprofile"); // Redirect to UserProfile page after successful update
      }, 3000);
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data.message ||
            "Failed to update profile. Please try again."
        );
      } else {
        setErrorMessage(
          "Network error occurred. Please check your connection."
        );
      }

      setSuccessMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 via-blue-200 to-purple-200">
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-4xl font-bold text-center text-green-600 mb-8">
          Update Profile
        </h2>
        <ToastContainer />

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6 border border-green-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6 border border-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                readOnly={!isEditingBirthday}
                onClick={() => setIsEditingBirthday(true)}
                onChange={handleInputChange}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="submit"
              className="border-2 border-green-500 text-green-500 rounded-full px-12 py-3 inline-block font-semibold hover:bg-green-500 hover:text-white transition duration-200"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
