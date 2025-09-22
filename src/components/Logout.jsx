import React, {useState} from "react";
import {csrfFetch} from "../csrf.js";
import {useNavigate} from "react-router-dom";

export default function Logout({onClose}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        if(loading){
            return;
        }
        e.preventDefault();
        setLoading(true);
        setError("")

        try{
            const response = await csrfFetch("http://localhost:8080/api/v1/auth/logout",{
                method: "POST"
            })
            if (response.ok || response.status === 401 || response.status === 403) {

                document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                // Navigate to login immediately
                navigate("/login", { replace: true });
                return;
            }
            throw new Error("Could not logout");

        }catch(err){
        setError("Failed to log out. Please try again.");
        }finally{
        setLoading(false);
    }

    }

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30" onClick={onClose} />
            <div className="relative z-50 bg-[#EEE8DF] p-6 rounded-xl shadow-xl w-[90%] max-w-[380px]">
                <h3 className="font-fraunces text-xl text-[#4B3935] mb-3">Would you like to log out?</h3>
                {error && (
                    <div className="text-center bg-red-50 text-red-700 p-3 rounded-lg font-fraunces-light mb-4 text-sm">
                        {error}
                    </div>
                )}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="font-fraunces lg:text-lg px-4 py-2 rounded-full bg-[#F6F2ED] outline outline-[#4B3935] text-[#4B3935] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="font-fraunces-light px-4 py-2 rounded-full bg-[#4B3935] text-[#F6F2ED] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Logging out..." : "Yes, log out"}
                    </button>
                </div>
            </div>
        </div>
)
}