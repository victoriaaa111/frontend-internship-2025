import { useState } from "react";
import BorrowBookForm from "./BorrowBookForm.jsx";
import bookPlaceholder from '../assets/book.png';

export default function BookCard({ cover, title, author, status, lender, onDelete, bookId, deleting, resolvedUsername, onBorrowSuccess, pending }) {
    const isInBorrowedCollection = Boolean(lender);
    const shouldBlurContent = status === "BORROWED" && !isInBorrowedCollection;

    const formatStatus = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    };


    const handleBorrowFormClose = (success) => {

        if (success && onBorrowSuccess) {
            onBorrowSuccess(title);
        }
    };
    return (
    <>
        <div className="relative w-full h-full flex justify-center">
            <div className="shadow-[0_2px_3px_#9C8F7F] w-full aspect-[3/5] bg-[#EEE8DF] rounded-xl p-4 flex flex-col items-center transition">

                {pending && (
                    <div className="absolute inset-0 bg-black/15 rounded-xl z-20 flex items-center justify-center">
                        <span className="bg-gray-600 shadow-[0_2px_3px_#EEE8DF] text-white px-3 py-1 rounded-full text-xs md:text-sm lg:font-base font-fraunces font-semibold">
                            Request Pending
                        </span>
                    </div>


                )}

                {!isInBorrowedCollection && bookId && true && !resolvedUsername && (
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
                
                {/* Book cover and info with conditional blur */}
                <div className={`flex flex-col items-center w-full ${shouldBlurContent ? "blur-[1.5px]" : ""}`}>
                    <img
                        src={cover || bookPlaceholder}
                        alt={title}
                        className="w-full aspect-[3/4] object-contain mt-2 mb-3 bg-[#EEE8DF]"
                        loading="lazy"
                    />
                    <p className="font-cotta text-sm md:text-base lg:text-lg text-[#4B3935] text-center truncate w-full">
                        {title}
                    </p>
                    <p className="font-cotta text-xs md:text-sm lg:text-base text-[#2C365A] text-center truncate w-full mb-3">
                        {author}
                    </p>
                </div>

                {/* Status/lender info - never blurred */}
                {!isInBorrowedCollection && !resolvedUsername ? (
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
                    (
                        lender && (
                        <p className="font-cotta text-xs md:text-sm lg:text-base text-[#4B3935] text-center truncate w-full">
                            owned by @{lender}
                        </p>
                    )
                    )
                )}
                {!status && !lender && !isInBorrowedCollection && resolvedUsername && !pending && (
                    <BorrowBookForm
                        onClose={handleBorrowFormClose}
                        bookTitle={title}
                        bookOwner={resolvedUsername}
                        bookId={bookId}
                        styleClasses={" w-full bg-[#2C365A] font-fraunces-light text-[#F6F2ED] rounded-lg mt-1 text-xs md:text-base py-2 cursor-pointer hover:shadow-[0_2px_6px_#9C8F7F] transition duration-200"}
                    />
                    )}
            </div>
        </div>

    </>
    );
};