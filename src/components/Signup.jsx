import InfoImage from '/frontend.png';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {csrfFetch } from "../csrf.js";
import DOMPurify from 'dompurify';

import OAuthButton from "./OAuthButton.jsx";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Signup() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const response = await csrfFetch(`${API_BASE}/api/user/me`);
            if(response.ok){
                navigate("/profile");
            }
        }
        checkAuth()
    }, [navigate]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    };

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

    const sanitizeInput = (input) => {
        return DOMPurify.sanitize(input.trim().substring(0, 255));
    };

    const [sessionId, setSessionId] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');


    const MAX_ATTEMPTS = 5;
    const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
    const [verifying, setVerifying] = useState(false);

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(
            {...formData, [e.target.name]: e.target.value}
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const username = sanitizeInput(formData.username);
        const email = sanitizeInput(formData.email);
        const password = formData.password;
        // Validate inputs
        if (!validateUsername(username)) {
            setError('Username must be 5-30 characters and contain only letters, numbers, _ or -');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters with one uppercase letter and one number');
            return;
        }

        try {

            const response = await csrfFetch(`${API_BASE}/api/v1/auth/register`, {
                method: "POST",
                body: JSON.stringify({
                username,
                email,
                password
            })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.message || "Registration failed");

            if (response.status !== 201) {
                switch (response.status) {
                    case 400:
                        throw new Error('Please check your information and try again');
                    case 409:
                        throw new Error('This email or username is already taken');
                    case 500:
                        throw new Error('Something went wrong on our end. Please try again later');
                    default:
                        throw new Error('Unable to create account. Please try again');
                }
            }

            setSessionId(data.sessionId);
            setShowVerification(true);
            setAttemptsLeft(MAX_ATTEMPTS); // reset attempts when opening modal
            setVerificationCode('');
            console.log('Signup successful');
        } catch (err) {
            const safeErrorMessage = err.message ? sanitizeInput(err.message) : 'Signup failed';
            setError(safeErrorMessage);
            setTimeout(() => {
                setError("");
            }, 4500)
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

            const response =  await csrfFetch(`${API_BASE}/api/user/me`);
            const dataUser = await response.json();
            if(dataUser.role === 'USER'){
                navigate("/profile");
            }else if(dataUser.role === 'ADMIN'){
                navigate("/admin/requests");
            }else{
                navigate("/profile");
            }
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
        <>
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

            <div className="bg-[#F6F2ED] min-h-screen flex flex-col justify-center items-center lg:flex-row">
            {/*LEFT SIDE WITH IMAGE */}
            <div
                className="min-h-screen hidden lg:flex w-1/2 bg-cover bg-center flex-col justify-center h-full p-12"
                style={{ backgroundImage: `url(${InfoImage})` }}
            >
                <h2 className="text-5xl font-erotique-bold text-[#DAD1C6] mb-4 border-b border-[#EEE8DF] pb-2 drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]">
                    Share Your Library
                </h2>
                <p className="text-3xl font-cotta text-[#DAD1C6] max-w-[700px] drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]" >
                    Save money, reduce clutter, and give your books new journeys through your community.
                </p>
            </div>

            {/*RIGHT SIDE WITH FORM */}
            <div className=" w-full flex flex-col items-center gap-6 px-2 lg:w-1/2 ">
                <h1 className="font-erotique-bold text-4xl mx-2
            md:text-6xl text-[#2C365A]
            ">BorrowBook</h1>
                <form onSubmit={handleSubmit}
                      className="shadow-[0_2px_3px_#9C8F7F] bg-[#EEE8DF] rounded-4xl w-[90%] max-w-[298px] flex flex-col justify-center items-center px-5 py-6
            md:max-w-[500px] md:w-[80%]
             ">
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
                    <h2 className="text-2xl font-cotta text-[#4B3935] mb-4
                md:text-3xl md:mt-3
                ">Create Account</h2>
                    <div className="w-full flex flex-col justify-center items-center md:mt-2">

                        <div className="w-full md:max-w-[400px] mt-4 relative">
                            <div className="relative flex items-center">
                                <img
                                    src="/profile.png"
                                    alt="Person icon for username"
                                    className="absolute left-2 w-5.5 h-5.5 z-10 opacity-50"
                                />
                                <input
                                    placeholder="Username"
                                    required
                                    pattern="[a-zA-Z0-9_\-]+"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50 px-2 pl-9 text-base font-fraunces text-[#4B3935] w-full h-12 border border-[#4B3935] rounded-md lg:text-lg"
                                />
                            </div>
                        </div>



                        <div className="w-full md:max-w-[400px] mt-4 relative">
                            <div className="relative flex items-center">
                                <img
                                    src="/mail.png"
                                    alt="Mail icon for email"
                                    className="absolute left-2.5 w-4.5 h-4.5 z-10 opacity-60"
                                />
                                <input
                                    placeholder="Email"
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    minLength="8"
                                    maxLength="128"
                                    className="focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50 px-2 pl-9 text-base font-fraunces text-[#4B3935] w-full h-12 border border-[#4B3935] rounded-md lg:text-lg"
                                />
                            </div>
                        </div>

                        <div className="w-full md:max-w-[400px] mt-4 relative">
                            <div className="relative flex items-center">
                                <img
                                    src="/lock.png"
                                    alt="Lock icon for password"
                                    className="absolute left-2 w-5 h-5 z-10 opacity-70"
                                />
                                <input
                                    placeholder="Password"
                                    type="password"
                                    required
                                    name="password"
                                    minLength="8"
                                    maxLength="128"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50 px-2 pl-9 text-base font-fraunces text-[#4B3935] w-full h-12 border border-[#4B3935] rounded-md lg:text-lg"
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="max-w-45 w-full bg-[#4B3935] font-fraunces-light text-[#F6F2ED] rounded-md mt-4 text-base py-2
                md:max-w-[228px] md:text-xl md:mt-6 cursor-pointer hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200">
                        Create Account
                    </button>
                    <div className="flex items-center my-4 w-full md:w-[400px] lg:w-[350px]">
                        <hr className="flex-grow border-[#4B3935]" />
                        <span className="px-2 text-sm text-[#4B3935] font-neuton md:text-xl">OR</span>
                        <hr className="flex-grow border-[#4B3935]" />
                    </div>

                        <OAuthButton type="Sign Up"/>


                    <button type="button" onClick={()=>navigate('/login')} className="hover:text-[#9C8F7F] text-[#4B3935] transition duration-200 font-fraunces-light text-sm mt-2 md:text-lg md:mb-8 cursor-pointer">Sign in to your account</button>
                </form>
            </div>

        </div>
        </>
    )
}