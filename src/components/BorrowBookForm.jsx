import React, {useState} from "react";
import {csrfFetch} from "../csrf.js";
import {useNavigate} from "react-router-dom";

export default function BorrowBookForm({onClose, bookTitle, bookOwner, bookId, styleClasses}) {
    const sanitizeInput = (value) => {
        return value
            .replace(/^\s+|\s+$/, '') // Remove the 'g' flag
            .replace(/[<>]/g, '')
            .substring(0, 128);
    };
    const [showBorrowForm, setShowBorrowForm] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        meetingDate: "",
        meetingTime: "",
        location: "",
        dueDate: ""
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");




    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const sanitizedLocation = sanitizeInput(formData.location);

        if (formData.location.length < 3) {
            setError("Location must be at least 3 characters long");
            setLoading(false);
            return;
        }
        if (formData.location.length >128) {
            setError("Location must be at most 128 characters long");
            setLoading(false);
            return;
        }

        try{
            const meetingDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}`);

            const requestData = {
                meetingTime: meetingDateTime.toISOString(),
                location: sanitizedLocation,
                dueDate: formData.dueDate,
            }

            const response = await csrfFetch(`http://localhost:8080/api/borrow/request/${bookId}`,{
                method: 'POST',
                body: JSON.stringify(requestData)
            })

            if(!response.ok){
                throw new Error("Failed to send borrow request");
            }
            onClose(true)
            setShowBorrowForm(false)
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        let sanitizedValue = e.target.value;

        if (e.target.name === 'location') {
            // Only remove dangerous characters during typing, preserve spaces
            sanitizedValue = e.target.value
                .replace(/[<>]/g, '')
                .substring(0, 128);
        }
        setFormData({
            ...formData,
            [e.target.name]: sanitizedValue
        });
    }

    const today = new Date().toISOString().split('T')[0];
    let tomorrow = new Date();
    if (formData.meetingDate) {
        const meetingDate = new Date(formData.meetingDate);
        tomorrow = new Date(meetingDate);
        tomorrow.setDate(meetingDate.getDate() + 1);
    } else {
        tomorrow.setDate(tomorrow.getDate() + 1);
    }
    tomorrow = tomorrow.toISOString().split('T')[0];

    return(
        <>
        <button className={styleClasses}
                onClick={() => {
                    setShowBorrowForm(true);
                }}
        >
            Borrow Book
        </button>
    {showBorrowForm &&(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30" onClick={() =>{
                onClose(false)
                setShowBorrowForm(false);}} />
            <div className="relative z-50 bg-[#EEE8DF] p-6 rounded-xl shadow-xl w-[90%] max-w-[400px]">
                <h3 className="font-cotta text-xl text-[#4B3935] mb-1">Borrow Book Request</h3>
                <p className="font-fraunces-light text-[#4B3935] mb-4 text-sm">Request to borrow "{bookTitle}" from
                    {'\u00A0'}
                    <button onClick={()=>{
                        navigate(`/user/${bookOwner}`);
                        onClose(false)
                        setShowBorrowForm(false);
                    }
                    }>
                        <span className="text-[#2C365A] underline decoration-[#9C8F7F]/40 underline-offset-2">@{bookOwner}</span>
                    </button></p>

                {error && (
                    <div className="text-center bg-red-50 text-red-700 p-3 rounded-lg font-fraunces-light mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-fraunces text-[#4B3935] mb-1">Meeting Date</label>
                        <input
                            type="date"
                            name="meetingDate"
                            value={formData.meetingDate}
                            onChange={handleChange}
                            min={today}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg font-fraunces-light text-[#4B3935] bg-[#F6F2ED] focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                        />
                    </div>

                    <div>
                        <label className="block font-fraunces text-[#4B3935] mb-1">Meeting Time</label>
                        <input
                            type="time"
                            name="meetingTime"
                            value={formData.meetingTime}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg font-fraunces-light text-[#4B3935] bg-[#F6F2ED] focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                        />
                    </div>

                    <div>
                        <label className="block font-fraunces text-[#4B3935] mb-1">Meeting Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Campus Library, Coffee Shop..."
                            required
                            minLength="3"
                            maxLength="128"
                            className="w-full p-2 border border-gray-300 rounded-lg font-fraunces-light text-[#4B3935] bg-[#F6F2ED] focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                        />
                    </div>

                    <div>
                        <label className="block font-fraunces text-[#4B3935] mb-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            min={tomorrow}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg font-fraunces-light text-[#4B3935] bg-[#F6F2ED] focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                onClose(false)
                                setShowBorrowForm(false);
                            }}
                            disabled={loading}
                            className="font-fraunces px-4 py-2 rounded-lg bg-[#F6F2ED] outline outline-[#4B3935] text-[#4B3935] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !formData.meetingDate || !formData.meetingTime || !formData.location}
                            className="font-fraunces-light px-4 py-2 rounded-lg bg-[#4B3935] text-[#F6F2ED] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
    }
        </>

    )
}