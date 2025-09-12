import React, {useState} from "react";
import AddBook from "./AddBook.jsx";
import BookCard from "./BookCard.jsx";

export default function ProfilePage() {
  const [showAddBook, setShowAddBook] = useState(false);
  const [flash, setFlash] = useState("");
  // Mock data (later you replace with Google Books API results)
  const [books, setBooks] = useState([
    { cover: "https://covers.openlibrary.org/b/id/11153271-L.jpg", title: "Rich Dad, Poor Dad", author: "Robert T. Kiyosaki", status: "Borrowed" },
    { cover: "https://covers.openlibrary.org/b/id/11153271-L.jpg", title: "Rich Dad, Poor Dad", author: "Robert T. Kiyosaki", status: "Available" },
  ]);
  const handleAdded = (created) => {
    // Show banner
    setFlash(`Book “${created.title}” added successfully.`);
    setTimeout(() => setFlash(""), 3500);
  };

  return (
    <div className="min-h-screen bg-[#d9d1c0] mx-auto relative font-sans overflow-y-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <img
          src="src/assets/BB-Profile.png"
          alt="logo"
          className="w-12 h-12 object-contain md:w-16 md:h-16 lg:w-20 lg:h-20"
        />

        {/* Navigation - Responsive text sizing */}
        <div className="flex space-x-4 text-[#331517] text-xl md:text-2xl lg:text-3xl font-neuton-light pr-10">
          <button className="hover:underline">Home</button>
          <button className="underline">Profile</button>
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
        {/* Username + Friends - Responsive text sizing */}
        <div className="rounded-xl px-4 py-3 bg-[#d9d9d9] shadow-md text-center">
          <p className="font-neuton text-base md:text-lg lg:text-xl text-[#3d2b1f]">@victoriaaa111</p>
          <p className="font-neuton text-sm md:text-base lg:text-lg text-[#d4a373]">1111 friends</p>
        </div>

        {/* Add Book Button - Responsive text sizing */}
        <button onClick={()=>setShowAddBook(true)} className="bg-[#d9d9d9] px-5 py-2 rounded-full shadow-md hover:shadow-lg transition font-neuton-light text-[#331517] text-lg md:text-xl lg:text-2xl ml-auto mr-7">
          + Add Book
        </button>
        {showAddBook && <AddBook onClose={() => setShowAddBook(false)} onAdded={handleAdded} />}
      </div>


      {/* Book Collection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-x-10 gap-y-10 px-5 mt-6 ">
        {books.map((book, index) => (
          <BookCard
            key={index}
            cover={book.cover}
            title={book.title}
            author={book.author}
            status={book.status}
          />
        ))}
      </div>
    </div>
  );
}