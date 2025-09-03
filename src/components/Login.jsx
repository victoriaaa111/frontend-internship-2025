export default function Login() {
  return (
    <div className="bg-[#D9D1C0] min-h-screen flex flex-col items-center justify-center px-6">
      {/* Title */}
      <h1 className="text-4xl font-bold font-erotique text-[#B57E25] mb-10">
        BorrowBook
      </h1>

      {/* Login Card */}
      <div className="bg-[#d9d9d9] w-full max-w-sm rounded-lg border border-[#331517] p-6 shadow-md">
        <h2 className="text-2xl font-cotta font-bold text-[#331517] text-center mb-5">
          User Login
        </h2>

        {/* Email */}
        <label className="block text-m text-[#331517] mb-1 font-neuton">Email</label>
        <input
          type="email"
          className="w-full border border-[#331517] rounded-md px-3 py-2 mb-4 focus:outline-none font-neuton"
        />

        {/* Password */}
        <label className="block text-m text-[#331517] mb-1 font-neuton">Password</label>
        <input
          type="password"
          className="w-full border border-[#331517] rounded-md px-3 py-2 mb-6 focus:outline-none font-neuton"
        />

        {/* Login button */}
        <button className="w-1/2 bg-[#331517] text-white text-2xl py-2 rounded-md hover:opacity-90 font-neuton mx-auto block mb-4">
        Login
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-[#331517]" />
          <span className="px-2 text-sm text-[#331517] font-cotta font-bold">OR</span>
          <hr className="flex-grow border-[#331517]" />
        </div>

        {/* Google login */}
        <button className="w-full flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md hover:opacity-90">
          <img
            src="google.png"
            alt="Google"
            className="w-6 h-6 mr-2"/>
          <span className="text-[#331517] font-neuton text-lg">Login with Google</span>
        </button>

        {/* Create an account pure text */}
        <div className="w-full text-center mt-4">
        <span className="text-[#B57E25] font-neuton text-lg">Create an account</span>
        </div>
      </div>
    </div>
  );
}
