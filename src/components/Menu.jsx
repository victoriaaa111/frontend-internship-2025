import {Link, useLocation} from "react-router-dom";
import Inbox from "./Inbox.jsx";


export default function Menu() {
    const location = useLocation();
    return(
        <>
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 py-2">
                {/* Logo */}
                <Link
                    to="/home"
                    className={`cursor-pointer hover:opacity-80 transition-all duration-200 hover:underline hover:underline-offset-4 ${
                        location.pathname === '/home'
                            ? 'underline underline-offset-4'
                            : ''
                    }`}
                >
                    <img
                        src="/BB-blue1.png"
                        alt="logo"
                        className="w-12 h-12 object-contain md:w-16 md:h-16 lg:w-18 lg:h-18"
                    />
                </Link>


                {/* Navigation */}
                <div className="flex space-x-4 text-[#4B3935] text-md md:text-lg lg:text-xl font-fraunces-light pr-4 sm:pr-8 lg:pr-10 relative">
                    {/* Inbox */}
                    <Inbox/>

                    {/* Links */}
                    <Link
                        to="/home"
                        className={`cursor-pointer hover:opacity-80 transition-all duration-200 hover:underline hover:underline-offset-4 ${
                            location.pathname === '/home'
                                ? 'underline underline-offset-4'
                                : ''
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/profile"
                        className={`cursor-pointer hover:opacity-80 transition-all duration-200 hover:underline hover:underline-offset-4 ${
                            location.pathname === '/profile'
                                ? 'underline underline-offset-4'
                                : ''
                        }`}
                    >
                        Profile
                    </Link>
                </div>
            </div>
        </>
    )
}