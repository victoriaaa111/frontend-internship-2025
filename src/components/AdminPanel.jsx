import { useState, useEffect, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
const API_BASE = import.meta.env.VITE_API_BASE;
import { csrfFetch } from '../csrf.js';

const StatusDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
        { value: 'ALL', label: 'All Requests' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'ACCEPTED', label: 'Accepted' },
        { value: 'REJECTED', label: 'Rejected' }
    ];

    const getCurrentLabel = () => {
        return statusOptions.find(option => option.value === value)?.label || 'All Requests';
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          hover:shadow-[0_4px_4px_#9C8F7F]
          relative inline-flex
          w-full sm:w-48
          justify-center items-center
          rounded-2xl bg-[#EEE8DF] px-4 pr-8 py-2
          font-fraunces
          text-sm sm:text-base
          text-[#4B3935]
          shadow-[0_2px_3px_#9C8F7F]
          transition cursor-pointer
        "
            >
                <svg
                    className={`absolute right-3 w-4 h-4 ${isOpen ? "transform rotate-180 transition duration-300" : ""}`}
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
                <span className="mx-auto text-sm sm:text-base">
          {getCurrentLabel()}
        </span>
            </button>

            {isOpen && (
                <div className="
          absolute left-0 mt-1
          w-full sm:w-48
          rounded-2xl bg-[#EEE8DF] shadow-md
          focus:outline-none z-20 overflow-hidden
        ">
                    <div className="py-1">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`block w-full px-4 py-2 text-center font-fraunces text-sm sm:text-base transition rounded-2xl mx-auto -my-1 cursor-pointer ${
                                    value === option.value ? "bg-[#4B3935] text-[#EEE8DF]" : "text-[#4B3935] hover:bg-[#4B3935]/10"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminPanel() {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [error, setError] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const navigate = useNavigate();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                pageIndex: currentPage.toString(),
                pageSize: pageSize.toString()
            });

            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter);
            }

            const response = await csrfFetch(
                `${API_BASE}/api/admin/borrow-requests?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }

            const data = await response.json();

            setRequests(data.items || []);
            setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0);
            setHasNextPage(data.hasNextPage || false);
            setHasPreviousPage(data.hasPreviousPage || false);

        } catch (err) {
            setError(err.message || 'Failed to load requests');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Reset to page 1 when status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const handleStatusUpdate = async (requestId, newStatus) => {
        setActionLoading(requestId);
        setError('');

        try {
            const response = await csrfFetch(
                `${API_BASE}/api/admin/borrow-requests/${requestId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update request status');
            }

            // Refresh the list after successful update
            await fetchRequests();
            setSelectedRequest(null);

        } catch (err) {
            setError(err.message || 'Failed to update request');
        } finally {
            setActionLoading(null);
        }
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

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-[#F6F2ED] p-4 sm:p-6 flex items-center justify-center">
                <div className="text-[#4B3935] font-fraunces text-lg">Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F2ED] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-cotta font-bold text-[#4B3935] mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-sm sm:text-base text-[#4B3935]/70 font-fraunces">
                        Manage borrow requests
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-fraunces text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Filters and View Toggle */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center flex-1">
                            <label className="font-fraunces text-[#4B3935] font-medium text-sm sm:text-base whitespace-nowrap">
                                Filter by status:
                            </label>
                            <StatusDropdown
                                value={statusFilter}
                                onChange={setStatusFilter}
                            />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 sm:hidden">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-1 rounded-lg font-fraunces text-sm transition-colors cursor-pointer ${
                                    viewMode === 'cards'
                                        ? 'bg-[#2C365A] text-white'
                                        : 'bg-gray-100 text-[#4B3935]'
                                }`}
                            >
                                Cards
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-lg font-fraunces text-sm transition-colors cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-[#2C365A] text-white'
                                        : 'bg-gray-100 text-[#4B3935]'
                                }`}
                            >
                                Table
                            </button>
                        </div>

                        <div className="text-xs sm:text-sm text-[#4B3935]/70 font-fraunces">
                            Showing {requests.length} of {totalCount} requests
                        </div>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className={`${viewMode === 'cards' ? 'block' : 'hidden'} sm:hidden space-y-4`}>
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-fraunces font-medium text-[#4B3935] text-lg">{request.bookTitle}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-fraunces border ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#4B3935]/70 font-fraunces">Borrower:</span>
                                    <button
                                        onClick={() => navigate(`/user/${request.borrower}`)}
                                        className="text-[#2C365A] hover:underline font-fraunces cursor-pointer"
                                    >
                                        @{request.borrower}
                                    </button>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#4B3935]/70 font-fraunces">Lender:</span>
                                    <button
                                        onClick={() => navigate(`/user/${request.lender}`)}
                                        className="text-[#2C365A] hover:underline font-fraunces cursor-pointer"
                                    >
                                        @{request.lender}
                                    </button>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#4B3935]/70 font-fraunces">Date:</span>
                                    <span className="text-[#4B3935] font-fraunces">{formatDate(request.requestDate)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedRequest(request)}
                                className="w-full bg-[#2C365A] text-white py-2 rounded-lg font-fraunces text-sm hover:shadow-[0_2px_6px_rgba(44,54,90,0.3)] transition-all duration-200 cursor-pointer"
                            >
                                View Details
                            </button>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className="text-center py-12 text-[#4B3935]/50 font-fraunces">
                            No requests found matching the selected filter.
                        </div>
                    )}
                </div>

                {/* Desktop/Tablet Table View */}
                <div className={`${viewMode === 'table' ? 'block' : 'hidden'} sm:block bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-[#EEE8DF] border-b border-[#9C8F7F]/20">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base">Book</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base">Borrower</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base">Lender</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base">Status</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base hidden md:table-cell">Date</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm sm:text-base">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((request) => (
                                <tr key={request.id} className="border-b border-[#9C8F7F]/10 hover:bg-[#F6F2ED]/30 transition-colors">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="font-fraunces text-[#4B3935] font-medium text-sm sm:text-base">{request.bookTitle}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <button
                                            onClick={() => navigate(`/user/${request.borrower}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces text-sm sm:text-base cursor-pointer"
                                        >
                                            @{request.borrower}
                                        </button>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <button
                                            onClick={() => navigate(`/user/${request.lender}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces text-sm sm:text-base cursor-pointer"
                                        >
                                            @{request.lender}
                                        </button>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-fraunces border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-[#4B3935]/70 font-fraunces text-xs sm:text-sm hidden md:table-cell">
                                        {formatDate(request.requestDate)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="bg-[#2C365A] text-white px-2 sm:px-3 py-1 rounded-lg font-fraunces text-xs sm:text-sm hover:shadow-[0_2px_6px_rgba(44,54,90,0.3)] transition-all duration-200 cursor-pointer"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {requests.length === 0 && (
                        <div className="text-center py-12 text-[#4B3935]/50 font-fraunces">
                            No requests found matching the selected filter.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4">
                        <div className="text-sm text-[#4B3935]/70 font-fraunces">
                            Page {currentPage} of {totalPages}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={!hasPreviousPage || loading}
                                className="px-3 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_4px_#9C8F7F] transition cursor-pointer"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={!hasPreviousPage || loading}
                                className="px-3 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_4px_#9C8F7F] transition cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={!hasNextPage || loading}
                                className="px-3 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_4px_#9C8F7F] transition cursor-pointer"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={!hasNextPage || loading}
                                className="px-3 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_4px_#9C8F7F] transition cursor-pointer"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(75,57,53,0.2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-fraunces font-bold text-[#4B3935]">Request Details</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-[#4B3935]/50 hover:text-[#4B3935] text-2xl p-1 cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Book Title</label>
                                        <p className="font-fraunces text-[#4B3935] text-sm sm:text-base">{selectedRequest.bookTitle}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-sm font-fraunces border ${getStatusColor(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Borrower</label>
                                        <button
                                            onClick={() => navigate(`/user/${selectedRequest.borrower}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces text-sm sm:text-base cursor-pointer"
                                        >
                                            @{selectedRequest.borrower}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Lender</label>
                                        <button
                                            onClick={() => navigate(`/user/${selectedRequest.lender}`)}
                                            className="text-[#2C365A] hover:underline font-fraunces text-sm sm:text-base cursor-pointer"
                                        >
                                            @{selectedRequest.lender}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Request Date</label>
                                        <p className="font-fraunces text-[#4B3935] text-sm sm:text-base">{formatDate(selectedRequest.requestDate)}</p>
                                    </div>
                                    {selectedRequest.responseDate && (
                                        <div>
                                            <label className="block text-sm font-fraunces font-medium text-[#4B3935]/70 mb-1">Response Date</label>
                                            <p className="font-fraunces text-[#4B3935] text-sm sm:text-base">{formatDate(selectedRequest.responseDate)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className="mt-6 pt-6 border-t border-[#9C8F7F]/20">
                                    <h3 className="font-fraunces font-semibold text-[#4B3935] mb-4 text-sm sm:text-base">Admin Actions</h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'ACCEPTED')}
                                            disabled={actionLoading === selectedRequest.id}
                                            className="bg-green-50 text-green-700 border px-4 py-2 rounded-lg font-fraunces disabled:opacity-50 transition-colors cursor-pointer text-sm sm:text-base"
                                        >
                                            {actionLoading === selectedRequest.id ? 'Processing...' : 'Accept Request'}
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}
                                            disabled={actionLoading === selectedRequest.id}
                                            className="bg-red-50 border text-red-700 px-4 py-2 rounded-lg font-fraunces disabled:opacity-50 transition-colors cursor-pointer text-sm sm:text-base"
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