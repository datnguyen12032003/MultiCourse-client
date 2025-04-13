import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import axios from "axios";
import { useTheme } from "./context/ThemeContext";
import { Space, Switch, Input, Button, Dropdown, Menu } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  CartOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import ReCAPTCHA from "react-google-recaptcha";
const Navbar = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState(""); // Đường dẫn avatar
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const recaptchaRef = useRef(null);
  const isHome = location.pathname === "/";
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [errorWallet, setErrorWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "https://multicourse.onrender.com/api/wallet/show-wallet-admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWalletData(response.data);
      } catch (err) {
        setErrorWallet("Có lỗi xảy ra khi tải thông tin ví");
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletData();
  }, []);
  // const [reloadNavbar, setReloadNavbar] = useState(true);

  // const reload = () => {
  //   setReloadNavbar(false);
  //   setTimeout(() => {
  //     setReloadNavbar(true);
  //   }, 2000);
  // };
  // Hàm debounce để trì hoãn việc gọi hàm navigate để tránh người dùng nhấn quá nhanh và liên tục
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this; // Lưu lại this và các tham số truyền vào
      clearTimeout(debounceTimer); // Xóa timer cũ
      debounceTimer = setTimeout(() => func.apply(context, args), delay); // Tạo timer mới
    };
  };

  const debouncedNavigate = useCallback(
    debounce((path) => navigate(path), 300),
    [navigate]
  );

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        "https://multicourse.onrender.com/api/users/get-user-by-token",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data);
      localStorage.setItem("role", response.data.role);
      setRole(response.data.role); // Cập nhật state role ngay lập tức

      // Xử lý URL avatar từ Google
      if (response.data.avatar) {
        const googleAvatarUrl = `${
          response.data.avatar
        }?${new Date().getTime()}`;
        setAvatarUrl(googleAvatarUrl);
        localStorage.setItem("avatarUrl", googleAvatarUrl);
      } else {
        const defaultAvatar =
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        setAvatarUrl(defaultAvatar);
        localStorage.setItem("avatarUrl", defaultAvatar);
      }

      setFullname(response.data.fullname || "User");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("authToken");
      debouncedNavigate("/login");
    }
  };

  // Thêm useEffect để theo dõi sự thay đổi của role
  // useEffect(() => {
  //   if (role) {
  //     setReloadNavbar(true); // Cập nhật lại navbar khi role thay đổi
  //   }
  // }, [role]);
  useEffect(() => {
    const savedAvatar = localStorage.getItem("avatarUrl");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const role = localStorage.getItem("role");
      if (role === "Admin") {
        return;
      }
      const response = await axios.get(
        "https://multicourse.onrender.com/api/wallet/show-balance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Phản hồi từ API:", response.data);
      setBalance(response.data.current_balance);
    } catch (error) {
      console.error("Lỗi khi lấy balance:", error);
    }
  };

  useEffect(() => {
    let token = localStorage.getItem("authToken");
    if (!token) {
      token = Cookies.get("Token");
      if (token) {
        localStorage.setItem("authToken", token);
        setIsLoggedIn(true);
        fetchUserProfile();
        fetchBalance();
      } else {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(true);
      fetchUserProfile();
      fetchBalance();
    }

    const protectedRoutes = ["/userprofile", "/cart"];
    if (protectedRoutes.includes(location.pathname) && !token) {
      debouncedNavigate("/login");
    }
  }, [debouncedNavigate, location.pathname]);

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure; SameSite=None;`;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken");

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

      // **Kích hoạt sự kiện storage để Sidebar cập nhật ngay lập tức**
      window.dispatchEvent(new Event("storage"));

      // Cập nhật state để re-render component
      setIsLoggedIn(false);
      setUserData(null);
      setFullname("User");
      setAvatarUrl("");
      setRole("Student"); // Nếu bạn có state role, cập nhật lại

      // Chuyển về trang login
      debouncedNavigate("/login");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!");
    }
  };

  // Danh sách các trang không muốn hiển thị Navbar
  const hideNavbarRoutes = ["/login", "/signup", "/uploadtutorcertificate"];

  // Kiểm tra nếu đường dẫn bắt đầu bằng một trong các route trong danh sách
  if (hideNavbarRoutes.some((route) => location.pathname.startsWith(route))) {
    return null; // Không render Navbar
  }

  return (
    <nav
      className={`top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg ${
        isHome
          ? "fixed bg-transparent text-white"
          : "bg-white dark:bg-gray-900 shadow-md"
      }`}
    >
      <div className="container mx-auto md:px-8 px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-teal-500 transition-all duration-300"
          onClick={() => debouncedNavigate("/")}
        >
          MultiCourse
        </h1>

        {/* Navigation Links */}
        {isHome && (
          <div className="flex space-x-6">
            <button
              className="hover:text-teal-500 transition-all duration-300"
              onClick={() => debouncedNavigate("/")}
            >
              Home Page
            </button>
            <button
              className="hover:text-teal-500 transition-all duration-300"
              onClick={() => debouncedNavigate("/course-list")}
            >
              Course List
            </button>
            <button
              className="hover:text-teal-500 transition-all duration-300"
              onClick={() => debouncedNavigate("/contact")}
            >
              Contact
            </button>
            <button
              className="hover:text-teal-500 transition-all duration-300"
              onClick={() => debouncedNavigate("/about")}
            >
              About
            </button>
          </div>
        )}

        {/* User Profile + Balance */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-6 font-bold">
            {fullname}
          </div>
          {role === "Tutor" || role === "Student" ? (
            <div className="flex items-center text-gray-700 dark:text-white px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="mr-2">Balance:</span>
              <span className="font-semibold">{balance ?? "0"} VND</span>
              {role === "Student" && (
                <Button
                  type="primary"
                  className="ml-3 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => debouncedNavigate("/deposit")}
                >
                  Top Up
                </Button>
              )}
            </div>
          ) : role === "Admin" ? (
            <div className="flex items-center text-gray-700 dark:text-white px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="mr-2">Balance:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {walletData?.current_balance ?? "0"} VND
              </span>
            </div>
          ) : null}

          {/* Avatar + Dropdown */}
          {isLoggedIn ? (
            <div className="relative dropdown-container">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md cursor-pointer"
                onClick={() => setShowDropdown((prev) => !prev)}
                onError={(e) => {
                  console.log("Image failed to load, trying alternative URL");
                  e.target.onerror = null;
                  // Thử URL thay thế nếu URL gốc không hoạt động
                  const alternativeUrl = avatarUrl.replace("=s96-c", "");
                  e.target.src = alternativeUrl;
                  // Nếu vẫn không hoạt động, sử dụng avatar mặc định
                  e.target.onerror = () => {
                    e.target.src =
                      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                  };
                }}
                referrerPolicy="no-referrer" // Thêm thuộc tính này để tránh vấn đề CORS
              />

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-teal-900 dark:text-white rounded-lg shadow-lg z-50 transition-opacity duration-200">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                    <span className="font-semibold">User Menu</span>
                  </div>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-teal-100 dark:hover:bg-gray-700"
                    onClick={() => debouncedNavigate("/userprofile")}
                  >
                    Profile
                  </button>
                  {role === "Student" && (
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-teal-100 dark:hover:bg-gray-700"
                      onClick={() => debouncedNavigate("/cart")}
                    >
                      Cart
                    </button>
                  )}
                  <button
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 dark:hover:bg-red-800"
                    onClick={logout}
                  >
                    Logout
                  </button>
                  <div className="w-full flex justify-center py-3">
                    <Switch
                      onClick={toggleTheme}
                      checkedChildren="Dark"
                      unCheckedChildren="Light"
                      defaultChecked={theme === "dark"}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => debouncedNavigate("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
