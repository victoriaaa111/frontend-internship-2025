import {useState, useRef} from 'react';
import {csrfFetch} from '../csrf.js';
import {useNavigate} from "react-router-dom";
import bookPlaceholder from '../assets/book.png';

const GOOGLE_SEARCH_URL = "http://localhost:8080/api/book/search/google?q=";
const CREATE_BOOK_URL  = "http://localhost:8080/api/book";

export default function AddBook({ onClose, onAdded }) {

    const sanitizeInput = (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '') // Remove < and > characters
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
            .trim();
    };

// Add validation functions
    const validateTitle = (title) => {
        return title &&
            title.length >= 1 &&
            title.length <= 200
    };

    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Available'); // UI value; API expects uppercased
    const [open, setOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);

    const defaultBookImage = bookPlaceholder;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // block while dropdowns/open lists are visible
        if (isLoading || open || showResults) return;

        if (!selectedBook) {
            setError('Please select a book from the search results');
            return;
        }

        const sanitizedTitle = sanitizeInput(title);

        // Validate sanitized input
        if (!validateTitle(sanitizedTitle)) {
            setError('Book title contains invalid characters or is too long');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const payload = {
                googleBookId: sanitizeInput(selectedBook.googleBookId), // from your search API
                status: status.toUpperCase(),            // Swagger expects "AVAILABLE"/"BORROWED"
            };

            const res = await csrfFetch(CREATE_BOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.__unauthorized) {
                navigate('/login');
                return;
            }

            if (!res.ok) {
                const msg = await res.text().catch(()=>'');
                throw new Error(msg || 'Failed to add book');
            }

            const created = await res.json(); // matches the 200 example (userBookId, title, author[], imageLink, etc.)
            // notify parent so it can show success and optionally update UI list
            onAdded?.(created);
            onClose();
        } catch (err) {
            const safeErrorMessage = sanitizeInput(err.message || 'Failed to add book');
            setError(safeErrorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (showResults || open || isLoading)) {
            e.preventDefault();
            if (e.target.type === 'text' && title.trim() && !isLoading) handleSearch();
        }
    };

    const handleImageError = (e) => { e.target.src = defaultBookImage; };

    const processBookData = (book) => ({ ...book, imageLink: book.imageLink || defaultBookImage });

    const handleSearch = async () => {
        if (!title.trim()) return;
        setIsLoading(true);
        setError('');
        setShowResults(false);
        setOpen(false);

        try {
            const response = await csrfFetch(`${GOOGLE_SEARCH_URL}${encodeURIComponent(title)}`);

            if (response.__unauthorized) { navigate('/login'); return; }
            if (!response.ok) {
                if (response.status === 500) throw new Error('Server error occurred. Please try again.');
                throw new Error('Search failed');
            }

            const data = await response.json();
            let results = [];
            if (Array.isArray(data)) results = data.map(processBookData);
            else if (data && typeof data === 'object') results = [processBookData(data)];

            if (results.length === 0) {
                setError('No books found');
                setShowResults(false);
                return;
            }

            if (results.length === 1) {
                const book = results[0];
                setSelectedBook(book);
                setTitle(book.title);
                setShowResults(false);
                setError('');
            } else {
                setSearchResults(results);
                setShowResults(true);
            }
        } catch (error) {
            setError(error.message || 'Failed to search books');
            setShowResults(false);
        } finally {
            setIsLoading(false);
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
            <div ref={modalRef} className={`relative z-50 bg-[#EEE8DF] p-8 ${open ? 'pb-10' : ''} rounded-lg shadow-xl w-[90%] max-w-[400px]`}>
                <button onClick={onClose} className="absolute right-4 top-4 text-[#4B3935] hover:text-[#4B3935]/70" aria-label="Close">✕</button>

                <h3 className="text-center text-2xl font-cotta text-[#4B3935] mb-4">Add New Book</h3>
                {error && (
                    <div className="bg-red-50 border text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-fraunces-light text-base">{error}</span>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={title}
                            maxLength="200"
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 pr-12 font-fraunces text-[#4B3935] h-12 border border-[#4B3935] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50"
                            placeholder="Enter book title"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B3935] hover:text-[#4B3935]/70 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="animate-spin h-6 w-6 border-2 border-[#4B3935] border-t-transparent rounded-full"></div>
                            ) : (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </button>

                        {showResults && searchResults.length > 0 && (
                            <ul className="absolute w-full bg-[#EEE8DF] border border-[#4B3935] rounded-md mt-1 max-h-60 overflow-y-auto z-50">
                                {searchResults.map((book, index) => (
                                    <li
                                        key={book.googleBookId}
                                        onClick={() => selectBook(book)}
                                        className={`flex items-center gap-3 p-2 hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer ${index !== searchResults.length - 1 ? 'border-b border-[#4B3935]/20' : ''}`}
                                    >
                                        <img src={book.imageLink} alt={book.title} className="h-14 w-12 object-cover" onError={handleImageError} />
                                        <div>
                                            <p className="font-fraunces">{book.title}</p>
                                            <p className="text-sm font-fraunces-light">{book.author ? book.author.join(', ') : 'Unknown Author'}</p>
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
                            className="mb-1 w-full px-4 font-fraunces text-[#4B3935] h-12 border border-[#4B3935] rounded-md bg-[#EEE8DF] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4B3935]/50"
                            aria-haspopup="listbox"
                            aria-expanded={open}
                        >
                            <span>{status}</span>
                            <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </button>

                        {open && !showResults && (
                            <ul role="listbox" className="absolute font-fraunces-light left-0 right-0 top-full mt-1 z-[60] bg-[#EEE8DF] border border-[#4B3935] rounded-md shadow-lg overflow-hidden">
                                {['Available', 'Borrowed'].map((opt) => (
                                    <li
                                        key={opt}
                                        role="option"
                                        aria-selected={status === opt}
                                        onClick={() => { setStatus(opt); setOpen(false); }}
                                        className={`px-4 py-2 cursor-pointer ${status === opt ? 'bg-[#4B3935] text-[#EEE8DF]' : ''}`}
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || open || showResults}
                        className="text-lg bg-[#4B3935] font-neuton text-[#EEE8DF] py-1 rounded-md border border-[#4B3935] transition-colors duration-200 hover:shadow-[0_2px_6px_#9C8F7F]  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Book
                    </button>
                </form>
            </div>
        </div>
    );
}
