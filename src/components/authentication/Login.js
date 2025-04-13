import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaGoogle, FaRedo } from "react-icons/fa";
const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Cho thông báo tài khoản/mật khẩu
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (token && role) {
      navigate(
        role.toLowerCase() === "tutor" ? "/courses-list-tutor" : "/homescreen"
      );
    }
  }, []);

  useEffect(() => {
    if (isSubmitting) {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("role");

      if (token && role) {
        navigate(
          role.toLowerCase() === "tutor" ? "/courses-list-tutor" : "/homescreen"
        );
      }
    }
  }, [isSubmitting, navigate]);

  useEffect(() => {
    drawCaptcha(captcha);
  }, [captcha]);

  const drawCaptcha = (captcha) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = 150;
    canvas.height = 50;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nền có nhiễu
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }

    ctx.font = "bold 30px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = 0; i < captcha.length; i++) {
      const x = 25 + i * 25;
      const y = 25 + Math.random() * 10 - 5;
      ctx.save();
      ctx.translate(x, y);

      // Tạo hiệu ứng méo chữ
      const scaleX = 1 + Math.random() * 0.4 - 0.2;
      const scaleY = 1 + Math.random() * 0.3 - 0.15;
      ctx.transform(
        scaleX,
        Math.random() * 0.3 - 0.15,
        Math.random() * 0.3 - 0.15,
        scaleY,
        0,
        0
      );

      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${
        Math.random() * 100
      })`;
      ctx.fillText(captcha[i], 0, 0);
      ctx.restore();
    }

    // Thêm các đường gạch ngang gây nhiễu
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Ngăn spam nút đăng nhập

    if (!username || username.length < 4) {
      setError("Username must be at least 4 characters.");
      return;
    }

    if (!password || password.length < 3) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (userCaptcha !== captcha) {
      setError("CAPTCHA không chính xác!");
      setCaptcha(generateCaptcha()); // Tạo CAPTCHA mới nếu sai
      setUserCaptcha(""); // Xóa input CAPTCHA
      return;
    }

    setError(""); // Xóa lỗi nếu CAPTCHA đúng
    console.log("Đăng nhập thành công!", { username, password });

    setError(""); // Xóa lỗi nếu CAPTCHA đúng
    setError("");
    setIsLoading(true);
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "https://multicourse.onrender.com/api/users/login",
        { username, password }
      );

      if (response.status === 200) {
        const { user_id, token, role, fullname, status, tutor_certificates } =
          response.data;
        console.log("Role:", role);
        if (!status) {
          setError("Account has been BANNED");
          setIsSubmitting(false);
          setIsLoading(false);
          return;
        }
        localStorage.setItem("role", role);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", user_id);
        localStorage.setItem("role", role);
        setRole(role); // Cập nhật role ngay để sidebar re-render

        setSuccessMessage("Login successfully!");
        setTimeout(() => {
          if (
            role.toLowerCase() === "tutor" &&
            (!tutor_certificates || tutor_certificates.length === 0)
          ) {
            navigate(`/uploadtutorcertificate/${user_id}`, { replace: true });
          } else if (role.toLowerCase() === "admin") {
            navigate("/statistic-for-admin");
          } else if (role.toLowerCase() === "student") {
            navigate("/course-list");
          } else {
            navigate("/courses-list-tutor");
          }
        }, 500);
      }
    } catch (err) {
      setError("Incorrect account or password.");
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpForStudent = () => {
    navigate("/signup", { state: { role: "Student" } });
  };

  const handleSignUpForTutor = () => {
    navigate("/signup", { state: { role: "Tutor" } });
  };
  const handleGoogleLogin = () => {
    window.open(
      "https://multicourse.onrender.com/api/users/google/login",
      "_self"
    );

    const checkToken = setInterval(() => {
      const token = getCookie("Token");
      if (token) {
        clearInterval(checkToken);
        localStorage.setItem("authToken", token);

        // Thêm đoạn code lấy role từ API
        fetch("https://multicourse.onrender.com/api/users/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            localStorage.setItem("role", data.role);
            // Tạo một event để thông báo role đã thay đổi
            window.dispatchEvent(new Event("roleChanged"));
            window.location.href = "/course-list";
          });
      }
    }, 500);
  };

  // Hàm để lấy cookie theo tên
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
          <div className="w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-green-500">Welcome to</span> MultiCourse
            </div>
            <div className="py-10">
              <h2 className="text-3xl font-bold text-green-500 mb-2">LOGIN</h2>
              <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
              <div className="flex justify-center my-2">
                {/* 
                login with gg */}
                <div className="flex justify-center mt-4 mb-4">
                  <button
                    className="flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    onClick={handleGoogleLogin}
                  >
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb3JJON85iCMGiuY2-fwef-kegI10la8ClXg&s"
                      alt="Google Logo"
                      className="w-5 h-5 mr-2"
                    />
                    Sign in with Google
                  </button>
                </div>

                {/* 
                login with gg */}
              </div>
              <p className="text-gray-400 my-3">or use your UserName account</p>
              <div className="flex flex-col items-center">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type="text"
                      id="username"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your Username"
                      required
                    />
                  </div>

                  <div className="mb-2 relative">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <button
                      type="button"
                      onClick={() => navigate("/forgetpassword")}
                      className="text-green-500 hover:underline focus:outline-none"
                    >
                      Forgot Password
                    </button>
                  </div>
                  <div className="flex justify-center items-center gap-2 mb-[5px]">
                    <canvas
                      ref={canvasRef}
                      className="w-[100px] h-[40px] border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Nhập CAPTCHA"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      required
                      className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 shadow-sm transition ${
                        error
                          ? "border-red-500 focus:ring-red-500 animate-shake"
                          : "border-green-500 focus:ring-green-500"
                      }`}
                    />
                    <span
                      onClick={() => setCaptcha(generateCaptcha())}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-green-500 transition"
                    >
                      <FaRedo />
                    </span>
                  </div>

                  {/* Hiển thị lỗi */}
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  {/* Hiển thị thông báo thành công */}
                  {successMessage && (
                    <p className="text-green-500 text-sm mt-2">
                      {successMessage}
                    </p>
                  )}

                  {/* Nút Login với khoảng cách hợp lý */}
                  <button
                    type="submit"
                    className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-green-500 hover:text-white mt-4"
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">HELLO</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-10">
              Fill up personal information and start journey with us.
            </p>
            <button
              type="button"
              onClick={handleSignUpForStudent}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500 mb-4"
            >
              SIGN UP FOR STUDENT
            </button>
            <button
              type="button"
              onClick={handleSignUpForTutor}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500"
            >
              SIGN UP FOR TUTOR
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
