
export default function BookCard({ cover, title, author, status, lender, onDelete, bookId, deleting }) {
    const isInBorrowedCollection = Boolean(lender);

    const formatStatus = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    };

    return (
        <div className="relative w-full h-full flex justify-center">
            <div
                className={`shadow-[0_2px_3px_#9C8F7F] w-full aspect-[3/5] bg-[#EEE8DF] rounded-xl p-4 flex flex-col items-center transition ${
                    status === "BORROWED" && !isInBorrowedCollection ? "blur-[1.5px]" : ""
                }`}
            >
                {!isInBorrowedCollection && bookId && bookId !== null && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(bookId);
                        }}
                        disabled={deleting}
                        className={`absolute right-2 top-1 text-[#4B3935] hover:text-red-600 transition-colors z-10 ${
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
                    className="w-full aspect-[3/4] object-cover rounded-md mt-2 mb-3 "
                />
                <p className="font-cotta text-sm md:text-base lg:text-lg text-[#4B3935] text-center truncate w-full">
                    {title}
                </p>
                <p className="font-cotta text-xs md:text-sm lg:text-base text-[#2C365A] text-center truncate w-full mb-3">
                    {author}
                </p>
                {!isInBorrowedCollection ? (
                    <span
                        className={`px-3 py-1 rounded-full text-xs md:text-sm lg:text-base font-neuton ${
                            status === "AVAILABLE"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
            {formatStatus(status)}
          </span>
                ) : (
                    <p className="font-cotta text-xs md:text-sm lg:text-base text-[#4B3935] text-center truncate w-full">
                        owned by @{lender}
                    </p>
                )}
            </div>
        </div>
    );
};

