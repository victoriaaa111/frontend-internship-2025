import {useState } from "react";
import {csrfFetch } from "../csrf.js";
import { useNavigate } from "react-router-dom";
import OAuthButton from "./OAuthButton.jsx";
import { useEffect } from "react";
import DOMPurify from 'dompurify';
const MAX_ATTEMPTS = 5;
const DEV_FAKE_SESSION = true; // set to false in production

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const response = await csrfFetch(`${API_BASE}/api/user/me`);
      if (response.ok) {
        // User is authenticated, redirect away from login
        navigate("/profile");
      }
    };
    checkAuth();
  }, [navigate]);

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim().substring(0, 255));
  };


  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [sessionId, setSessionId] = useState("");



  const validatePassword = (password) => {
    // Check for minimum length and complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,128}$/;
    return passwordRegex.test(password);
  };

  const validateUsername = (username) => {
    // Allow only alphanumeric and safe characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username) && username.length >= 5 && username.length <= 30;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowVerification(false);
    setAttemptsLeft(MAX_ATTEMPTS);

    const username = sanitizeInput(formData.username);
    const password = formData.password;

    if (!validateUsername(username)) {
      setError('Username must be 5-30 characters and contain only letters, numbers, _ or -');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number');
      setLoading(false);
      return;
    }

    try {
      const response = await csrfFetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        body: JSON.stringify(
            { username, password }
        ),
      });


      if (!response.ok) {
        let errorMessage;
        switch (response.status) {
          case 400:
            errorMessage = "Invalid input. Please check your username and password format and try again.";
            break;
          case 401:
            errorMessage = "Login failed. Your username or password is incorrect. Please try again.";
            break;
          case 429:
            errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
            break;
          case 500:
            errorMessage = "Server error occurred. Please try again in a few moments.";
            break;
          default:
            errorMessage = "Login failed. Please check your connection and try again.";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const receivedSession =
        data.sessionId ??
        (DEV_FAKE_SESSION ? (data.id ? String(data.id) : `dev-${Date.now()}`) : undefined);

      if (!receivedSession) {
        throw new Error("No sessionId received from server.");
      }

      setSessionId(receivedSession);
      setShowVerification(true);
      setError("");
    } catch (err) {
      const safeErrorMessage = err.message ? sanitizeInput(err.message) : 'Login failed';
      setError(safeErrorMessage);

      setTimeout(() => {
        setError("");
      }, 4500);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (attemptsLeft <= 0) return;

    setError('');
    setVerifying(true);

    try {
      const res = await csrfFetch(`${API_BASE}/api/v1/auth/verify-code`, {
        method: "POST",
        body: { sessionId, code: verificationCode },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Invalid verification code");

      setSessionId('');
      navigate("/profile");
    } catch (err) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining > 0) {
        setError(`Invalid verification code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} left.`);
        setShowVerification(true);
      } else {
        setError(err.message);
        setShowVerification(true);

        setTimeout(() => {
          setShowVerification(false);
          setAttemptsLeft(MAX_ATTEMPTS);
          setVerificationCode('');
        }, 5000);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-[#F6F2ED] h-screen w-screen overflow-hidden flex flex-col lg:flex-row fixed top-0 left-0">
      {/* LEFT IMAGE SECTION */}
      <div
        className="hidden lg:flex w-1/2 h-full bg-cover bg-center flex-col justify-center p-12"
        style={{ backgroundImage: "url('/frontend.png')" }}
      >
        <h2 className="text-4xl xl:text-5xl font-erotique-bold text-[#DAD1C6] mb-4 border-b border-[#EEE8DF] pb-2 drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]">
          Share Your Library
        </h2>
        <p className="text-3xl font-cotta text-[#DAD1C6] max-w-[700px] drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]">
          Save money, reduce clutter, and give your books new journeys through your community.
        </p>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 h-full px-6 sm:px-12 lg:shadow-[inset_0_0_40px_rgba(61,56,50,0.5)]">
        <h1 className="font-erotique-bold text-4xl mx-2
            md:text-6xl text-[#2C365A] mb-6">BorrowBook</h1>


        {/* Login Card */}
        <form
          className="bg-[#EEE8DF] w-full max-w-sm sm:max-w-md rounded-4xl p-6 sm:p-8 shadow-[0_2px_3px_#9C8F7F]"
          onSubmit={handleLogin}
        >
          {/* Error */}
          {error && !showVerification && (
              <div className="bg-red-50 border text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-fraunces-light text-base">{error}</span>
                </div>
              </div>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-cotta font-bold text-[#4B3935] text-center mb-6">
            User Login
          </h2>

          {/* Username */}
          <div className="relative flex items-center text-[#4B3935] mb-4">
            <img
                src="/profile.png"
                alt="Person icon for username"
                className="absolute left-2 w-5 h-5 z-10 opacity-50"
            />
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                pattern="[a-zA-Z0-9_\-]+"
                minLength="5"
                maxLength="30"
                className="focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50 px-2 pl-9 text-base font-fraunces text-[#4B3935] w-full h-12 border border-[#4B3935] rounded-md lg:text-lg"
                required
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center text-[#4B3935] mb-4">
          <img
              src="/lock.png"
              alt="Lock icon for password"
              className="absolute left-2 w-5 h-5 z-10 opacity-50"
          />
          <input
              type="password"
              name="password"
              minLength="8"
              maxLength="128"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50 px-2 pl-9 text-base font-fraunces text-[#4B3935] w-full h-12 border border-[#4B3935] rounded-md lg:text-lg"
              required
          />
      </div>


          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer w-1/2 bg-[#4B3935] text-[#F6F2ED] text-sm sm:text-lg py-2 rounded-md font-fraunces-light mx-auto block mb-4"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-[#4B3935]" />
            <span className="px-2 text-sm text-[#4B3935] font-neuton md:text-xl">OR</span>
            <hr className="flex-grow border-[#4B3935]" />
          </div>

          <OAuthButton type="Login"/>
          {/* Create an account */}
          <div className="w-full text-center mt-4">

            <button type="button" onClick={()=>navigate('/signup')}>
              <span className="hover:text-[#9C8F7F] transition duration-200 text-[#4B3935] font-fraunces-light text-sm sm:text-base cursor-pointer">Create an account</span>
            </button>

          </div>
        </form>
      </div>
      {showVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
            <div className="relative z-50 bg-[#D9D9D9] p-8 rounded-lg shadow-xl w-[90%] max-w-[450px]">
              {/* Error */}
              {error && (
                  <div className="bg-red-50 border text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-fraunces-light text-base">{error}</span>
                    </div>
                  </div>
              )}
              <h3 className="text-2xl font-cotta text-[#4B3935] mb-4">Verify Your Email</h3>
              <p className="font-fraunces text-base text-[#4B3935] mb-2">Please enter the verification code sent to your email.</p>

              <form onSubmit={handleVerification} className="flex flex-col gap-4 ">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="px-4 font-fraunces text-[#4B3935] h-12 border border-[#4B3935] rounded-md focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                    placeholder="Enter verification code"
                    required
                    disabled={verifying || attemptsLeft <= 0}
                />
                <button
                    type="submit"
                    disabled={verifying || attemptsLeft <= 0}
                    className={`bg-[#4B3935] text-[#D9D9D9] py-2 rounded-md border border-[#4B3935] transition-colors duration-200 font-fraunces-light 
                            ${verifying || attemptsLeft <= 0 ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer'}`}
                >
                  {verifying ? 'Verifying…' : 'Verify'}
                </button>
                <p className="text-sm text-[#4B3935] font-fraunces text-center">
                  Attempts left: {attemptsLeft}/{MAX_ATTEMPTS}
                </p>
              </form>
            </div>
          </div>
      )}

    </div>
  );
}