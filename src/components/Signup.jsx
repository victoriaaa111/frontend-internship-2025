export default function Signup() {
    return (
        <div className="bg-[#D9D1C0] min-h-screen text-[#B57E25] flex flex-col justify-center items-center gap-6 px-2">
            <h1 className="font-erotique-bold text-4xl mx-2">BorrowBook</h1>
            <div className="bg-[#D9D9D9] rounded-lg shadow-md w-full max-w-74 max-h-124 border border-[#331517] flex flex-col justify-center items-center px-5 py-6
            ">
                <h2 className="text-2xl font-cotta text-[#331517] mb-4">Create Account</h2>
                <div className="w-full">
                    <label className="font-neuton text-[#331517] text-base self-start mt-4">Username</label>
                    <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                    <label className="font-neuton text-[#331517] text-base self-start mt-4">Email</label>
                    <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                    <label className="font-neuton text-[#331517] text-base self-start mt-4">Password</label>
                    <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                </div>
                <button className="max-w-45 w-full h-10 bg-[#331517] font-neuton-light text-[#D9D9D9] rounded-md font-extralight mt-4">
                    Create Account
                </button>
                <div className="flex items-center my-4 w-full">
                    <hr className="flex-grow border-[#331517]" />
                    <span className="px-2 text-sm text-[#331517] font-neuton">OR</span>
                    <hr className="flex-grow border-[#331517]" />
                </div>
                <button className="max-w-45 w-full h-10 flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md hover:opacity-90">
                    <img src="../src/assets/google.png" alt="Google" className="w-5 h-5 mr-2"/>
                    <span className="text-[#331517] font-neuton text-base">Sign Up with Google</span>
                </button>
                <button className="font-neuton-light text-sm mt-2">Sign in to your account</button>
            </div>
        </div>
    )
}