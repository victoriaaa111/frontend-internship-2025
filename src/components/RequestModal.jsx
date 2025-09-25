import React from 'react';

const RequestModal = ({ request, isOpen, onClose, onAccept, onReject }) => {
    if (!isOpen || !request) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatRequestDate = (dateString) => {
        const date = new Date(dateString);
        
        // Don't add any hours - use the timestamp as-is from backend
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            {/* Blur overlay */}
            <div 
                className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div 
                    className="bg-[#EEE8DF] rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <h2 className="text-xl font-fraunces text-[#4B3935] text-center mb-2">
                            Borrow Request
                        </h2>
                        <div className="text-center">
                            <span className="font-fraunces text-[#2C365A]">@{request.username}</span>
                            <span className="font-fraunces-light text-[#2C365A]"> wants to borrow</span>
                        </div>
                        <p className="font-fraunces text-[#4B3935] text-center mt-1 text-lg underline-offset-3 underline">
                            "{request.bookTitle}"
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        <div className="space-y-4">
                            {/* Meeting Details */}
                            <div className="bg-white bg-opacity-50 rounded-xl p-4">
                                <h3 className="font-fraunces text-[#4B3935] mb-3 text-center text-lg">Meeting Details</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Meeting Date</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatDate(request.meetingDate)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Meeting Time</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatTime(request.meetingTime)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Location</div>
                                            <div className="font-fraunces text-[#4B3935] break-words">{request.location}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-[#4B3935] rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-[#EEE8DF]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414l2.293-2.293V14a1 1 0 102 0V8a1 1 0 00-.293-.707z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-fraunces-light text-[#2C365A] text-sm">Due Date</div>
                                            <div className="font-fraunces text-[#4B3935]">{formatDate(request.dueDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Info */}
                            <div className="text-center">
                                <div className="font-fraunces-light text-[#2C365A] text-sm">
                                    Requested on {formatRequestDate(request.requestedAt)}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-6 mt-6">                          
                            <button
                                onClick={() => onAccept(request.id)}
                                className="flex items-center justify-center w-14 h-14 bg-green-100 hover:bg-green-200 rounded-xl transition cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                                title="Accept request"
                            >
                                <img
                                    src="/tick.png"
                                    alt="Accept"
                                    className="w-7 h-7"
                                />
                            </button>

                            <button
                                onClick={() => onReject(request.id)}
                                className="flex items-center justify-center w-14 h-14 bg-red-100 hover:bg-red-200 rounded-xl transition cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                                title="Reject request"
                            >
                                <img
                                    src="/cross.png"
                                    alt="Reject"
                                    className="w-7 h-7"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RequestModal;