import React, { useEffect, useState } from "react";
import { Bell, ArrowLeft, Trash2, Eye, EyeOff, CheckCircle, XCircle, Users, Edit, User, Mail, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [deleteRequests, setDeleteRequests] = useState([]);
    const [editRequests, setEditRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("notifications"); // "notifications", "deleteRequests", "editRequests"
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get("/auth/admin/notifications");
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load notifications");
        }
    };

    const fetchDeleteRequests = async () => {
        try {
            const response = await axiosInstance.get("/auth/user/delete-requests");
            setDeleteRequests(response.data.data || []);
        } catch (error) {
            console.error("Error fetching delete requests:", error);
            toast.error("Failed to load delete requests");
        }
    };

    const fetchEditRequests = async () => {
        try {
            const response = await axiosInstance.get("/auth/user/edit-requests");
            setEditRequests(response.data.data || []);
        } catch (error) {
            console.error("Error fetching edit requests:", error);
            toast.error("Failed to load edit requests");
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axiosInstance.put(`/auth/admin/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking as read:", error);
            toast.error("Failed to mark as read");
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put("/auth/admin/notifications/mark-all-read");
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast.error("Failed to mark all as read");
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axiosInstance.delete(`/auth/admin/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const handleDeleteRequestAction = async (requestId, action) => {
        try {
            if (action === 'approve') {
                const request = deleteRequests.find(req => req.id === requestId);
                if (!request) {
                    toast.error("Delete request not found");
                    return;
                }

                await axiosInstance.delete(`/v1/user/${request.user_id}`);
                await axiosInstance.delete(`/auth/user/delete-requests/${requestId}`);
                setDeleteRequests(prev => prev.filter(req => req.id !== requestId));
                toast.success("User deleted successfully");
            } else if (action === 'reject') {
                const request = deleteRequests.find(req => req.id === requestId);
                await axiosInstance.put(`/v1/user/${request.user_id}`, {
                    member_status: 1
                });
                await axiosInstance.put(`/auth/user/delete-requests/${requestId}`, {
                    status: 'failed'
                });
                await axiosInstance.delete(`/auth/user/delete-requests/${requestId}`);
                setDeleteRequests(prev => prev.filter(req => req.id !== requestId));
                toast.success("Delete request rejected");
            }
        } catch (error) {
            console.error(`Error ${action}ing delete request:`, error);
            toast.error(`Failed to ${action} delete request`);
        }
    };

    const handleEditRequestAction = async (requestId, action) => {
        try {
            const request = editRequests.find(req => req.id === requestId);
            if (!request) {
                toast.error("Edit request not found");
                return;
            }

            if (action === 'approve') {
                // Navigate to edit page for this user
                navigate(`/users/edit/${request.member_id}`);
                
                // Optionally mark request as approved
                await axiosInstance.put(`/auth/user/edit-requests/${requestId}`, {
                    status: 'approved',
                    admin_notes: 'Request approved and user edit page opened'
                });
                
                // Remove from pending requests
                setEditRequests(prev => prev.filter(req => req.id !== requestId));
                
            } else if (action === 'reject') {
                await axiosInstance.put(`/auth/user/edit-requests/${requestId}`, {
                    status: 'rejected',
                    admin_notes: 'Edit request rejected by Super Admin'
                });
                
                setEditRequests(prev => prev.filter(req => req.id !== requestId));
                toast.success("Edit request rejected");
            }
        } catch (error) {
            console.error(`Error ${action}ing edit request:`, error);
            toast.error(`Failed to ${action} edit request`);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'deleteRequest':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'edit_request':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'info':
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'warning':
                return 'Warning';
            case 'deleteRequest':
                return 'Delete Request';
            case 'edit_request':
                return 'Edit Request';
            case 'info':
            default:
                return 'Information';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'processed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchNotifications(), 
                fetchDeleteRequests(), 
                fetchEditRequests()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-300">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Admin Panel
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Manage notifications, delete requests and edit requests
                                </p>
                            </div>
                        </div>
                    </div>

                    {activeTab === "notifications" && notifications.some(notif => !notif.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "notifications"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Bell className="w-4 h-4" />
                            <span>Notifications</span>
                            {notifications.some(notif => !notif.isRead) && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications.filter(notif => !notif.isRead).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("deleteRequests")}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "deleteRequests"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Delete Requests</span>
                            {deleteRequests.length > 0 && (
                                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {deleteRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("editRequests")}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "editRequests"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Requests</span>
                            {editRequests.length > 0 && (
                                <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {editRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No notifications
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    You're all caught up! New notifications will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                                                            notification.type
                                                        )}`}
                                                    >
                                                        {getTypeLabel(notification.type)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                    {notification.message}
                                                </p>
                                                {notification.triggeredBy && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Triggered by Admin ID: {notification.triggeredBy}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Requests Tab */}
                {activeTab === "deleteRequests" && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {deleteRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No delete requests
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    There are no pending delete requests at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Request ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                User Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Reason
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Requested At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {deleteRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    #{request.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {request.user?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {request.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(request.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteRequestAction(request.id, 'approve')}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                            title="Approve and delete user"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRequestAction(request.id, 'reject')}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                            title="Reject request"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Requests Tab */}
                {activeTab === "editRequests" && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {editRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Edit className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No edit requests
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    There are no pending edit requests at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Request ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                User Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Reason
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Requested By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Requested At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {editRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    #{request.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {request.user_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                {request.email_id}
                                                            </div>
                                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                                ID: #{request.member_id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                                                    <div className="line-clamp-2">{request.reason}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div>
                                                        <div className="font-medium">{request.requested_by_name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                            ID: {request.requested_by}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {formatDate(request.requested_at || request.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditRequestAction(request.id, 'approve')}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                            title="Approve and edit user"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Edit User</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditRequestAction(request.id, 'reject')}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                            title="Reject request"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;