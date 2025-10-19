import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    // Mock data for borrow requests
    const mockRequests = [
        {
            id: 1,
            bookTitle: "The Great Gatsby",
            borrower: "alice_reader",
            lender: "book_collector",
            status: "PENDING",
            requestDate: "2025-10-23T10:30:00Z",
            responseDate: null,},
        {
            id: 2,
            bookTitle: "1984",
            borrower: "john_doe",
            lender: "dystopia_fan",
            status: "ACCEPTED",
            requestDate: "2025-10-14T14:20:00Z",
            responseDate: "2025-10-14T16:45:00Z",
        },
        {
            id: 3,
            bookTitle: "To Kill a Mockingbird",
            borrower: "literature_lover",
            lender: "classic_books",
            status: "REJECTED",
            requestDate: "2025-09-26T09:15:00Z",
            responseDate: "2025-09-27T12:30:00Z",
        },
        {
            id: 4,
            bookTitle: "Pride and Prejudice",
            borrower: "jane_austen_fan",
            lender: "romance_reader",
            status: "PENDING",
            requestDate: "2025-10-12T16:00:00Z",
            responseDate: null,
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setRequests(mockRequests);
            setFilteredRequests(mockRequests);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredRequests(requests);
        } else {
            setFilteredRequests(requests.filter(req => req.status === statusFilter));
        }
    }, [statusFilter, requests]);

    const handleStatusUpdate = async (requestId, newStatus) => {
        setActionLoading(requestId);

        // Simulate API call
        setTimeout(() => {
            setRequests(prev => prev.map(req =>
                req.id === requestId
                    ? { ...req, status: newStatus, responseDate: new Date().toISOString() }
                    : req
            ));
            setActionLoading(null);
            setSelectedRequest(null);
        }, 1000);
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'ACCEPTED': return 'bg-green-50 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F6F2ED] p-6 flex items-center justify-center">
                <div className="text-[#4B3935] font-fraunces text-lg">Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F2ED] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-cotta font-bold text-[#4B3935] mb-2">
                        Admin Panel - Borrow Requests
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="font-fraunces text-[#4B3935] font-medium">Filter by status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-[#9C8F7F]/30 rounded-lg font-fraunces text-[#4B3935] bg-white focus:outline-none focus:ring-2 focus:ring-[#2C365A]/20"
                        >
                            <option value="ALL">All Requests</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <div className="ml-auto text-sm text-[#4B3935]/70 font-fraunces">
                            Showing {filteredRequests.length} of {requests.length} requests
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#EEE8DF] border-b border-[#9C8F7F]/20">
                            <tr>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Book</th>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Borrower</th>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Lender</th>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Status</th>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Request Date</th>
                                <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935]">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="border-b border-[#9C8F7F]/10 hover:bg-[#F6F2ED]/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-fraunces text-[#4B3935] font-medium">{request.bookTitle}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/user/${request.borrower}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces"
                                        >
                                            @{request.borrower}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/user/${request.lender}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces"
                                        >
                                            @{request.lender}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-fraunces border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#4B3935]/70 font-fraunces text-sm">
                                        {formatDate(request.requestDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="bg-[#2C365A] text-white px-3 py-1 rounded-lg font-fraunces text-sm hover:shadow-[0_2px_6px_rgba(44,54,90,0.3)] transition-all duration-200"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-12 text-[#4B3935]/50 font-fraunces">
                            No requests found matching the selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(75,57,53,0.2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-fraunces font-bold text-[#4B3935]">Request Details</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-[#4B3935]/50 hover:text-[#4B3935] text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Book Title</label>
                                        <p className="font-fraunces text-[#4B3935]">{selectedRequest.bookTitle}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-sm font-fraunces border ${getStatusColor(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Borrower</label>
                                        <button
                                            onClick={() => navigate(`/user/${selectedRequest.borrower}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces"
                                        >
                                            @{selectedRequest.borrower}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Lender</label>
                                        <button
                                            onClick={() => navigate(`/user/${selectedRequest.lender}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces"
                                        >
                                            @{selectedRequest.lender}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Request Date</label>
                                        <p className="font-fraunces text-[#4B3935]/70">{formatDate(selectedRequest.requestDate)}</p>
                                    </div>
                                    {selectedRequest.responseDate && (
                                        <div>
                                            <label className="block text-sm font-fraunces font-medium text-[#4B3935] mb-1">Response Date</label>
                                            <p className="font-fraunces text-[#4B3935]/70">{formatDate(selectedRequest.responseDate)}</p>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Admin Actions */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className="mt-6 pt-6 border-t border-[#9C8F7F]/20">
                                    <h3 className="font-fraunces font-semibold text-[#4B3935] mb-4">Admin Actions</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'ACCEPTED')}
                                            disabled={actionLoading === selectedRequest.id}
                                            className="bg-green-50 text-green-700 border px-4 py-2 rounded-lg font-fraunces  disabled:opacity-50 transition-colors cursor-pointer"
                                        >
                                            {actionLoading === selectedRequest.id ? 'Processing...' : 'Accept Request'}
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}
                                            disabled={actionLoading === selectedRequest.id}
                                            className="bg-red-50 border text-red-700 px-4 py-2 rounded-lg font-fraunces disabled:opacity-50 transition-colors cursor-pointer"
                                        >
                                            {actionLoading === selectedRequest.id ? 'Processing...' : 'Reject Request'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}