import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewCertificate = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("🔹 Token từ LocalStorage:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("🔹 Token đã giải mã:", decodedToken);

        if (!decodedToken._id) {
          console.error("❌ Token không chứa _id!");
        } else {
          setUserId(decodedToken._id);
          console.log("✅ userId từ token:", decodedToken._id);
        }
      } catch (error) {
        console.error("❌ Lỗi giải mã token:", error);
      }
    } else {
      console.error("❌ Không tìm thấy token trong LocalStorage!");
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Token not found! Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://multicourse.onrender.com/api/certificates/get-tutor-certificate",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificates(response.data.certificates);
    } catch (err) {
      console.error("❌ Error fetching certificates:", err);
      setError("Could not fetch certificates. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa chứng chỉ này không?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Token không tồn tại! Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await axios.delete(
        `https://multicourse.onrender.com/api/certificates/delete-tutor-certificate/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificates(certificates.filter((cert) => cert._id !== id));
      toast.success("Xóa chứng chỉ thành công!");
    } catch (error) {
      toast.error("Không thể xóa chứng chỉ, vui lòng thử lại!");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📜 Certificate List</h2>
      <button
        onClick={() => {
          if (!userId) {
            console.error("❌ User ID is NULL or UNDEFINED!");
            toast.error("User ID not found! Please log in again.");
            return;
          }
          navigate(`/uploadtutorcertificate/${userId}`);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        📤 Upload Certificate
      </button>

      {loading ? (
        <p className="text-gray-700">⏳ Loading certificates...</p>
      ) : error ? (
        <p className="text-red-500">❌ {error}</p>
      ) : certificates.length === 0 ? (
        <p className="text-gray-600">🚫 No certificates available.</p>
      ) : (
        <ul className="space-y-4">
          {certificates.map((cert) => (
            <li key={cert._id} className="p-4 bg-white rounded-lg shadow-md">
              <p className="font-semibold">🏷️ Title: {cert.title}</p>
              <p>
                🔗 URL:{" "}
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {cert.certificate_url}
                </a>
              </p>
              <button
                onClick={() => deleteCertificate(cert._id)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
              >
                ❌ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewCertificate;
