import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  userRole 
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (userRole === "Admin" && !reason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }
    onConfirm(user.member_id, reason);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-96 mx-4 transform transition-all">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userRole === "SuperAdmin" ? "Delete User" : "Request User Deletion"}
          </h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {userRole === "SuperAdmin" 
              ? `Are you sure you want to delete ${user?.user_name}?`
              : `Are you sure you want to request deletion for ${user?.user_name}?`
            }
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-400 mb-1">
              <strong>Member ID:</strong> #{user?.member_id}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {userRole === "SuperAdmin" 
                ? "This action cannot be undone."
                : "This will send a deletion request to super admin."
              }
            </p>
          </div>

          {userRole === "Admin" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for deletion *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="Please provide reason for deletion request"
                rows="3"
                required
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            {userRole === "SuperAdmin" ? "Delete User" : "Request Deletion"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;