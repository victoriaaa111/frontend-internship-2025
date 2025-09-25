import React, {useEffect,useMemo, useState, useCallback} from "react";
import {csrfFetch} from "../csrf.js";
import BookCard from "./BookCard.jsx";
import {useLocation, useParams, useNavigate} from "react-router-dom";
import Menu from "./Menu.jsx";

const API_BASE = import.meta.env.VITE_API_BASE;


export default function OtherProfile() {
    const {username: usernameFromParams} = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const resolvedUsername = useMemo(() =>{
        const fromUrl = usernameFromParams?.trim();
        const fromState = (location.state && location.state.username) ? String(location.state.username).trim() : '';
        return decodeURIComponent(fromUrl || fromState || "");
    }, [usernameFromParams, location.state]);

    const [loading, setLoading] = useState(false);
    const [flash, setFlash] = useState({ message: "", type: "" });
    const [books, setBooks] = useState([]);
    const [userNotFound, setUserNotFound] = useState(false);

    const checkIfOwnProfile = useCallback(async () => {
        if (!resolvedUsername) return false;

        try {
            const response = await csrfFetch(`${API_BASE}/api/user/me`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.username === resolvedUsername) {
                    navigate("/profile");
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking username:", error);
        }
        return false;
    }, [resolvedUsername, navigate]);

    const fetchBooks = useCallback(async () => {
        if (!resolvedUsername) return;

        // Check if viewing own profile first
        const isOwnProfile = await checkIfOwnProfile();
        if (isOwnProfile) return;

        setLoading(true);
        try {
            const url = `${API_BASE}/api/user/books/${encodeURIComponent(resolvedUsername)}`;

            const response = await csrfFetch(url);

            if (response.status === 400) {
                setUserNotFound(true);
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch books");

            const data = await response.json();

            const mapped = data.map((b, index) => ({
                key: index,
                userBookId: b.userBookId,
                cover: b.imageLink,
                title: b.title,
                author: Array.isArray(b.authors) ? b.authors.join(", ") : b.authors,
                status: b.status,
                pending: b.pending
            }));

            setBooks(mapped);
        } catch {
            if (!userNotFound) {
                setFlash({
                    message: "Failed to load books",
                    type: "error",
                });
                setTimeout(() => setFlash({message: "", type: ""}), 3000);
            }
        } finally {
            setLoading(false);
        }
    }, [resolvedUsername, userNotFound, checkIfOwnProfile]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);


    const handleBorrowSuccess = useCallback((bookTitle,bookId) => {
        setBooks(prevBooks =>
            prevBooks.map(book =>
                book.userBookId === bookId
                    ? { ...book, pending: true }
                    : book
            )
        );

        setFlash({ message: `Borrow request sent successfully for ${bookTitle}`, type: "success" });
        setTimeout(() => setFlash({ message: "", type: "" }), 4500);
    },[]);

    if (userNotFound) {
        return (
            <div className="min-h-screen bg-[#F6F2ED] mx-auto relative font-sans overflow-y-auto">
                <Menu />
                <div className="flex flex-col items-center justify-center px-4 mt-20">
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-fraunces text-[#4B3935] mb-4">
                            User Not Found
                        </h1>
                        <p className="text-lg font-fraunces-light text-[#2C365A] mb-6">
                            The profile for @{resolvedUsername} does not exist or is not available.
                        </p>


                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#F6F2ED] mx-auto relative font-sans overflow-y-auto">
            <Menu/>

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

            <div className="flex flex-col px-3 sm:px-7 md:px-10 mb-4 mt-8 gap-4 lg:mx-10">
                {/* Profile Section */}
                <div className="rounded-lg px-4 py-3 bg-[#2C365A] text-center shadow-[0_2px_5px_#2C365A] w-fit">
                    <p className="font-fraunces-light text-base md:text-lg lg:text-xl text-[#F6F2ED]">
                        @{resolvedUsername|| "Loading..."}
                    </p>
                    <p className="font-fraunces-light text-sm md:text-base lg:text-lg text-[#EEE8DF]">
                        1111 friends
                    </p>
                </div>

                {/* Books Section */}
                <div className=" w-full">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin h-6 w-6 border-2 border-[#4B3935] border-t-transparent rounded-full"></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-[#4B3935] font-fraunces text-base sm:text-md md:text-lg lg:text-xl">No books found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-8 2xl:gap-15 w-full">
                            {books.map((book) => (
                                <BookCard
                                    key={book.key}
                                    bookId={book.userBookId}
                                    cover={book.cover}
                                    title={book.title}
                                    author={book.author}
                                    resolvedUsername={resolvedUsername}
                                    onBorrowSuccess={handleBorrowSuccess}
                                    pending={book.pending}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}