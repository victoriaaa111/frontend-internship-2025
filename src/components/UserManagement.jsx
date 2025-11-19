import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
const API_BASE = import.meta.env.VITE_API_BASE;
import { csrfFetch } from '../csrf.js';
import AdminNavDropdown from './AdminNavDropdown.jsx';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                pageIndex: currentPage.toString(),
                pageSize: pageSize.toString()
            });

            const response = await csrfFetch(
                `${API_BASE}/api/admin/users?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();

            setUsers(data.items || []);
            setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0);
            setHasNextPage(data.hasNextPage || false);
            setHasPreviousPage(data.hasPreviousPage || false);

        } catch (err) {
            setError(err.message || 'Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (username) => {
        if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(username);
        setError('');

        try {
            const response = await csrfFetch(
                `${API_BASE}/api/admin/users/${username}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            await fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.username?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
    });

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-[#F6F2ED] p-4 sm:p-6 flex items-center justify-center">
                <div className="text-[#4B3935] font-fraunces text-lg">Loading user management...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F2ED] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-cotta font-bold text-[#4B3935] mb-2">
                            User Management
                        </h1>
                        <p className="text-sm sm:text-base text-[#4B3935]/70 font-fraunces">
                            Monitor and manage registered users
                        </p>
                    </div>
                    <AdminNavDropdown />
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

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <label className="font-fraunces text-[#4B3935] font-medium text-sm sm:text-base whitespace-nowrap">
                            Search users:
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="flex-1 w-full px-4 py-2 rounded-lg border border-[#9C8F7F]/30 focus:outline-none focus:ring-2 focus:ring-[#4B3935]/20 font-fraunces text-[#4B3935]"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4 sm:p-6 mb-6">
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="font-fraunces text-[#4B3935]/70 text-sm sm:text-base">Total Users:</span>
                            <span className="font-fraunces font-bold text-[#4B3935] text-base sm:text-lg">{totalCount}</span>
                        </div>
                        {searchTerm && (
                            <div className="flex items-center gap-2">
                                <span className="font-fraunces text-[#4B3935]/70 text-sm sm:text-base">Filtered:</span>
                                <span className="font-fraunces font-bold text-[#4B3935] text-base sm:text-lg">{filteredUsers.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#EEE8DF]">
                                <tr>
                                    <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm">
                                        Username
                                    </th>
                                    <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm">
                                        Books in Collection
                                    </th>
                                    <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm">
                                        Borrowed Books
                                    </th>
                                    <th className="px-6 py-4 text-left font-fraunces font-semibold text-[#4B3935] text-sm">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#9C8F7F]/20">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center">
                                            <div className="text-[#4B3935]/60 font-fraunces">
                                                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.username} className="hover:bg-[#F6F2ED]/50 transition">
                                            <td className="px-6 py-4 font-fraunces text-[#4B3935] text-sm">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 font-fraunces text-[#4B3935] text-sm">
                                                <button
                                                    onClick={() => navigate(`/user/${user.username}`)}
                                                    className="hover:underline text-[#2C365A] cursor-pointer"
                                                >
                                                    @{user.username}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 font-fraunces text-[#4B3935] text-sm">
                                                {user.booksInCollection || 0}
                                            </td>
                                            <td className="px-6 py-4 font-fraunces text-[#4B3935] text-sm">
                                                {user.borrowedBooks || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteUser(user.username)}
                                                    disabled={deleteLoading === user.username}
                                                    className="px-4 py-2 bg-red-50 border text-red-700 hover:bg-red-700 hover:text-red-50 rounded-lg font-fraunces text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading === user.username ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-[#9C8F7F]/20">
                        {filteredUsers.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="text-[#4B3935]/60 font-fraunces">
                                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                </div>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div key={user.username} className="p-4 space-y-3">
                                    <div>
                                        <div className="text-xs font-fraunces text-[#4B3935]/60 mb-1">Email</div>
                                        <div className="font-fraunces text-[#4B3935] text-sm">{user.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-fraunces text-[#4B3935]/60 mb-1">Username</div>
                                        <button
                                            onClick={() => navigate(`/user/${user.username}`)}
                                            className="font-fraunces text-[#2C365A] text-sm hover:underline cursor-pointer"
                                        >
                                            @{user.username}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs font-fraunces text-[#4B3935]/60 mb-1">Books in Collection</div>
                                            <div className="font-fraunces text-[#4B3935] text-sm">{user.booksInCollection || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-fraunces text-[#4B3935]/60 mb-1">Borrowed Books</div>
                                            <div className="font-fraunces text-[#4B3935] text-sm">{user.borrowedBooks || 0}</div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleDeleteUser(user.username)}
                                            disabled={deleteLoading === user.username}
                                            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-fraunces text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleteLoading === user.username ? 'Deleting...' : 'Delete User'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(75,57,53,0.1)] p-4">
                        <div className="text-sm text-[#4B3935]/70 font-fraunces">
                            Page {currentPage} of {totalPages} • {totalCount} total users
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={!hasPreviousPage || loading}
                                className="px-4 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm hover:bg-[#9C8F7F]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={!hasNextPage || loading}
                                className="px-4 py-2 rounded-lg bg-[#EEE8DF] text-[#4B3935] font-fraunces text-sm hover:bg-[#9C8F7F]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
