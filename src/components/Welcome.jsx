import { useLocation, Navigate } from "react-router-dom";

export default function Welcome() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#D9D1C0] flex items-center justify-center">
            <h1 className="text-4xl font-erotique-bold text-[#331517]">
                Welcome, {location.state?.username || 'User'}
            </h1>
        </div>
    );
}