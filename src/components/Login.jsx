export default function Login() {
  return (
    <div
      className="bg-[#D9D1C0] min-h-screen flex flex-col items-center justify-center px-6 md:px-24"
      style={{ maxWidth: "834px", maxHeight: "1194px", margin: "0 auto" }}
    >
      {/* Title */}
      <h1 className="text-4xl md:text-7xl font-erotique-bold text-[#B57E25] mb-10 md:mb-16">
        BorrowBook
      </h1>

      {/* Login Card */}
      <div
        className="bg-[#d9d9d9] w-full max-w-sm md:max-w-xl rounded-lg border border-[#331517] p-6 md:p-16 shadow-md"
        style={{ maxWidth: "500px", maxHeight: "720px" }}
      >
        <h2 className="text-2xl md:text-4xl font-cotta font-bold text-[#331517] text-center mb-5 md:mb-10">
          User Login
        </h2>

        {/* Email */}
        <label className="block text-m md:text-2xl text-[#331517] mb-1 font-neuton">
          Email
        </label>
        <input
          type="email"
          className="w-full border border-[#331517] rounded-md px-3 py-2 md:py-4 mb-4 focus:outline-none font-neuton text-base md:text-2xl"
        />

        {/* Password */}
        <label className="block text-m md:text-2xl text-[#331517] mb-1 font-neuton">
          Password
        </label>
        <input
          type="password"
          className="w-full border border-[#331517] rounded-md px-3 py-2 md:py-4 mb-6 focus:outline-none font-neuton text-base md:text-2xl"
        />

        {/* Login button */}
        <button className="w-1/2 md:w-1/3 bg-[#331517] text-white text-2xl md:text-3xl py-2 md:py-4 rounded-md hover:opacity-90 font-neuton mx-auto block mb-4 md:mb-8">
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center my-4 md:my-8">
          <hr className="flex-grow border-[#331517]" />
          <span className="px-2 text-sm md:text-2xl text-[#331517] font-cotta font-bold">
            OR
          </span>
          <hr className="flex-grow border-[#331517]" />
        </div>

        {/* Google login */}
        <button className="w-full flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 md:py-4 rounded-md hover:opacity-90">
          <img
            src="google.png"
            alt="Google"
            className="w-6 h-6 md:w-12 md:h-12 mr-2"
          />
          <span className="text-[#331517] font-neuton text-lg md:text-2xl">
            Login with Google
          </span>
        </button>

        {/* Create an account pure text */}
        <div className="w-full text-center mt-4 md:mt-5">
          <span className="text-[#B57E25] font-neuton text-lg md:text-2xl">
            Create an account
          </span>
        </div>
      </div>
    </div>
  );
}