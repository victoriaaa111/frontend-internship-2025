import { useState, useRef} from 'react';

export default function AddBook({ onClose }) {
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Available');
    const [open, setOpen] = useState(false);
    const modalRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add book logic here
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/30"
                onClick={onClose}
            />
            {/* Modal */}
            <div
                ref={modalRef}
                className={`relative z-50 bg-[#D9D9D9] p-8 ${open ? 'pb-12' : ''} rounded-lg shadow-xl w-[90%] max-w-[400px]`}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#331517] hover:text-[#331517]/70 transition-colors duration-200"
                    aria-label="Close"
                >
                    ✕
                </button>

                <h3 className="text-center text-2xl font-cotta text-[#331517] mb-4">Add New Book</h3>

                {error && (
                    <p className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 mb-3 font-neuton">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="px-4 font-neuton text-[#331517] h-12 border border-[#331517] rounded-md focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                        placeholder="Enter book title"
                        required
                    />

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpen((o) => !o)}
                            className="mb-1 w-full px-4 font-neuton text-[#331517] h-12 border border-[#331517] rounded-md bg-[#D9D9D9] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                            aria-haspopup="listbox"
                            aria-expanded={open}
                        >
                            <span>{status}</span>
                            <svg
                                className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </button>

                        {open && (
                            <ul
                                role="listbox"
                                className="absolute font-neuton-light left-0 right-0 top-full mt-1 z-[60] bg-[#D9D9D9] border border-[#331517] rounded-md shadow-lg overflow-hidden"
                            >
                                {['Available', 'Borrowed'].map((opt) => (
                                    <li
                                        key={opt}
                                        role="option"
                                        aria-selected={status === opt}
                                        onClick={() => {
                                            setStatus(opt);
                                            setOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer  ${
                                            status === opt ? 'bg-[#331517] text-[#d9d1c0]' : ''
                                        }`}
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="text-lg bg-[#331517] font-neuton text-[#D9D9D9] py-1 rounded-md border border-[#331517] transition-colors duration-200
                        hover:bg-[#D9D9D9] hover:text-[#331517]"
                    >
                        Add Book
                    </button>
                </form>
            </div>
        </div>
    );
}
