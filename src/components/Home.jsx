import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { csrfFetch } from '../csrf';

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
const BookResult = ({ book, onAddBook, onBorrowBook }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isBorrowing, setIsBorrowing] = useState(false);

    // Check if this is a user book (from user search) or Google book
    const isUserBook = book.hasOwnProperty('userBookId');

    const handleAddBook = async () => {
        setIsAdding(true);
        await onAddBook(book);
        setIsAdding(false);
    };

    const handleBorrowBook = async () => {
        setIsBorrowing(true);
        await onBorrowBook(book);
        setIsBorrowing(false);
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
                {isUserBook && (
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
                )}

                <div className="flex gap-2">
                    {isUserBook ? (
                        // For user books, show borrow button if available
                        book.status === 'AVAILABLE' && (
                            <button
                                onClick={handleBorrowBook}
                                disabled={isBorrowing}
                                className="bg-[#2C365A] text-[#EEE8DF] px-4 py-2 rounded-full text-sm font-fraunces-light hover:shadow-[0_2px_3px_#9C8F7F] transition cursor-pointer disabled:opacity-50"
                            >
                                {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
                            </button>
                        )
                    ) : (
                        // For Google books, show add to collection button
                        <button
                            onClick={handleAddBook}
                            disabled={isAdding}
                            className="bg-[#4B3935] text-[#EEE8DF] px-4 py-2 rounded-full text-sm font-fraunces-light hover:shadow-[0_2px_3px_#9C8F7F] transition cursor-pointer disabled:opacity-50"
                        >
                            {isAdding ? 'Adding...' : 'Add to Collection'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Request Modal Component
const RequestModal = ({ request, isOpen, onClose, onAccept, onReject }) => {
    if (!isOpen || !request) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatRequestDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' at ' + new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            {/* Blur overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div 
                    className="bg-[#EEE8DF] rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <h2 className="text-xl font-fraunces text-[#4B3935] text-center mb-2">
                            Borrow Request
                        </h2>
                        <div className="text-center">
                            <span className="font-fraunces text-[#2C365A]">@{request.username}</span>
                            <span className="font-fraunces-light text-[#2C365A]"> wants to borrow</span>
                        </div>
                        <p className="font-fraunces text-[#4B3935] text-center mt-1 text-lg">
                            "{request.bookTitle}"
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        <div className="space-y-4">
                            {/* Meeting Details */}
                            <div className="bg-white bg-opacity-50 rounded-xl p-4">
                                <h3 className="font-fraunces text-[#4B3935] mb-3 text-center">Meeting Details</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Meeting Date</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatDate(request.meetingDate)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Meeting Time</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatTime(request.meetingTime)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Location</div>
                                            <div className="font-fraunces text-[#4B3935]">{request.location}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414l2.293-2.293V14a1 1 0 102 0V8a1 1 0 00-.293-.707z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Due Date</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatDate(request.dueDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Info */}
                            <div className="text-center">
                                <div className="font-fraunces-light text-[#2C365A] text-sm">
                                    Requested on {formatRequestDate(request.requestedAt)}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => onReject(request.id)}
                                className="flex items-center justify-center w-12 h-12 bg-red-100 hover:bg-red-200 rounded-full transition cursor-pointer"
                                title="Reject request"
                            >
                                <img
                                    src="src/assets/cross.png"
                                    alt="Reject"
                                    className="w-6 h-6"
                                />
                            </button>
                            
                            <button
                                onClick={() => onAccept(request.id)}
                                className="flex items-center justify-center w-12 h-12 bg-green-100 hover:bg-green-200 rounded-full transition cursor-pointer"
                                title="Accept request"
                            >
                                <img
                                    src="src/assets/tick.png"
                                    alt="Accept"
                                    className="w-6 h-6"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function Home() {
    const [searchType, setSearchType] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [flash, setFlash] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    // Fetch incoming borrow requests
const fetchNotifications = async (page = 1, size = 3) => {
    setIsLoadingNotifications(true);
    try {
        const response = await csrfFetch(
            `http://localhost:8080/api/borrow/incoming?page=${page}&size=${size}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();

        // Transform the API response to match our component structure
        const transformedNotifications = (data.items || [])
            .filter(item => item.status === 'PENDING')
            .map(item => ({
                id: item.id,
                type: 'borrow_request',
                username: item.borrowerUsername,
                bookTitle: item.bookTitle,
                meetingDate: item.meetingTime.split('T')[0], // date only
                meetingTime: item.meetingTime.split('T')[1].substring(0, 5), // HH:MM
                location: item.location,
                dueDate: item.dueDate,
                requestedAt: item.createdAt
            }));

        setNotifications(transformedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    } finally {
        setIsLoadingNotifications(false);
    }
};


    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
    }, []);

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

    const handleAddBookToCollection = async (book) => {
        try {
            // This would be for adding Google Books API results to collection
            // (Not currently used since we're searching user books, but keeping for future use)
            const response = await csrfFetch('http://localhost:8080/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    googleBookId: book.googleBookId,
                    title: book.title,
                    authors: book.authors,
                    publisher: book.publisher,
                    imageLink: book.imageLink
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add book');
            }

            setFlash({
                message: `"${book.title}" added to your collection!`,
                type: 'success'
            });
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);

        } catch (error) {
            console.error('Error adding book:', error);
            setFlash({
                message: 'Failed to add book to collection',
                type: 'error'
            });
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    const handleNotificationClick = (notification) => {
        setSelectedRequest(notification);
        setIsModalOpen(true);
        setIsInboxOpen(false); // Close the dropdown when opening modal
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await csrfFetch(`http://localhost:8080/api/borrow/accept/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to accept request');
            }

            setFlash({
                message: 'Request accepted successfully!',
                type: 'success'
            });
            
            // Remove the accepted request from notifications
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
            handleCloseModal();
        } catch (error) {
            console.error('Error accepting request:', error);
            setFlash({
                message: 'Failed to accept request',
                type: 'error'
            });
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await csrfFetch(`http://localhost:8080/api/borrow/reject/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            setFlash({
                message: 'Request rejected successfully!',
                type: 'success'
            });
            
            // Remove the rejected request from notifications
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
            handleCloseModal();
        } catch (error) {
            console.error('Error rejecting request:', error);
            setFlash({
                message: 'Failed to reject request',
                type: 'error'
            });
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    const handleBorrowBook = async (book) => {
        try {
            const response = await csrfFetch(`http://localhost:8080/api/borrow/request/${book.userBookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to borrow book');
            }

            setFlash({
                message: `"${book.title}" borrowed successfully!`,
                type: 'success'
            });
            
            // Update the book status in search results
            setSearchResults(prev => prev.map(b => 
                b.userBookId === book.userBookId 
                    ? { ...b, status: 'BORROWED' }
                    : b
            ));
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);

        } catch (error) {
            console.error('Error borrowing book:', error);
            setFlash({
                message: 'Failed to borrow book',
                type: 'error'
            });
            
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F2ED] mx-auto relative font-sans overflow-y-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 py-2">
                {/* Logo */}
                <img
                    src="src/assets/BB-blue1.png"
                    alt="logo"
                    className="w-12 h-12 object-contain md:w-16 md:h-16 lg:w-18 lg:h-18"
                />

                {/* Navigation */}
                <div className="flex space-x-4 text-[#4B3935] text-md md:text-lg lg:text-xl font-fraunces-light pr-4 sm:pr-8 lg:pr-10 relative">
                    {/* Inbox */}
                    <div className="relative">
                        <button
                            onClick={() => setIsInboxOpen(!isInboxOpen)}
                            className="relative focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="text-[#4B3935] font-fraunces-light text-md md:text-lg lg:text-xl">
                                Inbox
                            </span>
                            {notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-lg px-1.5">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Dropdown for notifications */}
                        {isInboxOpen && (
                        <div
                            className="
                            absolute right-0 mt-2 
                            w-64 sm:w-72 md:w-80 lg:w-96 
                            bg-[#EEE8DF] rounded-xl shadow-lg z-50 
                            max-h-80 sm:max-h-96 
                            overflow-y-auto
                        "
                        >
                            <div className="py-2">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm md:text-base text-[#2C365A] font-fraunces-light text-center">
                                No new requests
                            </div>
                        ) : (
                            notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="px-4 py-3 border-b border-[#ccc] last:border-none cursor-pointer hover:bg-[#ddd8cf] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm md:text-base text-[#2C365A] font-fraunces-light mb-2">
                                            <span className="font-fraunces text-[#4B3935]">
                                            @{notification.username}
                                </span>{" "}
                                requests to borrow
                                </p>
                                <p className="text-sm font-fraunces text-[#4B3935] truncate">
                                "{notification.bookTitle}"
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                               e.stopPropagation();
                                handleAcceptRequest(notification.id);
                      }}
                                className="p-1.5 hover:bg-green-100 rounded-lg transition cursor-pointer"
                                title="Accept request"
                    >
                      <img
                        src="src/assets/tick.png"
                        alt="Accept"
                        className="w-5 h-5"
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectRequest(notification.id);
                      }}
                      className="p-1.5 hover:bg-red-200 rounded-lg transition cursor-pointer"
                      title="Reject request"
                    >
                      <img
                        src="src/assets/cross.png"
                        alt="Reject"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

                    </div>

                    {/* Links */}
                    <Link to="/home" className="underline cursor-pointer hover:opacity-80 transition-opacity">
                        Home
                    </Link>
                    <Link to="/profile" className="hover:underline cursor-pointer hover:opacity-80 transition-opacity">
                        Profile
                    </Link>
                </div>
            </div>

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
                                onAddBook={handleAddBookToCollection}
                                onBorrowBook={handleBorrowBook}
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

            {/* Request Modal */}
            <RequestModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
        </div>
    );
}