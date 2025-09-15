import React, { useState } from "react";

export default function BookCard({ cover, title, author, status, lender, onDelete, bookId, deleting }) {
    const isInBorrowedCollection = Boolean(lender);

    const formatStatus = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    };

    return (
        <div className="relative w-full h-full flex justify-center">
            <div
                className={`w-full aspect-[3/5] bg-[#d9d9d9] rounded-xl p-4 flex flex-col items-center transition ${
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
                    className="w-full aspect-[3/4] object-cover rounded-md mb-3 outline-1 outline outline-[#331517]"
                />
                <p className="font-cotta text-sm md:text-base lg:text-lg text-[#331517] text-center truncate w-full">
                    {title}
                </p>
                <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full mb-3">
                    {author}
                </p>
                {!isInBorrowedCollection ? (
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs md:text-sm lg:text-base font-neuton ${
                            status === "AVAILABLE"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                        }`}
                    >
            {formatStatus(status)}
          </span>
                ) : (
                    <p className="font-cotta text-xs md:text-sm lg:text-base text-[#331517] text-center truncate w-full">
                        owned by @{lender}
                    </p>
                )}
            </div>
        </div>
    );
};

