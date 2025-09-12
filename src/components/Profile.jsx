import React, { useState, useEffect } from "react";
import AddBook from "./AddBook.jsx";
import {csrfFetch, initCsrf} from '../csrf.js';
import {useNavigate} from "react-router-dom";

// Update the BookCard component's outer div className
function BookCard({ cover, title, author, status, lender, onDelete, bookId}) {
  const isInBorrowedCollection = Boolean(lender);

  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  return (
      <div className="relative">
        <div
            className={`w-full aspect-[3/5] bg-[#d9d9d9] rounded-xl p-4 flex flex-col items-center transition ${
                status === "BORROWED" && !isInBorrowedCollection ? "blur-[1.5px]" : ""
            }`}
            style={{ boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.2)" }}
        >
          {/* Delete button - only show for own collection */}
          {!isInBorrowedCollection && (
              <button
                  onClick={()=>onDelete(bookId)}
                  className="absolute right-2 top-1 text-[#331517] hover:text-red-600 transition-colors z-0"
                  aria-label="Delete book"
              >
                ✕
              </button>
          )}

          <img
              src={cover}
              alt={title}
              className="w-full aspect-[3/4] object-cover rounded-md mt-3 mb-3"
          />

          {/* Book details container */}
          <div className="w-full flex flex-col items-center mt-2">
            <p className="font-cotta text-sm md:text-base lg:text-lg text-[#331517] text-center truncate w-full">
              {title}
            </p>
            <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full">
              {author}
            </p>
            {isInBorrowedCollection ? (
                <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full mt-1">
                  owned by @{lender}
                </p>
            ) : (
                <span
                    className={`mt-1 px-2 py-0.5 rounded-full text-xs md:text-sm lg:text-base font-neuton ${
                        status === "AVAILABLE"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                    }`}
                >
                  {formatStatus(status)}
                </span>
            )}
          </div>
        </div>
      </div>
  );
}
const CustomDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex w-48 sm:w-56 md:w-64 lg:w-72 justify-center items-center rounded-2xl bg-[#d9d9d9] px-5 py-2 font-neuton-light text-lg md:text-xl lg:text-2xl text-[#331517] shadow-md hover:shadow-lg hover:bg-[#331517] hover:text-[#d9d9d9] transition cursor-pointer"
      >
        <svg
          className={`absolute right-4 w-5 h-5 ${
            isOpen ? "transform rotate-180" : ""
          }`}
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
        <span className="mx-auto">
          {value === "myCollection" ? "My Collection" : "Borrowed Books"}
        </span>
      </button>

      {isOpen && (

        <div className="absolute left-0 mt-2 w-48 sm:w-56 md:w-64 lg:w-72 rounded-2xl bg-[#d9d9d9] shadow-md focus:outline-none z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onChange("myCollection");
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-center font-neuton-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer
                ${
                  value === "myCollection"
                    ? "bg-[#331517] text-[#d9d9d9]"
                    : "text-[#331517]"
                }`}
            >
              My Collection
            </button>
            <button
              onClick={() => {
                onChange("borrowedBooks");
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-center font-neuton-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer
                ${
                  value === "borrowedBooks"
                    ? "bg-[#331517] text-[#d9d9d9]"
                    : "text-[#331517]"
                }`}
            >
              Borrowed Books
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default function ProfilePage() {
  useEffect(() => { initCsrf("http://localhost:8080"); }, []);

  const navigate = useNavigate();

  const [collectionType, setCollectionType] = useState("myCollection");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showAddBook, setShowAddBook] = useState(false);
  const [flash, setFlash] = useState("");
  const [books, setBooks] = useState([]);

  // Separate the fetchBooks function so it can be reused
  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Different endpoints for different collection types
      const url = collectionType === "myCollection" 
        ? "http://localhost:8080/api/book"
        : "http://localhost:8080/api/book/borrowed"; // Dummy endpoint for borrowed books

      const response = await csrfFetch(url);

      if (response.__unauthorized) {
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch books");

      const data = await response.json();

      const mapped = data.map((b) => ({
        key: b.userBookId,
        userBookId: b.userBookId,
        cover: b.imageLink,
        title: b.title,
        author: Array.isArray(b.authors) ? b.authors.join(", ") : b.authors,
        status: b.status || "AVAILABLE",  
        lender: collectionType === "borrowedBooks" ? b.lender?.username : null,
      }));

      setBooks(mapped);
    } catch (error) {
      console.error("Error fetching books:", error);
      if (collectionType === "borrowedBooks") {
        setBooks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount and collection type change
  useEffect(() => {
    fetchBooks();
  }, [collectionType]);

  // Update handleAdded to fetch books instead of managing state locally
  const handleAdded = async (created) => {
    // Show success message
    setFlash(`Book "${created.title}" added successfully.`);
    setTimeout(() => setFlash(""), 3500);

    // Close the add book modal
    setShowAddBook(false);

    // Fetch updated book list
    await fetchBooks();
  };

  const handleDelete = async (userBookId) => {
    try {
      const res = await csrfFetch(`http://localhost:8080/api/book/${userBookId}`, {
        method: "DELETE",
      });

      if (res.__unauthorized) { navigate("/login"); return; }
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to delete book");
      }

      // Remove from UI and show flash
      setBooks((prev) => {
        const removed = prev.find((b) => b.userBookId === userBookId);
        const next = prev.filter((b) => b.userBookId !== userBookId);
        setFlash(`Deleted “${removed?.title || "Book"}” successfully.`);
        setTimeout(() => setFlash(""), 3000);
        return next;
      });
    } catch (err) {
      setFlash(`Delete failed: ${err.message}`);
      setTimeout(() => setFlash(""), 3500);
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await csrfFetch("http://localhost:8080/api/user/me");

        if (response.__unauthorized) {
          // Handle unauthorized access - maybe redirect to login
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUsername(userData.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);


  return (
    <div className="min-h-screen bg-[#d9d1c0] mx-auto relative font-sans overflow-y-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <img
          src="src/assets/BB-Profile.png"
          alt="logo"
          className="w-12 h-12 object-contain md:w-15 md:h-15 lg:w-20 lg:h-20"
        />

        {/* Navigation */}
        <div className="flex space-x-4 text-[#331517] text-xl md:text-2xl lg:text-2xl font-neuton-light pr-10">
          <button className="hover:underline cursor-pointer">Home</button>
          <button className="underline cursor-pointer">Profile</button>
        </div>
      </div>

      {/* Success banner */}
      {flash && (
          <div className="flex justify-center mt-3 mb-2">
            <div className="bg-green-100 text-green-800 border border-green-300 rounded-lg px-4 py-2 font-neuton inline-block">
            {flash}
          </div>
          </div>
      )}

      {/* Profile Section */}
      <div className="flex justify-between items-center px-6 mt-8 flex-wrap gap-4 ml-7">
        {/* Username + Friends */}
        <div
          className="rounded-lg px-4 py-3 bg-[#d9d9d9] text-center outline-1 outline outline-[#331517] shadow-md"
          style={{ boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <p className="font-neuton text-base md:text-lg lg:text-xl text-[#331517]">
            @{username || "Loading..."} {/* Display username or loading state */}
          </p>
          <p className="font-neuton text-sm md:text-base lg:text-lg text-[#b57e25]">
            1111 friends
          </p>
        </div>

        {/* Collection Dropdown */}
        <div className="relative flex-1 flex justify-center">
          <CustomDropdown value={collectionType} onChange={setCollectionType} />
        </div>

        {/* Add Book Button - Responsive text sizing */}
        <button onClick={()=>setShowAddBook(true)} className="bg-[#d9d9d9] px-5 py-2 rounded-full shadow-md hover:shadow-lg transition font-neuton-light text-[#331517] text-lg md:text-xl lg:text-2xl ml-auto mr-7">

          + Add Book
        </button>
        {showAddBook && <AddBook onClose={() => setShowAddBook(false)} onAdded={handleAdded} />}
      </div>


      {loading ? (
          <div className="flex justify-center items-center mt-20">
            <div className="animate-spin h-6 w-6 border-2 border-[#331517] border-t-transparent rounded-full"></div>
          </div>
      ) : books.length === 0 ? (
          <div className="flex justify-center items-center mt-20">
            <p className="text-[#331517] font-neuton text-xl">No books found</p>
          </div>
      ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-5 mt-6 w-full">
            {books.map((book, index) => (
                <BookCard
                    key={book.userBookId ? `${collectionType}-${book.userBookId}` : `${collectionType}-${index}`}
                    cover={book.cover}
                    title={book.title}
                    author={book.author}
                    status={book.status}
                    lender={book.lender}
                    bookId={book.userBookId}
                    onDelete={handleDelete}
                />
            ))}
          </div>
      )}
    </div>
  );
}
