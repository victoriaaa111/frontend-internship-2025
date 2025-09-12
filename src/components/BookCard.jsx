// Reusable BookCard Component
export default function BookCard({ cover, title, author, status,onDelete, bookId }) {
    const handleDelete = () => {
        if (onDelete && bookId) {
            onDelete(bookId);
        }
    };
    return (
        <div
            className={`xl:w-65 bg-[#d9d9d9] rounded-xl p-3 mx-auto flex flex-col items-center transition relative ${
                status === "Borrowed" ? "blur-[1.5px]" : ""
            }`}
            style={{
                boxShadow: "5px 5px 4px rgba(0, 0, 0, 0.3)",
            }}
        >
            <button
                onClick={handleDelete}
                className="absolute right-2 top-1 text-[#331517] hover:text-red-600 transition-colors z-10"
                aria-label="Delete book"
            >
                ✕
            </button>

            {/* Book Cover */}
            <img
                src={cover}
                alt={title}
                className="w-full aspect-[3/4] object-cover rounded-md mb-3 mt-5"
            />

            {/* Book Info - Responsive text sizing */}
            <p className="font-cotta text-sm md:text-base lg:text-lg text-[#331517] text-center truncate w-full">
                {title}
            </p>
            <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full">
                {author}
            </p>

            {/* Status - Responsive text sizing */}
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
