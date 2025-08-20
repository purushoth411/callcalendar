import React, { useState } from "react";
import logo from "../assets/images/callcalendar-logo.png";
import { toast } from "react-hot-toast";

export default function ResetPassword() {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpVisible, setOtpVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingSendOtp, setLoadingSendOtp] = useState(false); 
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false); 

  // Send OTP
  const handleSendOtp = async () => {
    setLoadingSendOtp(true);
    try {
      const res = await fetch("https://callback-2suo.onrender.com/api/users/sendOtpVerification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.status) {
        toast.success("OTP sent to registered email");
        setOtpVisible(true);
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Unable to connect to server");
    }
    setLoadingSendOtp(false);
  };

  // Change OTP digits
  const handleOtpChange = (value, index) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Verify OTP and fetch password
  const handleVerifyOtp = async () => {
    setLoadingVerifyOtp(true);
    const enteredOtp = otp.join("");

    try {
      const res = await fetch("https://callback-2suo.onrender.com/api/users/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp: enteredOtp }),
      });
      const data = await res.json();

      if (data.status) {
        toast.success("OTP verified successfully");
        setPassword(data.password);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Unable to connect to server");
    }
    setLoadingVerifyOtp(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto w-72" />
        </div>
        <h2 className="text-[19px] font-semibold text-center prime-text mb-5">
          Reset Your Password
        </h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded relative mb-4">
            <strong className="font-semibold">Error:</strong> {errorMsg}
            <button
              onClick={() => setErrorMsg("")}
              className="absolute right-2 top-2 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        )}

        {!otpVisible ? (
          <>
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="button"
              disabled={loadingSendOtp}
              className={`w-full btn-prime font-semibold py-2 rounded-md ${
                loadingSendOtp ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={handleSendOtp}
            >
              {loadingSendOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : password ? (
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-2">Your Password:</p>
            <div className="bg-gray-100 p-3 rounded-lg text-lg font-bold tracking-wide">
              {password}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">Enter OTP</label>
              <div className="flex space-x-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="w-10 h-10 text-center border rounded text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={loadingVerifyOtp}
              className={`w-full btn-prime font-semibold py-2 rounded-md ${
                loadingVerifyOtp ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={handleVerifyOtp}
            >
              {loadingVerifyOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        <div className="mb-4 mt-6 flex justify-center">
            
             <a href="/" className="text-[13px] font-semibold text-gray-600  hover:text-orange-600 hover:underline ">
              Go to Login
            </a>
          </div>
      </div>
    </div>
  );
}
