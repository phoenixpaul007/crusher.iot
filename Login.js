//LoginPAGE

import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const sendOTP = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/send-otp",
        { email }
      );

      setMessage(res.data.message);
      setOtpSent(true);
    } catch (err) {
      setMessage("Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/verify-otp",
        {
          email,
          otp,
        }
      );

      setMessage(res.data.message);

      if (res.data.success) {
        localStorage.setItem("userEmail", email);
        alert("Login Successful");
      }
    } catch (err) {
      setMessage("Invalid OTP");
    }
  };

  return (
    <div
      style={{
        width: "400px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h2>Email OTP Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      {!otpSent ? (
        <button
          onClick={sendOTP}
          style={{
            width: "100%",
            padding: "10px",
          }}
        >
          Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
            }}
          />

          <button
            onClick={verifyOTP}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
            }}
          >
            Verify OTP
          </button>
        </>
      )}

      <p>{message}</p>
    </div>
  );
}

export default Login;