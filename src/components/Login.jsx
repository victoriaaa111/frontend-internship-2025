import { useEffect, useState } from "react";
import { initCsrf, csrfFetch } from "../csrf.js";
import { useNavigate } from "react-router-dom";
import OAuthButton from "./OAuthButton.jsx";

const MAX_ATTEMPTS = 5;
const DEV_FAKE_SESSION = true; // set to false in production
// const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

export default function Login() {
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

  const navigate = useNavigate();

  useEffect(() => {
    initCsrf("http://localhost:8080");
  }, []);

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

    try {
      const response = await csrfFetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });
      if (response.__unauthorized) {
        navigate("/login");
      }

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error("Please check your information and try again");
          case 401:
            throw new Error("Invalid username or password");
          case 500:
            throw new Error("Something went wrong on our end. Please try again later");
          default:
            throw new Error("Unable to login. Please try again");
        }
      }

      const data = await response.json();
      console.log("Login response:", data);

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
      setError(err.message);
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
      const res = await csrfFetch("http://localhost:8080/api/v1/auth/verify-code", {
        method: "POST",
        body: { sessionId, code: verificationCode },
      });
      if (res.__unauthorized) {
        navigate("/login");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Invalid verification code");

      setSessionId('');
      navigate("/welcome", {
        state: { username: formData.username },
        replace: true
      });
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
    <div className="bg-[#D9D1C0] h-screen w-screen overflow-hidden flex flex-col lg:flex-row fixed top-0 left-0">
      {/* LEFT IMAGE SECTION */}
      <div
        className="hidden lg:flex w-1/2 h-full bg-cover bg-center flex-col justify-center p-12"
        style={{ backgroundImage: "url('frontend.png')" }}
      >
        <h2 className="text-4xl xl:text-5xl font-erotique-bold text-[#D9D1C0] mb-4 border-b border-[#D9D1C0] pb-2 drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]">
          Share Your Library
        </h2>
        <p className="text-lg xl:text-2xl font-cotta text-[#D9D1C0] drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)] max-w-md">
          Save money, reduce clutter, and give your books new journeys through your community.
        </p>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 h-full px-6 sm:px-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-erotique-bold text-[#B57E25] mb-6">BorrowBook</h1>

        {/* Login Card */}
        <form
          className="bg-[#d9d9d9] w-full max-w-sm sm:max-w-md rounded-4xl p-6 sm:p-8"
          style={{
        boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.2)",
      }}
          onSubmit={handleLogin}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-cotta font-bold text-[#331517] text-center mb-6">
            User Login
          </h2>

          {/* Username */}
          <label className="block text-sm sm:text-base text-[#331517] mb-1 font-neuton">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-[#331517] rounded-md px-3 py-2 mb-4 focus:outline-none font-neuton text-sm sm:text-base"
            required
          />

          {/* Password */}
          <label className="block text-sm sm:text-base text-[#331517] mb-1 font-neuton">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-[#331517] rounded-md px-3 py-2 mb-6 focus:outline-none font-neuton text-sm sm:text-base"
            required
          />

          {/* Error */}
          {error && !showVerification && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-[#331517] text-[#D9D9D9] text-sm sm:text-lg py-2 rounded-md font-neuton mx-auto block mb-4 transition-colors duration-200 hover:bg-[#D9D9D9] hover:text-[#331517] focus:outline-none focus:ring-2 focus:ring-[#331517] hover:outline hover:outline-2 hover:outline-[#331517] cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-[#331517]" />
            <span className="px-2 text-xs sm:text-sm text-[#331517] font-cotta font-bold">OR</span>
            <hr className="flex-grow border-[#331517]" />
          </div>

          <OAuthButton type="Login"/>
          {/* Create an account */}
          <div className="w-full text-center mt-4">
            <span className="text-[#B57E25] font-neuton text-sm sm:text-base cursor-pointer">
              Create an account
            </span>
          </div>
        </form>
      </div>

      {/* Verification Pop-up */}
      {showVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
          <div className="relative z-50 bg-[#D9D9D9] p-8 rounded-lg shadow-xl w-[90%] max-w-[400px]">
            <h3 className="text-2xl font-cotta text-[#331517] mb-4">Verify Your Email</h3>
            <p className="font-neuton text-[#331517] mb-2">
              Please enter the verification code sent to your email.
            </p>
            {error && (
              <p className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 mb-3 font-neuton">
                {error}
              </p>
            )}
            <form onSubmit={handleVerification} className="flex flex-col gap-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="px-4 font-neuton text-[#331517] h-12 border border-[#331517] rounded-md focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                placeholder="Enter verification code"
                required
                disabled={verifying || attemptsLeft <= 0}
              />
              <button
                type="submit"
                disabled={verifying || attemptsLeft <= 0}
                className={`bg-[#331517] text-[#D9D9D9] py-3 rounded-md border border-[#331517] transition-colors duration-200 ${
                  verifying || attemptsLeft <= 0
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#D9D9D9] hover:text-[#331517]"
                }`}
              >
                {verifying ? "Verifying…" : "Verify"}
              </button>
              <p className="text-sm text-[#331517] font-neuton text-center">
                Attempts left: {attemptsLeft}/{MAX_ATTEMPTS}
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}