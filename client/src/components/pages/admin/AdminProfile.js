import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { HoverBorderGradient } from "../../ui/hover-border-gradient";
import { AuthContext } from "../../../AuthContext";

export default function AdminProfile() {
    const [profileData, setProfileData] = useState({
        email: '',
        address: '',
    });

    const [originalProfileData, setOriginalProfileData] = useState({});
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const { auth } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            if (!auth.email) {
                console.error("Admin email is missing in AuthContext.");
                return;
            }
    
            console.log(`Fetching Admin Profile for: ${auth.email}`); // 🔹 Debugging Log
    
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND}/admin-profile/${auth.email}`);
                if (!response.ok) {
                    console.error(`Failed to fetch admin profile. Status: ${response.status}`);
                    throw new Error(`HTTP Error: ${response.status}`);
                }
    
                const data = await response.json();
                setProfileData({ email: data.email || '', address: data.address || '' });
            } catch (error) {
                console.error("Error fetching admin profile:", error);
                toast.error("Failed to load admin profile.");
            }
        };
    
        if (auth.email) {
            fetchAdminProfile();
        }
    }, [auth.email]);
    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/update-admin-profile/${auth.email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                toast.success('Profile updated successfully.');
            } else {
                toast.error('Failed to update profile.');
            }
        } catch (error) {
            toast.error('Error updating profile.');
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/update-admin-profile/${auth.email}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (response.ok) {
                toast.success('Password updated successfully.');
                setShowPasswordPopup(false);
            } else {
                toast.error('Error updating password.');
            }
        } catch (error) {
            toast.error('Error updating password.');
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-gray-100 dark:bg-neutral-900 pt-8">
            <form onSubmit={handleProfileUpdate} className="w-full max-w-3xl p-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Admin Profile</h1>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-neutral-600 dark:text-neutral-400 text-sm">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                    />
                </div>

                {/* Address */}
                <div className="mb-4">
                    <label className="block text-neutral-600 dark:text-neutral-400 text-sm">Company Address (Used for Invoices)</label>
                    <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                </div>

                {/* Change Password Button */}
                <div className="mb-6">
                    <label className="block text-neutral-600 dark:text-neutral-400 text-sm">Reset Password</label>
                    <button 
                        type="button" 
                        onClick={() => setShowPasswordPopup(true)}
                        className="px-4 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors"
                    >
                        Change Password
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <HoverBorderGradient>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex items-center justify-center gap-2 px-4 mt-0 py-4 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] h-[15px]"
                        >
                            {isLoading ? "Updating..." : "Update Profile"}
                        </button>
                    </HoverBorderGradient>
                </div>
            </form>

            {/* Password Popup */}
            {showPasswordPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg w-full border border-neutral-200 dark:border-neutral-700">
                        <h2 className="text-xl text-neutral-900 dark:text-white mb-4">Update Password</h2>

                        {/* Current Password */}
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-3 mb-4 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />

                        {/* New Password */}
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 mb-4 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />

                        {/* Confirm New Password */}
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full p-3 mb-6 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowPasswordPopup(false)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handlePasswordUpdate}
                                className="px-4 py-2 bg-black text-white rounded-lg"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}