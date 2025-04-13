import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Add the useParams hook

const UploadTutorCertificate = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  const { userId } = useParams(); // Get userId from URL
  const [certificateUrl, setCertificateUrl] = useState(""); // Store certificate URL
  const [title, setTitle] = useState(""); // Store certificate title
  const [loading, setLoading] = useState(false); // Uploading status
  const [message, setMessage] = useState(""); // Error or success message
  const [certificates, setCertificates] = useState([]); // Array to store certificates

  useEffect(() => {
    if (userId) {
      console.log("User ID from URL: ", userId); // Confirm the userId is correctly fetched
    }
  }, [userId]);

  // Handle certificate URL input change
  const handleUrlChange = (e) => {
    setCertificateUrl(e.target.value);
  };

  // Handle certificate title input change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Handle certificate upload submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certificateUrl || !title) {
      setMessage("Please provide both certificate title and URL.");
      return;
    }

    const newCertificate = { title, certificate_url: certificateUrl };

    // Check if the certificate already exists in the array
    const isExist = certificates.some(
      (cert) =>
        cert.title === newCertificate.title &&
        cert.certificate_url === newCertificate.certificate_url
    );

    if (!isExist) {
      setCertificates([...certificates, newCertificate]); // Add the new certificate to the array
      setCertificateUrl(""); // Clear URL input
      setTitle(""); // Clear Title input
    } else {
      setMessage("This certificate already exists.");
      return;
    }

    setLoading(true);
    try {
      // Send data to the API, passing userId in the endpoint
      const response = await axios.post(
        `https://multicourse.onrender.com/api/users/upload-certificate/${userId}`, // Use userId in the URL
        { certificates: [...certificates, newCertificate] }, // Send the certificates array
        {
          headers: {
            "Content-Type": "application/json", // Ensure sending data in JSON format
          },
        }
      );

      setLoading(false);
      setMessage(response.data.message);

      // Update the certificates list with the data returned from the API
      setCertificates(response.data.certificates); // Update certificates after successful upload
    } catch (error) {
      setLoading(false);
      setMessage("Failed to upload certificates. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Upload Tutor Certificates
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Certificate Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter certificate title"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Certificate URL:
          </label>
          <input
            type="text"
            value={certificateUrl}
            onChange={handleUrlChange}
            placeholder="Enter certificate URL"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload Certificates"}
        </button>
        <button
          onClick={() => navigate("/courses-list-tutor")} // Điều hướng về trang login
          className="mb-4 py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
        >
          Skip
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}

      {/* Display uploaded certificates */}
      {certificates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Uploaded Certificates:</h3>

          <ul className="space-y-2">
            {certificates.map((cert, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="font-medium">{cert.title}</span> -{" "}
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {cert.certificate_url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadTutorCertificate;
