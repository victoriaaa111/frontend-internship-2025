const API_BASE = import.meta.env.VITE_API_BASE || 'https://borrow-book-backend.onrender.com';

const GOOGLE_AUTH_URL = `${API_BASE}/oauth2/authorization/google`;
export default function OAuthButton({type}) {
  const handleGoogleLogin = () => {
    // Simply redirect to Google OAuth URL
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
          <button

              type="button"
    
            onClick={handleGoogleLogin}
            className="w-1/2 mx-auto flex items-center justify-center border bg-[#F6F2ED] py-2 rounded-md hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer"
          >
            <img src="/google.png" alt="Google" className="w-5 h-5 sm:w-4 sm:h-4 mx-2" />
            <span className="text-[#4B3935] font-fraunces text-sm sm:text-base">{type} with Google</span>
          </button>
  );
}

