import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminNavDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navOptions = [
        { path: '/admin/requests', label: 'Request Management' },
        { path: '/admin/users', label: 'User Management' }
    ];

    const getCurrentLabel = () => {
        const current = navOptions.find(option => option.path === location.pathname);
        return current?.label || 'Admin Menu';
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                    hover:shadow-[0_4px_4px_#9C8F7F]
                    relative inline-flex
                    w-full sm:w-56
                    justify-center items-center
                    rounded-2xl bg-[#EEE8DF] px-4 pr-8 py-2
                    font-fraunces
                    text-sm sm:text-base
                    text-[#4B3935]
                    shadow-[0_2px_3px_#9C8F7F]
                    transition cursor-pointer
                "
            >
                <svg
                    className={`absolute right-3 w-4 h-4 transition duration-300 ${isOpen ? "transform rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                    />
                </svg>
                <span className="mx-auto text-sm sm:text-base">
                    {getCurrentLabel()}
                </span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <div className="
                        absolute right-0 mt-1
                        w-full sm:w-56
                        rounded-2xl bg-[#EEE8DF] shadow-md
                        focus:outline-none z-20 overflow-hidden
                    ">
                        <div className="py-1">
                            {navOptions.map((option) => (
                                <button
                                    key={option.path}
                                    onClick={() => handleNavigate(option.path)}
                                    className={`
                                        block w-full px-4 py-2 text-center 
                                        font-fraunces text-sm sm:text-base 
                                        transition rounded-2xl mx-auto -my-1 cursor-pointer
                                        ${location.pathname === option.path 
                                            ? "bg-[#4B3935] text-[#EEE8DF]" 
                                            : "text-[#4B3935] hover:bg-[#4B3935]/10"
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
