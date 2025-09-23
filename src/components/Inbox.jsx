import React, {useEffect, useState} from "react";
import {csrfFetch} from "../csrf.js";
import RequestModal from "./RequestModal.jsx";

export default function Inbox(){
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [flash, setFlash] = useState({ message: "", type: "" });
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await csrfFetch(`http://localhost:8080/api/borrow/accept/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to accept request');
            }

            setFlash({
                message: 'Request accepted successfully!',
                type: 'success'
            });

            // Remove the accepted request from notifications
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));

            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
            handleCloseModal();
        } catch (error) {
            console.error('Error accepting request:', error);
            setFlash({
                message: 'Failed to accept request',
                type: 'error'
            });
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await csrfFetch(`http://localhost:8080/api/borrow/reject/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            setFlash({
                message: 'Request rejected successfully!',
                type: 'success'
            });

            // Remove the rejected request from notifications
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));

            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
            handleCloseModal();
        } catch (error) {
            console.error('Error rejecting request:', error);
            setFlash({
                message: 'Failed to reject request',
                type: 'error'
            });
            setTimeout(() => setFlash({ message: '', type: '' }), 3000);
        }
    };

    const handleNotificationClick = (notification) => {
        setSelectedRequest(notification);
        setIsModalOpen(true);
        setIsInboxOpen(false); // Close the dropdown when opening modal
    };

    // Fetch incoming borrow requests
    const fetchNotifications = async (page = 1, size = 3) => {
        setIsLoadingNotifications(true);
        try {
            const response = await csrfFetch(
                `http://localhost:8080/api/borrow/incoming?page=${page}&size=${size}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();

            // Transform the API response to match our component structure
            const transformedNotifications = (data.items || [])
                .filter(item => item.status === 'PENDING')
                .map(item => ({
                    id: item.id,
                    type: 'borrow_request',
                    username: item.borrowerUsername,
                    bookTitle: item.bookTitle,
                    meetingDate: item.meetingTime.split('T')[0], // date only
                    meetingTime: item.meetingTime.split('T')[1].substring(0, 5), // HH:MM
                    location: item.location,
                    dueDate: item.dueDate,
                    requestedAt: item.createdAt
                }));

            setNotifications(transformedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    return(
        <div className="relative">
            <button
                onClick={() => setIsInboxOpen(!isInboxOpen)}
                className={`relative focus:outline-none cursor-pointer hover:opacity-80 transition-all duration-200 hover:underline hover:underline-offset-4 ${
                    isInboxOpen ? 'underline underline-offset-4' : ''
                }`}
            >
                <span className="text-[#4B3935] font-fraunces-light text-md md:text-lg lg:text-xl">
                    Inbox
                </span>
                {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Dropdown for notifications */}
            {isInboxOpen && (
                <div
                    className="
                            absolute mt-2
                            -left-20 sm:-left-0 md:-left-30 lg:-left-40
                            w-64 sm:w-70 md:w-80 lg:w-96
                            bg-[#EEE8DF] rounded-xl shadow-lg z-50
                            max-h-80 sm:max-h-96
                            overflow-y-auto
                        "
                >
                    <div className="py-2">
                        {/* Loading State */}
                        {isLoadingNotifications ? (
                            <div className="px-4 py-3 text-center">
                                <div className="animate-spin h-6 w-6 border-2 border-[#4B3935] border-t-transparent rounded-full mx-auto mb-2"></div>
                                <div className="text-sm text-[#2C365A] font-fraunces-light">Loading requests...</div>
                            </div>
                        ) : (
                            <>
                                {/* Flash Message */}
                                {flash.message && (
                                    <div className="px-4 mb-2">
                                        <div className={`px-3 py-2 rounded-lg text-center text-sm
                                            ${flash.type === "error"
                                                ? "bg-red-50 border text-red-700"
                                                : "bg-green-50 text-green-700 border"
                                            }`}>
                                            <div className="flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-fraunces-light">{flash.message}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications List */}
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-3 text-sm md:text-base text-[#2C365A] font-fraunces-light text-center">
                                        No new requests
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className="px-4 py-3 border-b border-[#ccc] last:border-none cursor-pointer hover:bg-[#ddd8cf] transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm md:text-base text-[#2C365A] font-fraunces-light mb-2">
                                                        <span className="font-fraunces text-[#4B3935]">
                                                            @{notification.username}
                                                        </span>{" "}
                                                        requests to borrow
                                                    </p>
                                                    <p className="text-sm font-fraunces text-[#4B3935] truncate">
                                                        "{notification.bookTitle}"
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAcceptRequest(notification.id);
                                                        }}
                                                        className="p-1.5 hover:bg-green-100 rounded-lg transition cursor-pointer"
                                                        title="Accept request"
                                                    >
                                                        <img
                                                            src="/tick.png"
                                                            alt="Accept"
                                                            className="w-5 h-5"
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRejectRequest(notification.id);
                                                        }}
                                                        className="p-1.5 hover:bg-red-200 rounded-lg transition cursor-pointer"
                                                        title="Reject request"
                                                    >
                                                        <img
                                                            src="/cross.png"
                                                            alt="Reject"
                                                            className="w-5 h-5"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Request Modal */}
            <RequestModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
        </div>
    )
}