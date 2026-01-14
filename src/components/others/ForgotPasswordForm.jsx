import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import Toast from "@/components/common/Toast";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("email"); // "email" | "otp" | "password"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
    durationMs: 3000,
  });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [resetToken, setResetToken] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerSeconds]);

  const showToast = (message, type = "success", durationMs = 3000) => {
    setToast({
      isVisible: true,
      message,
      type,
      durationMs,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      const response = await fetch(getApiUrl("auth/admin/send-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to send OTP. Please try again.");
      }

      showToast(result.message || "OTP sent to your email");
      setStep("otp");
      setTimerSeconds(120);
    } catch (err) {
      const msg = err.message || "Failed to send OTP. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      const response = await fetch(getApiUrl("auth/admin/verify-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to verify OTP. Please try again.");
      }

      if (!result.data || !result.data.token) {
        throw new Error("Invalid response from server. Token is missing.");
      }

      setResetToken(result.data.token);
      setStep("password");
      showToast(result.message || "OTP verified. Please set your new password.");
    } catch (err) {
      const msg = err.message || "Failed to verify OTP. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (!resetToken) {
      setError("Session expired. Please restart the reset flow.");
      return;
    }

    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      const response = await fetch(getApiUrl("auth/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({
          newPassword: newPassword.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to update password. Please try again.");
      }
      const delayMs = 3500;
      showToast(
        "Password updated successfully. Please login.",
        "success",
        delayMs
      );

      setTimeout(() => {
        navigate("/login");
      }, delayMs);
    } catch (err) {
      const msg = err.message || "Failed to update password. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timerSeconds > 0 || !email.trim()) return;
    // Reuse the send OTP logic without changing step
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("auth/admin/send-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to resend OTP. Please try again.");
      }

      showToast(result.message || "OTP resent to your email");
      setTimerSeconds(120);
    } catch (err) {
      const msg = err.message || "Failed to resend OTP. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderTimer = () => {
    if (step !== "otp") return null;
    if (timerSeconds > 0) {
      const minutes = Math.floor(timerSeconds / 60);
      const seconds = timerSeconds % 60;
      const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      return (
        <p className="text-14 text-dark-1 mt-10">
          Resend OTP in <span className="fw-500">{formatted}</span>
        </p>
      );
    }

    return (
      <button
        type="button"
        className="text-14 text-purple-1 fw-500 -underline mt-10"
        onClick={handleResendOtp}
        disabled={loading}
      >
        Resend OTP
      </button>
    );
  };

  return (
    <div className="form-page__content lg:py-50">
      <div className="container">
        <div className="row justify-center items-center">
          <div className="col-xl-6 col-lg-8">
            <div className="px-50 py-50 md:px-25 md:py-25 bg-white shadow-1 rounded-16">
              <h3 className="text-30 lh-13">Forgot Password</h3>

              {error && (
                <div className="mt-20 p-15 pl-15 bg-red-1 text-white rounded-8">
                  {error}
                </div>
              )}

              <form className="contact-form respondForm__form row y-gap-20 pt-30">
                <div className="col-12">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter your admin email"
                    disabled={loading || step !== "email"}
                  />
                </div>

                {step === "otp" && (
                  <div className="col-12">
                    <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                      OTP
                    </label>
                    <input
                      required
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter the OTP sent to your email"
                      disabled={loading}
                    />
                    {renderTimer()}
                  </div>
                )}

                {step === "password" && (
                  <div className="col-12">
                    <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                      New Password
                    </label>
                    <div style={{ position: "relative", overflow: "visible" }}>
                      <input
                        required
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Enter your new password"
                        disabled={loading}
                        style={{
                          paddingRight: "50px",
                          width: "100%",
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={loading}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: loading ? "not-allowed" : "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1A1F2E",
                          opacity: loading ? 0.5 : 1,
                          transition: "opacity 0.2s",
                          zIndex: 10,
                          width: "28px",
                          height: "28px",
                          outline: "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.opacity = "0.7";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.opacity = "1";
                          }
                        }}
                      >
                        {showNewPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.94 17.94C16.2306 19.243 14.1491 20.4641 12 20.4641C5 20.4641 1 12.2321 1 12.2321C2.22589 9.85112 3.91285 7.77691 5.94 6.06M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6511 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1751 15.0073 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1961C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88M1 1L23 23"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="col-12 d-flex justify-between items-center pt-10">
                  <button
                    type="button"
                    className="text-14 text-dark-1 fw-500 -underline"
                    onClick={() => navigate("/login")}
                    disabled={loading}
                  >
                    Back to Login
                  </button>

                  {step === "email" && (
                    <button
                      type="submit"
                      className="button -md -green-1 text-dark-1 fw-500"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  )}

                  {step === "otp" && (
                    <button
                      type="submit"
                      className="button -md -green-1 text-dark-1 fw-500"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  )}

                  {step === "password" && (
                    <button
                      type="submit"
                      className="button -md -green-1 text-dark-1 fw-500"
                      onClick={handleChangePassword}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        duration={toast.durationMs || 3000}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

