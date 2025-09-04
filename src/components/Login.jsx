export default function Login() {
  return (
    <div className="bg-[#D9D1C0] h-screen w-screen overflow-hidden flex flex-col lg:flex-row fixed top-0 left-0">
      {/* LEFT IMAGE SECTION (desktop only) */}
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
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-erotique-bold text-[#B57E25] mb-6">
          BorrowBook
        </h1>

        {/* Login Card */}
        <div className="bg-[#d9d9d9] w-full max-w-sm sm:max-w-md rounded-lg border border-[#331517] p-6 sm:p-8 shadow-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-cotta font-bold text-[#331517] text-center mb-6">
            User Login
          </h2>

          {/* Email */}
          <label className="block text-sm sm:text-base text-[#331517] mb-1 font-neuton">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-[#331517] rounded-md px-3 py-2 mb-4 focus:outline-none font-neuton text-sm sm:text-base"
          />

          {/* Password */}
          <label className="block text-sm sm:text-base text-[#331517] mb-1 font-neuton">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-[#331517] rounded-md px-3 py-2 mb-6 focus:outline-none font-neuton text-sm sm:text-base"
          />

          {/* Login button */}
          <button
            className="w-1/2 bg-[#331517] text-[#D9D9D9] text-sm sm:text-lg py-2 rounded-md
            font-neuton mx-auto block mb-4
            transition-colors duration-200
            hover:bg-[#D9D9D9] hover:text-[#331517]
            focus:outline-none focus:ring-2 focus:ring-[#331517]
            hover:outline hover:outline-2 hover:outline-[#331517]
            cursor-pointer"
          >
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-[#331517]" />
            <span className="px-2 text-xs sm:text-sm text-[#331517] font-cotta font-bold">
              OR
            </span>
            <hr className="flex-grow border-[#331517]" />
          </div>

          {/* Google login */}
          <button
            className="w-1/2  mx-auto flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md 
            hover:bg-[#D9D9D9] transition duration-200 cursor-pointer"
          >
            <img
              src="google.png"
              alt="Google"
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
            />
            <span className="text-[#331517] font-neuton text-sm sm:text-base">
              Login with Google
            </span>
          </button>

          {/* Create an account */}
          <div className="w-full text-center mt-4">
            <span className="text-[#B57E25] font-neuton text-sm sm:text-base cursor-pointer">
              Create an account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
