import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState(""); // Đường dẫn avatar
  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const recaptchaRef = useRef(null);

  // Fetch user data
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      navigate("/login"); // Redirect to login page
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "https://multicourse.onrender.com/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Avatar từ API:", response.data.avatar);
      setUserData(response.data); // Save user data
      localStorage.setItem("avatar", response.data.avatar);
    } catch (err) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("authToken"); // Remove token
      navigate("/login"); // Redirect to login page
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle case when user tries to go back to login page after logging in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && window.location.pathname === "/login") {
      navigate("/userprofile"); // Redirect to UserProfile if already logged in
    }
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("authToken");

    try {
      setLoading(true);
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.avatar) {
        setUserData({ ...userData, avatar: response.data.avatar });

        // Reload lại trang sau khi cập nhật avatar thành công
        window.location.reload();
      } else {
        setError("Failed to upload the avatar.");
      }
    } catch (err) {
      setError("Unable to update avatar.");
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      setLoading(true);
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        alert("Password has been changed successfully.");
        setShowChangePasswordModal(false);
      } else {
        setError(
          response.data.message ||
            "Unable to change password. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred while changing the password.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure; SameSite=None;`;
  };
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      setUserData(null);
      setFullname("User");
      setAvatarUrl("");
      setIsLoggedIn(false);
    }
  }, []);
  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("role");

      console.log("Trước khi xóa:");
      console.log("Token:", token);
      console.log("Role:", role);

      if (token) {
        await axios.post(
          "https://multicourse.onrender.com/api/users/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Xóa token và thông tin trong localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("fullname");
      localStorage.removeItem("role");
      localStorage.removeItem("avatar");
      localStorage.removeItem("userId");

      // Xóa cookie Token
      deleteCookie("Token");
      // Cập nhật state để re-render component
      setIsLoggedIn(false);
      setUserData(null);
      setFullname("User");
      setAvatarUrl("");
      // Chuyển về trang login
      navigate("/login");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg transition-all hover:shadow-2xl">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center relative">
        <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-transparent bg-clip-text">
          User Information
        </span>
        <div className="w-16 h-1 bg-teal-500 mx-auto mt-2 rounded-full"></div>
      </h2>

      {userData ? (
        <div className="flex flex-col items-center mb-6 space-y-4">
          <label htmlFor="avatar-upload" className="cursor-pointer relative">
            {/* Hiển thị spinner khi loading */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-full">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Avatar */}
            <img
              src={userData.avatar || "/default-avatar.png"}
              alt="Avatar"
              className={`w-24 h-24 rounded-full object-cover shadow-lg transition-transform transform hover:scale-105 ${
                loading ? "opacity-50" : ""
              }`}
            />
          </label>

          {/* Input file ẩn */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Thông tin người dùng */}
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-gray-800">
              {userData.fullname || "User's Name"}
            </p>
            <p className="text-lg text-gray-500">
              {userData.birthday
                ? new Date(userData.birthday).toLocaleDateString()
                : "DD/MM/YYYY"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No user information available.</p>
      )}

      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
          {/* Cột 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">📧 Email:</span>
              <span className="text-gray-600">{userData.email}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">📞 Phone:</span>
              <span className="text-gray-600">
                {userData.phone || "Not updated"}
              </span>
            </div>

            <div className="ml-1 flex items-center space-x-2">
              <span className="text-2xl">⚥</span>{" "}
              <span className="font-semibold text-gray-700">Gender:</span>
              <span className="text-gray-600">
                {userData.gender || "Not specified"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">🔰 Role:</span>
              <span className="text-gray-600">{userData.role || "N/A"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">⚡ Status:</span>
              <span
                className={`${
                  userData.status ? "text-green-600" : "text-red-600"
                } font-semibold`}
              >
                {userData.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                📍 Address:
              </span>
              <span className="text-gray-600 break-words">
                {userData.address || "Not updated"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
          onClick={() => navigate(`/updateprofile/${userData._id}`)} // Truyền ID vào URL
        >
          Edit Profile
        </button>

        <button
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
          onClick={() => setShowChangePasswordModal(true)} // Show pop-up when clicked
        >
          Change Password
        </button>
        <button
          className="ml-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
          onClick={logout} // Add logout functionality
        >
          Logout
        </button>
        {userData?.role === "Tutor" && (
          <button
            className="ml-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none"
            onClick={() => navigate("/certificate")}
          >
            Certificate
          </button>
        )}
      </div>

      {/* Change password pop-up */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter old password"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter new password"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirm new password"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded"
                onClick={handleChangePassword}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
