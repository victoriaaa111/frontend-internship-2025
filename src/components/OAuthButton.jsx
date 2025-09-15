const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';
export default function OAuthButton({type}) {
  const handleGoogleLogin = () => {
    // Simply redirect to Google OAuth URL
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
          <button

              type="button"
    
            onClick={handleGoogleLogin}
            className="w-1/2 mx-auto flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md hover:bg-[#D9D9D9] transition duration-200 cursor-pointer"
          >
            <img src="google.png" alt="Google" className="w-5 h-5 sm:w-4 sm:h-4 mx-2" />
            <span className="text-[#331517] font-fraunces text-sm sm:text-base">{type} with Google</span>
          </button>
  );
}

