export default function Signup() {
    return (
        <div className="bg-[#D9D1C0] min-h-screen text-[#B57E25] flex flex-col justify-center items-center gap-6 px-2">
            <h1 className="font-erotique-bold text-4xl mx-2
            md:text-6xl
            ">BorrowBook</h1>
            <div className="bg-[#D9D9D9] rounded-lg shadow-md w-[90%] max-w-[298px] border border-[#331517] flex flex-col justify-center items-center px-5 py-6
            md:max-w-[616px] md:w-[80%]
             ">
                <h2 className="text-2xl font-cotta text-[#331517] mb-4
                md:text-3xl md:mt-3
                ">Create Account</h2>
                <div className="w-full flex flex-col justify-center items-center md:mt-2">
                    <div className="w-full md:max-w-[443px]">
                        <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Username</label>
                        <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                    </div>

                    <div className="w-full md:max-w-[443px] mt-4">
                        <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Email</label>
                        <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                    </div>

                    <div className="w-full md:max-w-[443px] mt-4">
                        <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Password</label>
                        <input className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md"/>
                    </div>
                </div>
                <button className="max-w-45 w-full bg-[#331517] font-neuton-light text-[#D9D9D9] rounded-md mt-4 text-base py-2
                md:max-w-[228px] md:text-xl md:mt-6">
                    Create Account
                </button>
                <div className="flex items-center my-4 w-full md:w-[443px]">
                    <hr className="flex-grow border-[#331517]" />
                    <span className="px-2 text-sm text-[#331517] font-neuton md:text-xl">OR</span>
                    <hr className="flex-grow border-[#331517]" />
                </div>
                <button className="max-w-45 w-full flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md hover:opacity-90
                md:max-w-[228px] md:text-xl">
                    <img src="../src/assets/google.png" alt="Google" className="w-5 h-5 mr-2
                    md:w-7 md:h-6 md:ml-2"/>
                    <span className="text-[#331517] font-neuton text-base md:text-xl"
                    >Sign Up with Google</span>
                </button>
                <button className="font-neuton-light text-sm mt-2
                md:text-lg md:mb-8">Sign in to your account</button>
            </div>
        </div>
    )
}