import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { FaEye, FaEyeSlash } from "react-icons/fa";
const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [emailExists, setEmailExists] = useState(false); // Trạng thái kiểm tra email
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Hiển thị popup
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = location.state?.role || "Student"; // Nếu không có thì mặc định là Student
  const [role, setRole] = useState(initialRole);
  const handleViewTerms = () => {
    alert(
      "Terms and Rules: \n1. Do not share login information.\n2. Respect other users.\n3. Comply with system regulations."
    );
  };

  useEffect(() => {
    console.log("🔥 Signup component loaded", location.state);
  }, []);

  const validateForm = () => {
    if (!fullname.trim().includes(" ")) {
      setError("Full name must be at least 2 words.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    const usernameRegex = /^[^\s]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError("Username must be 3-20 characters and must not contain spaces.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email is invalid.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    const phoneRegex = /^0\d{8,10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Phone number must be 9-11 digits and start with 0.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    if (!gender) {
      setError("Please select gender.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate > today) {
      setError("Date of birth cannot be in the future.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    if (address.length < 5) {
      setError("Address must be at least 5 characters.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, contain uppercase, lowercase, numbers and special characters."
      );
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    if (password !== confirmPassword) {
      setError("Confirmation password does not match.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    if (!agreeTerms) {
      setTermsError("You must agree to the terms to continue.");
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
      return false;
    }

    setError("");
    setTermsError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/signup",
        {
          fullname,
          username,
          email,
          phone,
          gender,
          birthday,
          address,
          password,
          role,
        }
      );

      // setSuccessMessage("Sign up successfully. Redirecting to login page...");
      setShowSuccessPopup(true); // Hiển thị popup
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (role === "Tutor") {
          navigate(`/uploadtutorcertificate/${response.data.user_id}`);
        } else {
          navigate("/login");
        }
      }, 3000); // 3 giây
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message); // Hiển thị lỗi từ server
      } else {
        setError("Something went wrong. Please try again."); // Hiển thị lỗi tổng quát
      }
      setTimeout(() => {
        setError(""); // Reset thông báo sau 3 giây
      }, 3000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      {/* Popup thông báo */}
      {showSuccessPopup && (
        <div className="absolute top-10 bg-teal-500 text-white py-4 px-6 rounded-lg shadow-lg animate-fadeIn">
          Sign up successfully. Redirecting to login page...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl"
      >
        <h2 className="text-3xl font-semibold text-center mb-6 text-green-600">
          Welcome new {role}
        </h2>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        {successMessage && (
          <div className="text-green-500 mb-4 text-center">
            {successMessage}
          </div>
        )}
        {emailExists && (
          <div className="text-red-500 mb-4 text-center">
            Email is already exists.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Number Phone
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="birthday"
              className="block text-sm font-medium text-gray-700"
            >
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                placeholder="Nhập mật khẩu"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[50%] transform -translate-y-1/2 text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="mt-2 p-3 w-full border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[50%] transform -translate-y-1/2 text-gray-600 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="agreeTerms"
            className="mr-2"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <label htmlFor="agreeTerms" className="text-sm text-gray-600">
            I agree to the
            <button
              type="button"
              className="text-green-500 hover:underline focus:outline-none ml-1"
              onClick={handleViewTerms}
            >
              terms
            </button>
          </label>
        </div>

        {termsError && (
          <p className="text-red-500 text-sm mt-2">{termsError}</p>
        )}

        <button
          type="submit"
          //  className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-green-500 hover:text-white"
          className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full inline-block focus:outline-none focus:ring-2  hover:bg-green-500 hover:text-white"
        >
          SIGN UP
        </button>
      </form>
    </div>
  );
};

export default Signup;
