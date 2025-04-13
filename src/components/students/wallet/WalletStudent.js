import React, { useState } from "react";
import axios from "axios";
import { FaWallet, FaQuestionCircle } from "react-icons/fa";

const WalletStudent = () => {
  const [amount, setAmount] = useState(0);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setResponseMessage("");

    if (amount < 50000) {
      setResponseMessage("The deposit amount must be greater than 50,000 VND.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setResponseMessage("Please login before payment.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/payment/create-payment",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        typeof response.data === "string" &&
        response.data.startsWith("http")
      ) {
        window.open(response.data, "_blank");
        setAmount(0);
      }
    } catch (error) {
      console.error("Error sending payment request:", error);
      setResponseMessage(
        error.response?.data?.message || "An error occurred, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-[#14b8a6] to-indigo-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#14b8a6] flex items-center justify-center">
          <FaWallet className="mr-2" /> Deposit Wallet
        </h2>
        <div className="flex flex-col items-center w-full">
          <div className="relative w-full">
            <input
              type="number"
              value={amount === 0 ? "" : amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setAmount("");
                } else {
                  setAmount(Number(value));
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 pr-10"
              placeholder="Enter amount..."
            />
            <div className="absolute inset-y-0 right-2 flex items-center group">
              <FaQuestionCircle className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl mb-4" />
              <div className="absolute bottom-8 right-0 w-48 p-2 text-sm text-white bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Deposit amount must be greater than 50,000 VND
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 w-full">
            {[
              50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 5000000,
              10000000,
            ].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className="bg-gray-200 text-gray-700 text-sm md:text-base py-2 px-4 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition w-full"
              >
                {value.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#14b8a6] text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              "Deposit"
            )}
          </button>

          {responseMessage && (
            <p className="mt-4 text-center text-sm text-gray-700">
              {responseMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletStudent;
