import {useState, useRef, useEffect} from 'react';
const GOOGLE_SEARCH_URL = "http://localhost:8080/api/book/search/google?q=";
import {csrfFetch, initCsrf} from '../csrf.js';

export default function AddBook({ onClose }) {
    useEffect(() => {
        initCsrf("http://localhost:8080");
    }, []);

    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Available');
    const [open, setOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) {
            setError('Please select a book from the search results');
            return;
        }
        // Add your submit logic here
    };

    const handleSearch = async () => {
        if (!title.trim()) return;

        try {
            const response = await csrfFetch(`${GOOGLE_SEARCH_URL}${encodeURIComponent(title)}`);
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (err) {
            setError('Failed to search books');
            setShowResults(false);
        }
    };

    const selectBook = (book) => {
        setSelectedBook(book);
        setTitle(book.title);
        setShowResults(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30" onClick={onClose} />
            <div ref={modalRef} className="relative z-50 bg-[#D9D9D9] p-8 rounded-lg shadow-xl w-[90%] max-w-[400px]">
                <button onClick={onClose} className="absolute right-4 top-4 text-[#331517] hover:text-[#331517]/70" aria-label="Close">✕</button>
                <h3 className="text-center text-2xl font-cotta text-[#331517] mb-4">Add New Book</h3>

                {error && (
                    <p className="text-red-600 bg-red-100 border border-red-300 rounded px-2 py-1 mb-3 font-neuton">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 pr-12 font-neuton text-[#331517] h-12 border border-[#331517] rounded-md focus:outline-none focus:ring-2 focus:ring-[#331517]/50"
                            placeholder="Enter book title"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#331517] hover:text-[#331517]/70"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        {showResults && searchResults.length > 0 && (
                            <ul className="absolute w-full bg-[#D9D9D9] border border-[#331517] rounded-md mt-1 max-h-60 overflow-y-auto z-50">
                                {searchResults.map((book) => (
                                    <li
                                        key={book.googleBookId}
                                        onClick={() => selectBook(book)}
                                        className="flex items-center gap-3 p-2 hover:bg-[#331517] hover:text-[#D9D9D9] cursor-pointer"
                                    >
                                        <img
                                            src={book.imageLink}
                                            alt={book.title}
                                            className="h-12 w-8 object-cover"
                                        />
                                        <div>
                                            <p className="font-neuton">{book.title}</p>
                                            <p className="text-sm font-neuton-light">
                                                {book.author ? book.author.join(', ') : 'Unknown Author'}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
