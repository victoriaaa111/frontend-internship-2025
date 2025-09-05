import InfoImage from '../assets/frontend.png';
import {useState} from "react";

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(
            {...formData, [e.target.name]: e.target.value}
        )
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if(!response.ok){
                switch (response.status) {
                    case 400:
                        throw new Error('Please check your information and try again');
                    case 409:
                        throw new Error('This email or username is already taken');
                    case 500:
                        throw new Error('Something went wrong on our end. Please try again later');
                    default:
                        throw new Error('Unable to create account. Please try again');
                }
            }

            console.log('Signup successful');
        }catch(err){
            setError(err.message);
        }
    }

    return (
        <div className="bg-[#D9D1C0] min-h-screen flex flex-col justify-center items-center lg:flex-row">
            {/*LEFT SIDE WITH IMAGE */}
            <div
                className="min-h-screen hidden lg:flex w-1/2 bg-cover bg-center flex-col justify-center h-full p-12"
                style={{ backgroundImage: `url(${InfoImage})` }}
            >
                <h2 className="text-5xl font-erotique-bold text-[#D9D1C0] mb-4 border-b border-[#D9D1C0] pb-2 drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]">
                    Share Your Library
                </h2>
                <p className="text-3xl font-cotta text-[#D9D1C0] max-w-[700px] drop-shadow-[0_4px_3px_rgba(51,21,23,0.4)]" >
                    Save money, reduce clutter, and give your books new journeys through your community.
                </p>
            </div>

            {/*RIGHT SIDE WITH FORM */}
            <div className=" w-full flex flex-col items-center gap-6 px-2 lg:w-1/2  text-[#B57E25]">
                <h1 className="font-erotique-bold text-4xl mx-2
            md:text-6xl
            ">BorrowBook</h1>
                <form onSubmit={handleSubmit} className="bg-[#D9D9D9] rounded-lg shadow-md w-[90%] max-w-[298px] border border-[#331517] flex flex-col justify-center items-center px-5 py-6
            md:max-w-[616px] md:w-[80%]
             ">
                    {error && <p className="text-red-500 text-base mb-4 font-neuton bg-red-100 px-2 py-1 rounded-md drop-shadow-md
                 ">{error}</p>}
                    <h2 className="text-2xl font-cotta text-[#331517] mb-4
                md:text-3xl md:mt-3
                ">Create Account</h2>
                    <div className="w-full flex flex-col justify-center items-center md:mt-2">
                        <div className="w-full md:max-w-[443px]">
                            <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Username</label>
                            <input required name="username" value={formData.username} onChange={handleChange} className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md
                            lg:text-lg"/>
                        </div>

                        <div className="w-full md:max-w-[443px] mt-4">
                            <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md
                            lg:text-lg"/>
                        </div>

                        <div className="w-full md:max-w-[443px] mt-4">
                            <label className="font-neuton-light text-[#331517] text-base
                        md:text-xl
                        ">Password</label>
                            <input type="password" required name="password" value={formData.password} onChange={handleChange} className="px-2 text-base font-neuton text-[#331517] w-full h-10 border border-[#331517] rounded-md
                            lg:text-lg"/>
                        </div>
                    </div>
                    <button type="submit" className="hover:bg-[#D9D9D9] hover:text-[#331517] border border-[#331517] max-w-45 w-full bg-[#331517] font-neuton-light text-[#D9D9D9] rounded-md mt-4 text-base py-2
                md:max-w-[228px] md:text-xl md:mt-6 cursor-pointer">
                        Create Account
                    </button>
                    <div className="flex items-center my-4 w-full md:w-[443px] lg:w-[350px]">
                        <hr className="flex-grow border-[#331517]" />
                        <span className="px-2 text-sm text-[#331517] font-neuton md:text-xl">OR</span>
                        <hr className="flex-grow border-[#331517]" />
                    </div>
                    <button className="hover:bg-[#D9D9D9] max-w-45 w-full flex items-center justify-center border border-[#331517] bg-[#D9D1C0] py-2 rounded-md hover:opacity-90
                md:max-w-[228px] md:text-xl cursor-pointer">
                        <img src="../src/assets/google.png" alt="Google" className="w-5 h-5 mr-2
                    md:w-7 md:h-6 md:ml-2"/>
                        <span className="text-[#331517] font-neuton text-base md:text-xl "
                        >Sign Up with Google</span>
                    </button>
                    <button className="font-neuton-light text-sm mt-2
                md:text-lg md:mb-8 cursor-pointer hover:text-[#331517]">Sign in to your account</button>
                </form>
            </div>

        </div>
    )
}