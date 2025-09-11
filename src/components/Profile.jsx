import React, { useState, useEffect } from "react";

// Reusable BookCard Component
function BookCard({ cover, title, author, status }) {
  return (
    <div
      className={`xl:w-65 bg-[#d9d9d9] rounded-xl p-2 mx-auto flex flex-col items-center transition ml-4 ${
        status === "Borrowed" ? "blur-[1.5px]" : ""
      }`}
      style={{
        boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.2)",
      }}
    >
      <img
        src={cover}
        alt={title}
        className="w-full aspect-[3/4] object-cover rounded-md mb-3"
      />
      <p className="font-cotta text-sm md:text-base lg:text-lg text-[#331517] text-center truncate w-full">
        {title}
      </p>
      <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full">
        {author}
      </p>
      <span
        className={`mt-1 px-2 py-0.5 rounded-full text-xs md:text-sm lg:text-base font-neuton ${
          status === "Available"
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-600"
        }`}
      >
        {status}
      </span>
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
        <div className="absolute left-0 mt-2 w-48 sm:w-56 md:w-64 lg:w-72 rounded-2xl bg-[#d9d9d9] shadow-md focus:outline-none z-10 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onChange("myCollection");
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-center font-neuton-light text-lg md:text-xl lg:text-2xl transition rounded-2xl mx-auto -my-1 cursor-pointer
                ${value === "myCollection" 
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
                ${value === "borrowedBooks" 
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
  const [collectionType, setCollectionType] = useState("myCollection");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const url =
          collectionType === "myCollection"
            ? "http://localhost:8080/api/v1/books/my-collection"
            : "http://localhost:8080/api/v1/books/borrowed";

        const response = await fetch(url);
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([
          {
            cover: "https://covers.openlibrary.org/b/id/11153271-L.jpg",
            title: "Rich Dad, Poor Dad",
            author: "Robert T. Kiyosaki",
            status:
              collectionType === "myCollection" ? "Available" : "Borrowed",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [collectionType]);

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

        {/* Navigation - Responsive text sizing */}
        <div className="flex space-x-4 text-[#331517] text-xl md:text-2xl lg:text-2xl font-neuton-light pr-10">
          <button className="hover:underline cursor-pointer">Home</button>
          <button className="underline cursor-pointer">Profile</button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex justify-between items-center px-6 mt-8 flex-wrap gap-4 ml-7">
        {/* Username + Friends */}
        <div className="rounded-lg px-4 py-3 bg-[#d9d9d9] text-center outline-1 outline outline-[#331517] shadow-md" style={{boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.1)"}}>
          <p className="font-neuton text-base md:text-lg lg:text-xl text-[#331517]">
            @victoriaaa111
          </p>
          <p className="font-neuton text-sm md:text-base lg:text-lg text-[#b57e25]">
            1111 friends
          </p>
        </div>

        {/* Collection Dropdown */}
        <div className="relative flex-1 flex justify-center">
          <CustomDropdown
            value={collectionType}
            onChange={setCollectionType}
          />
        </div>

        {/* Add Book Button */}
        <button className="bg-[#d9d9d9] px-5 py-2 rounded-full shadow-md hover:shadow-lg transition font-neuton-light text-[#331517] text-lg md:text-xl lg:text-2xl ml-auto mr-7 cursor-pointer hover:bg-[#331517] hover:text-[#d9d9d9]">
          + Add Book
        </button>
      </div>

      {/* Book Collection */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-10 gap-y-10 px-5 mt-6">
        {loading ? (
          <div className="col-span-full text-center font-neuton text-lg md:text-xl lg:text-2xl text-[#331517]">
            Loading...
          </div>
        ) : (
          books.map((book, index) => (
            <BookCard
              key={index}
              cover={book.cover}
              title={book.title}
              author={book.author}
              status={book.status}
            />
          ))
        )}
      </div>
    </div>
  );
}