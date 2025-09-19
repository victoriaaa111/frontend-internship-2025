import React, {useState, useCallback} from 'react';
import { csrfFetch } from '../csrf';
import BorrowBookForm from "./BorrowBookForm.jsx";
import Menu from "./Menu.jsx";

const CustomDropdown = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getCurrentLabel = () => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : 'Select';
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex justify-center items-center 
                           bg-[#EEE8DF] px-4 py-2 font-fraunces-light text-sm md:text-base 
                           text-[#4B3935] cursor-pointer min-w-[100px] rounded-l-2xl 
                           shadow-[0_2px_3px_#9C8F7F] hover:shadow-[0_4px_4px_#9C8F7F] 
                           transition outline-none border-none"
            >
                <span className="pr-5">{getCurrentLabel()}</span>
                <svg
                    className={`absolute right-2 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 w-40 rounded-2xl bg-[#EEE8DF] shadow-md z-50 overflow-hidden">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-left font-fraunces-light text-sm md:text-base transition cursor-pointer 
                                        ${value === option.value 
                                            ? "bg-[#2C365A] text-[#EEE8DF]" 
                                            : "text-[#4B3935] hover:bg-[#2C365A] hover:text-[#EEE8DF]"}`
                            }
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Book Result Component
const BookResult = ({ book, onBorrowSuccess}) => {

    const handleBorrowFormClose = (success) => {

        if (success && onBorrowSuccess) {
            onBorrowSuccess(book.title);
        }
    };


    return (
        <div className="bg-[#EEE8DF] rounded-xl p-4 shadow-[0_2px_3px_#9C8F7F] flex gap-4">
            <img
                src={book.imageLink || '/placeholder-book.png'}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-fraunces text-lg text-[#4B3935] truncate">
                    {book.title}
                </h3>
                <p className="font-fraunces-light text-sm text-[#2C365A] mb-2">
                    by {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors || 'Unknown Author'}
                </p>
                {book.publisher && (
                    <p className="font-fraunces-light text-xs text-[#2C365A] mb-2">
                        Publisher: {book.publisher}
                    </p>
                )}
                
                {/* Show status and owner info for user books */}
                    <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-fraunces-light mr-2 ${
                            book.status === 'AVAILABLE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {book.status}
                        </span>
                        <span className="text-xs text-[#2C365A] font-fraunces-light">
                            Owned by @{book.username}
                        </span>
                    </div>


                <div className="flex gap-2">
                    {book.status === 'AVAILABLE' && (
                            <BorrowBookForm
                                onClose={handleBorrowFormClose}
                                bookTitle={book.title}
                                bookOwner={book.username}
                                bookId={book.userBookId}
                                styleClasses={"bg-[#2C365A] text-[#EEE8DF] px-4 py-2 rounded-full text-sm font-fraunces-light hover:shadow-[0_2px_3px_#9C8F7F] transition cursor-pointer disabled:opacity-50"}
                            />
                        )}
                </div>
            </div>
        </div>
    );
};



export default function Home() {
    const [searchType, setSearchType] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [flash, setFlash] = useState({ message: '', type: '' });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);




    const searchOptions = [
        { value: 'title', label: 'Title' }
    ];

    const performSearch = async (page = 1) => {
        setIsSearching(true);
        setSearchError('');

        try {
            const response = await csrfFetch(`http://localhost:8080/api/user/search?title=${encodeURIComponent(searchQuery.trim())}&pageIndex=${page}&pageSize=10`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            
            // Filter only available books
            const availableBooks = (data.items || []).filter(book => book.status === 'AVAILABLE');
            setSearchResults(availableBooks);
            setCurrentPage(data.pageIndex || page);
            setTotalPages(data.totalPages || 0);
            setHasSearched(true);
            
            if (availableBooks.length === 0) {
                setSearchError('No available books found for your search');
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Failed to search books. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setSearchError('Please enter a search term');
            return;
        }

        setCurrentPage(1);
        await performSearch(1);
    };

    const handlePageChange = async (page) => {
        if (page >= 1 && page <= totalPages && searchQuery.trim()) {
            await performSearch(page);
        }
    };






    const handleBorrowSuccess = useCallback((bookTitle) => {
        setFlash({ message: `Borrow request sent successfully for ${bookTitle}`, type: "success" });
        setTimeout(() => setFlash({ message: "", type: "" }), 4500);
    },[]);


    return (
        <div className="min-h-screen bg-[#F6F2ED] mx-auto relative font-sans overflow-y-auto">

            <Menu/>
            {/* Flash Message */}
            {flash.message && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4">
                    <div className={`px-4 py-3 rounded-lg text-center shadow-lg ${
                        flash.type === 'error'
                            ? 'bg-red-50 border text-red-700'
                            : 'bg-green-50 text-green-700 border'
                    }`}>
                        <span className="font-fraunces-light text-base">{flash.message}</span>
                    </div>
                </div>
            )}

            {/* App Name */}
            <div className="hidden lg:flex justify-center mt-8 mb-6">
                <h1 className="text-6xl font-erotique font-bold text-[#2c365a]">
                    BorrowBook
                </h1>
            </div>

            {/* Search Section */}
            <div className="flex justify-center px-4 mt-8 lg:mt-4">
                <form onSubmit={handleSearch} className="flex w-full max-w-2xl">
                    {/* Custom Dropdown */}
                    <CustomDropdown
                        value={searchType}
                        onChange={setSearchType}
                        options={searchOptions}
                    />

                    {/* Search Input */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search by ${searchType}...`}
                        className="flex-1 bg-[#EEE8DF] px-4 py-2 text-[#2C365A] font-fraunces-light text-sm md:text-base 
                                   shadow-[0_2px_3px_#9C8F7F] hover:shadow-[0_4px_4px_#9C8F7F] transition 
                                   outline-none border-none"
                        disabled={isSearching}
                    />

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-[#4B3935] text-[#EEE8DF] px-4 py-2 rounded-r-2xl font-fraunces-light text-sm md:text-base 
                                   shadow-[0_2px_3px_#9C8F7F] hover:shadow-[0_4px_4px_#9C8F7F] transition 
                                   outline-none border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Search Error */}
            {searchError && (
                <div className="flex justify-center px-4 mt-4">
                    <div className="bg-red-50 border text-red-700 px-4 py-3 rounded-lg text-center">
                        <span className="font-fraunces-light">{searchError}</span>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {isSearching && (
                <div className="flex justify-center items-center mt-8">
                    <div className="animate-spin h-8 w-8 border-2 border-[#4B3935] border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <h2 className="text-2xl font-fraunces text-[#4B3935] mb-6 text-center">
                        Search Results ({searchResults.length} books found)
                    </h2>
                    <div className="space-y-4">
                        {searchResults.map((book, index) => (
                            <BookResult
                                key={book.userBookId || book.googleBookId || index}
                                book={book}
                                onBorrowSuccess={handleBorrowSuccess}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {hasSearched && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 mb-8 px-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isSearching}
                            className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base font-fraunces-light text-[#4B3935] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EEE8DF] rounded transition"
                        >
                            &lt;
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                            const pages = [];
                            const maxVisible = 3; // Show max 3 page numbers on mobile
                            const maxVisibleDesktop = 5; // Show max 5 page numbers on desktop
                            
                            // Determine how many pages to show based on screen size
                            const getMaxVisible = () => window.innerWidth >= 640 ? maxVisibleDesktop : maxVisible;
                            
                            let startPage = Math.max(1, currentPage - Math.floor(getMaxVisible() / 2));
                            let endPage = Math.min(totalPages, startPage + getMaxVisible() - 1);
                            
                            // Adjust startPage if we're near the end
                            if (endPage - startPage + 1 < getMaxVisible()) {
                                startPage = Math.max(1, endPage - getMaxVisible() + 1);
                            }

                            // First page
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => handlePageChange(1)}
                                        disabled={isSearching}
                                        className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base font-fraunces-light text-[#4B3935] hover:bg-[#EEE8DF] rounded transition disabled:cursor-not-allowed"
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(
                                        <span key="start-ellipsis" className="px-1 text-sm sm:text-base text-[#4B3935]">...</span>
                                    );
                                }
                            }

                            // Page range
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        disabled={isSearching}
                                        className={`px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base font-fraunces-light rounded transition disabled:cursor-not-allowed ${
                                            i === currentPage
                                                ? 'bg-[#4B3935] text-[#EEE8DF]'
                                                : 'text-[#4B3935] hover:bg-[#EEE8DF]'
                                        }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            // Last page
                            if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                    pages.push(
                                        <span key="end-ellipsis" className="px-1 text-sm sm:text-base text-[#4B3935]">...</span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={isSearching}
                                        className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base font-fraunces-light text-[#4B3935] hover:bg-[#EEE8DF] rounded transition disabled:cursor-not-allowed"
                                    >
                                        {totalPages}
                                    </button>
                                );
                            }

                            return pages;
                        })()}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isSearching}
                            className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base font-fraunces-light text-[#4B3935] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EEE8DF] rounded transition"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

            {/* Empty space for future content */}
            <div className="flex-1 mt-8 px-4 pb-8"></div>

        </div>
    );
}