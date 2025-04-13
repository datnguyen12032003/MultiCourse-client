import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Quản lý các bước
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpExpired, setOtpExpired] = useState(false); // Trạng thái kiểm soát OTP hết hạn
  const [timer, setTimer] = useState(60); // Thời gian đếm ngược OTP
  const [resendDisabled, setResendDisabled] = useState(false);

  const navigate = useNavigate(); // Khởi tạo useNavigate

  // Bắt đầu đếm ngược OTP khi chuyển sang bước 2
  useEffect(() => {
    if (step === 2) {
      setOtpExpired(false);
      setTimer(200);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setOtpExpired(true);
            setStep(1); // Quay về bước nhập email
            setError("OTP has expired. Please re-enter your email.");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [step]);

  const handleSendEmail = async () => {
    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/forgot-password",
        { email }
      );

      if (response.status === 200) {
        setStep(2); // Chuyển sang bước nhập OTP
        setSuccessMessage("OTP has been sent to your email.");
        setError("");
      }
    } catch (err) {
      setError("Unable to send OTP. Please check your email.");
      setSuccessMessage("");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New password does not match.");
      return;
    }

    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/reset-password",
        { otp, newPassword }
      );

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setError("");
        setStep(3);
      }
    } catch (err) {
      if (err.response && err.response.data.message === "OTP expired") {
        setError("OTP has expired. Please re-enter your email.");
        setStep(1); // Quay về bước nhập email
      } else {
        setError("OTP không hợp lệ hoặc đã hết hạn.");
      }
      setSuccessMessage("");
    }
  };

  const handleResendOTP = async () => {
    setOtpExpired(false);
    setTimer(20);

    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/resend-otp",
        { email }
      );

      if (response.status === 200) {
        setSuccessMessage("A new OTP has been sent.");
        setError("");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      setSuccessMessage("");
    }
  };

  const handleGoToLogin = () => {
    navigate("/login"); // Điều hướng sang trang đăng nhập
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-100 to-green-200">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
          {step === 1 && "Forgot Password"}
          {step === 2 && "OTP Confirmation"}
          {step === 3 && "Success!"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 py-3 px-5 mb-6 rounded border border-red-300">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 py-3 px-5 mb-6 rounded border border-green-300">
            {successMessage}
          </div>
        )}

        {step === 1 && (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
            />
            <button
              onClick={handleSendEmail}
              className="mt-6 w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition duration-200"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter OTP ({timer}s)
            </label>
            <input
              type="text"
              id="otp"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your OTP"
              required
            />

            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />

            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />

            <button
              onClick={handleResetPassword}
              className="mt-6 w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition duration-200"
              disabled={otpExpired}
            >
              Change Password
            </button>

            {otpExpired && (
              <button
                onClick={handleResendOTP}
                className="mt-4 w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 transition duration-200"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
            <p className="text-lg text-gray-700 mb-6">
              Your password has been changed successfully!
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition duration-200"
            >
              Back to Login page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
