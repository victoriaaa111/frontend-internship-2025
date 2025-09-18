import React, { useState, useEffect } from "react";
import AddBook from "./AddBook.jsx";
import { csrfFetch} from "../csrf.js";
import { useNavigate } from "react-router-dom";
import BookCard from "./BookCard.jsx";
import Logout from "./Logout.jsx";

const CustomDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
      <div className="relative inline-block text-left">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:shadow-[0_4px_4px_#9C8F7F]  relative inline-flex w-48 sm:w-56 md:w-64 lg:w-72 justify-center items-center rounded-2xl bg-[#EEE8DF] px-5 py-2 font-fraunces-light text-lg md:text-xl lg:text-2xl text-[#4B3935] shadow-[0_2px_3px_#9C8F7F]  transition cursor-pointer"
        >
          <svg
              className={`absolute right-4 w-5 h-5 ${isOpen ? "transform rotate-180 transition duration-300" : ""}`}
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
            <div className="absolute left-0 mt-2 w-48 sm:w-56 md:w-64 lg:w-72 rounded-2xl bg-[#EEE8DF] shadow-md focus:outline-none z-50 overflow-hidden">
              <div className="py-1">
                <button
                    onClick={() => {
                      onChange("myCollection");
                      setIsOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-center font-fraunces-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer ${
                        value === "myCollection" ? "bg-[#4B3935] text-[#EEE8DF]" : "text-[#4B3935]"
                    }`}
                >
                  My Collection
                </button>
                <button
                    onClick={() => {
                      onChange("borrowedBooks");
                      setIsOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-center font-fraunces-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer ${
                        value === "borrowedBooks" ? "bg-[#4B3935] text-[#EEE8DF]" : "text-[#4B3935]"
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


  const navigate = useNavigate();

  const [collectionType, setCollectionType] = useState("myCollection");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showAddBook, setShowAddBook] = useState(false);
  const [flash, setFlash] = useState({ message: "", type: "" });
  const [books, setBooks] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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
              ? "http://localhost:8080/api/user/books"
              : "http://localhost:8080/api/book/borrowed";

      const response = await csrfFetch(url);
      if (!response.ok) throw new Error("Failed to fetch books");

      const data = await response.json();

      const mapped = data.map((b, index) => ({
        key: b.userBookId ?? `temp-${index}`,
        userBookId: b.userBookId ?? null,
        cover: b.imageLink,
        title: b.title,
        author: Array.isArray(b.authors) ? b.authors.join(", ") : b.authors,
        status: b.status || "AVAILABLE",  
        lender: collectionType === "borrowedBooks" ? b.ownerUsername : null,
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

      const res = await csrfFetch(`http://localhost:8080/api/user/${userBookId}`, {
        method: "DELETE",
      });

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

  const cancelLogout = () => setShowLogout(false);

  return (
      <div className="min-h-screen bg-[#F6F2ED] mx-auto relative font-sans overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-4 py-2">
          {/* Logo */}
          <img
              src="src/assets/BB-Profile.png"
              alt="logo"
              className="w-12 h-12 object-contain md:w-15 md:h-15 lg:w-20 lg:h-20"
          />

          {/* Navigation */}
          <div className="flex space-x-4 text-[#4B3935] text-md md:text-lg lg:text-xl font-fraunces-light pr-10">
            <button className="hover:underline cursor-pointer">Home</button>
            <button className="underline cursor-pointer">Profile</button>
          </div>
        </div>

        {/* Flash Message */}
        {flash.message && (
            <div className="flex justify-center px-4 mb-4">
            <div className={`px-4 py-3 rounded-lg mb-4 text-center inline-block
            ${
                flash.type === "error"
                    ? "bg-red-50 border text-red-700"
                    : "bg-green-50 text-green-700 border"
            }`}>
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-fraunces-light text-base">{flash.message}</span>
              </div>
            </div>
            </div>
        )}

        {/* Profile Section */}
        <div className="flex justify-between items-center px-6 mt-8 flex-wrap gap-4 ml-7">
          {/* Username + Friends */}
          <div className="flex flex-col items-center justify-center">
            <div
                className="rounded-lg px-4 py-3 bg-[#EEE8DF] text-center shadow-[0_2px_3px_#9C8F7F]"
            >
              <p className="font-fraunces-light text-base md:text-lg lg:text-xl text-[#4B3935]">
                @{username || "Loading..."}
              </p>
              <p className="font-fraunces text-sm md:text-base lg:text-lg text-[#2C365A]">
                1111 friends
              </p>
            </div>
            <div>
              <button onClick={()=>setShowLogout(true)}>Log out</button>
              {showLogout && <Logout onClose={cancelLogout}/>}
            </div>
          </div>


          {/* Collection Dropdown */}
          <div className="relative flex-1 flex justify-center">
            <CustomDropdown value={collectionType} onChange={setCollectionType} />
          </div>

          {/* Add Book Button - Responsive text sizing */}
          <button
              onClick={() => setShowAddBook(true)}
              className="bg-[#EEE8DF] px-5 py-2 rounded-full shadow-[0_2px_3px_#9C8F7F] hover:shadow-[0_4px_4px_#9C8F7F] transition font-fraunces-light text-[#4B3935] text-lg lg:text-xl ml-auto mr-7"
          >
            + Add Book
          </button>
          {showAddBook && <AddBook onClose={() => setShowAddBook(false)} onAdded={handleAdded} />}
        </div>

        {loading ? (
            <div className="flex justify-center items-center mt-20">
              <div className="animate-spin h-6 w-6 border-2 border-[#4B3935] border-t-transparent rounded-full"></div>
            </div>
        ) : books.length === 0 ? (
            <div className="flex justify-center items-center mt-20">
              <p className="text-[#4B3935] font-fraunces text-xl">No books found</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-8 2xl:gap-15 px-13 mt-6 w-full">
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
              <div className="relative z-50 bg-[#EEE8DF] p-6 rounded-xl shadow-xl w-[90%] max-w-[380px]">
                <h3 className="font-fraunces text-xl text-[#4B3935] mb-3">Delete book?</h3>
                <p className="font-fraunces text-[#4B3935] mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                      onClick={cancelDelete}
                      className="font-fraunces lg:text-lg px-4 py-2 rounded-full bg-[#F6F2ED] outline outline-[#4B3935] text-[#4B3935] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="font-fraunces-light px-4 py-2 rounded-full bg-[#4B3935] text-[#F6F2ED] hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200 cursor-pointer disabled:opacity-50"
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
