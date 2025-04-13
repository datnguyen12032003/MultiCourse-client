import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useTheme } from "./context/ThemeContext";
import { Button } from "antd";
import Cookies from "js-cookie";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const recaptchaRef = useRef(null);

  const [fullname, setFullname] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [balance, setBalance] = useState(0);
  const [walletData, setWalletData] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const isHome = location.pathname === "/";
  const hideNavbarRoutes = ["/login", "/signup", "/uploadtutorcertificate"];

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedNavigate = useCallback(
    debounce((path) => navigate(path), 300),
    [navigate]
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken") || Cookies.get("Token");
    if (token) {
      localStorage.setItem("authToken", token);
      setIsLoggedIn(true);
      fetchUserProfile(token);
      fetchBalance(token);
      fetchWalletData(token);
    } else {
      setIsLoggedIn(false);
      const protectedRoutes = ["/userprofile", "/cart"];
      if (protectedRoutes.includes(location.pathname)) {
        debouncedNavigate("/login");
      }
    }

    const savedAvatar = localStorage.getItem("avatarUrl");
    if (savedAvatar) setAvatarUrl(savedAvatar);

    const savedRole = localStorage.getItem("role");
    if (savedRole) setRole(savedRole);
  }, [location.pathname]);

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(
        "https://multicourse.onrender.com/api/users/get-user-by-token",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = res.data;
      setFullname(user.fullname || "User");
      setRole(user.role);
      localStorage.setItem("role", user.role);

      const avatar = user.avatar
        ? `${user.avatar}?${new Date().getTime()}`
        : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      setAvatarUrl(avatar);
      localStorage.setItem("avatarUrl", avatar);
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
      setError("Phiên của bạn đã hết hạn, vui lòng đăng nhập lại.");
      localStorage.removeItem("authToken");
      debouncedNavigate("/login");
    }
  };

  const fetchBalance = async (token) => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole !== "Admin") {
        const res = await axios.get(
          "https://multicourse.onrender.com/api/wallet/show-balance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBalance(res.data.current_balance || 0);
      }
    } catch (err) {
      console.error("Lỗi lấy balance:", err);
    }
  };

  const fetchWalletData = async (token) => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "Admin") {
        const res = await axios.get(
          "https://multicourse.onrender.com/api/wallet/show-wallet-admin",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWalletData(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy ví admin:", err);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await axios.post(
          "https://multicourse.onrender.com/api/users/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      localStorage.clear();
      Cookies.remove("Token");
      setIsLoggedIn(false);
      setFullname("User");
      setAvatarUrl("");
      setRole(null);
      window.dispatchEvent(new Event("storage"));
      debouncedNavigate("/login");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
      alert("Đăng xuất thất bại!");
    }
  };

  if (hideNavbarRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav
      className={`top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg ${
        isHome
          ? "fixed bg-transparent text-white"
          : "bg-white dark:bg-gray-900 shadow-md"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-teal-500"
          onClick={() => debouncedNavigate("/")}
        >
          MultiCourse
        </h1>

        {isHome && (
          <div className="flex space-x-6">
            <button onClick={() => debouncedNavigate("/")}>Home</button>
            <button onClick={() => debouncedNavigate("/course-list")}>
              Courses
            </button>
            <button onClick={() => debouncedNavigate("/contact")}>
              Contact
            </button>
            <button onClick={() => debouncedNavigate("/about")}>About</button>
          </div>
        )}

        <div className="flex items-center space-x-6">
          <span>{fullname}</span>
          {role === "Admin" ? (
            <span>Admin Balance: {walletData?.current_balance ?? 0} VND</span>
          ) : role === "Student" || role === "Tutor" ? (
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
              Balance: {balance} VND
              {role === "Student" && (
                <Button
                  className="ml-3"
                  onClick={() => debouncedNavigate("/deposit")}
                >
                  Top Up
                </Button>
              )}
            </div>
          ) : null}

          {isLoggedIn && (
            <Button danger onClick={logout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
