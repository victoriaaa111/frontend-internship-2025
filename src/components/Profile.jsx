import React, { useState, useEffect } from "react";
import AddBook from "./AddBook.jsx";
import { csrfFetch, initCsrf } from "../csrf.js";
import { useNavigate } from "react-router-dom";

function BookCard({ cover, title, author, status, lender, onDelete, bookId, deleting }) {
  const isInBorrowedCollection = Boolean(lender);

  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  return (
      <div className="relative h-full">
        <div
            className={`w-full h-full bg-[#d9d9d9] rounded-xl p-4 flex flex-col items-center transition ${
                status === "BORROWED" && !isInBorrowedCollection ? "blur-[1.5px]" : ""
            }`}
            style={{ boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.2)" }}
        >
          {!isInBorrowedCollection && bookId && bookId !== null && (
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bookId);
                  }}
                  disabled={deleting}
                  className={`absolute right-2 top-1 text-[#331517] hover:text-red-600 transition-colors z-10 ${
                      deleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Delete book"
              >
                {deleting ? "⟳" : "✕"}
              </button>
          )}

          <img
              src={cover}
              alt={title}
              className="w-full aspect-[3/4] object-cover rounded-md mt-3 mb-3"
          />

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
              className={`absolute right-4 w-5 h-5 ${isOpen ? "transform rotate-180" : ""}`}
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
                    className={`block w-full px-4 py-2 text-center font-neuton-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer ${
                        value === "myCollection" ? "bg-[#331517] text-[#d9d9d9]" : "text-[#331517]"
                    }`}
                >
                  My Collection
                </button>
                <button
                    onClick={() => {
                      onChange("borrowedBooks");
                      setIsOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-center font-neuton-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer ${
                        value === "borrowedBooks" ? "bg-[#331517] text-[#d9d9d9]" : "text-[#331517]"
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
  useEffect(() => {
    initCsrf("http://localhost:8080");
  }, []);

  const navigate = useNavigate();

  const [collectionType, setCollectionType] = useState("myCollection");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showAddBook, setShowAddBook] = useState(false);
  const [flash, setFlash] = useState({ message: "", type: "" });
  const [books, setBooks] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const requestDelete = (userBookId) => {
    if (!userBookId || userBookId === "null") {
      setFlash({ message: "Cannot delete book: Invalid book ID", type: "error" });
      setTimeout(() => setFlash({ message: "", type: "" }), 3000);
      return;
    }
    setConfirmDeleteId(userBookId);
  };

  const confirmDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    await handleDelete(id);
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const url =
          collectionType === "myCollection"
              ? "http://localhost:8080/api/book"
              : "http://localhost:8080/api/book/borrowed";

      const response = await csrfFetch(url);
      if (response.__unauthorized) return;
      if (!response.ok) throw new Error("Failed to fetch books");

      const data = await response.json();

      const mapped = data.map((b, index) => ({
        key: b.userBookId ?? `temp-${index}`,
        userBookId: b.userBookId ?? null,
        cover: b.imageLink,
        title: b.title,
        author: Array.isArray(b.authors) ? b.authors.join(", ") : b.authors,
        status: b.status ?? "AVAILABLE",
        lender: collectionType === "borrowedBooks" ? b.lender?.username : null,
      }));

      setBooks(mapped);
    } catch (error) {
      console.error("Error fetching books:", error);
      setFlash({
        message: "Failed to load books",
        type: "error",
      });
      setTimeout(() => setFlash({ message: "", type: "" }), 3000);
      if (collectionType === "borrowedBooks") {
        setBooks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [collectionType]);

  const handleAdded = async (created) => {
    setFlash({
      message: `Book "${created.title}" added successfully.`,
      type: "success",
    });
    setTimeout(() => setFlash({ message: "", type: "" }), 3500);
    setShowAddBook(false);
    await fetchBooks();
  };

  const handleDelete = async (userBookId) => {
    if (deleting) return;

    try {
      if (!userBookId || userBookId === "null") {
        console.error("Invalid book ID for deletion");
        setFlash({
          message: "Cannot delete book: Invalid book ID",
          type: "error",
        });
        setTimeout(() => setFlash({ message: "", type: "" }), 3000);
        return;
      }

      setDeleting(true);

      const bookToDelete = books.find((b) => b.userBookId === userBookId);

      const res = await csrfFetch(`http://localhost:8080/api/book/${userBookId}`, {
        method: "DELETE",
      });

      if (res.__unauthorized) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to delete book");
      }

      setBooks((prev) => prev.filter((b) => b.userBookId !== userBookId));

      // Set success message
      setFlash({
        message: `Deleted "${bookToDelete?.title || "Book"}" successfully.`,
        type: "success",
      });

      // Clear flash message after delay
      setTimeout(() => setFlash({ message: "", type: "" }), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setFlash({
        message: `Delete failed: ${err.message}`,
        type: "error",
      });
      setTimeout(() => setFlash({ message: "", type: "" }), 3500);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await csrfFetch("http://localhost:8080/api/user/me");

        if (response.__unauthorized) {
          navigate("/login");
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

        {/* Flash Message */}
        {flash.message && (
            <div className="flex justify-center mt-3 mb-2">
              <div
                  className={`border rounded-lg px-4 py-2 font-neuton inline-block ${
                      flash.type === "error"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-green-100 text-green-800 border-green-300"
                  }`}
              >
                {flash.message}
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
              @{username || "Loading..."}
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
          <button
              onClick={() => setShowAddBook(true)}
              className="bg-[#d9d9d9] px-5 py-2 rounded-full shadow-md hover:shadow-lg transition font-neuton-light text-[#331517] text-lg md:text-xl lg:text-2xl ml-auto mr-7"
          >
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
                      onDelete={requestDelete}
                      deleting={deleting}
                  />
              ))}
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 backdrop-blur-sm bg-black/30" onClick={cancelDelete} />
              <div className="relative z-50 bg-[#D9D9D9] p-6 rounded-xl shadow-xl w-[90%] max-w-[380px]">
                <h3 className="font-neuton text-xl text-[#331517] mb-3">Delete book?</h3>
                <p className="font-neuton text-[#331517] mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                      onClick={cancelDelete}
                      className="px-4 py-2 rounded-full bg-[#d9d9d9] outline outline-1 outline-[#331517] text-[#331517] hover:bg-[#e6e6e6] transition"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 rounded-full bg-[#331517] text-[#d9d9d9] hover:opacity-90 transition disabled:opacity-50"
                      disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
