import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'sonner';
import { HoverBorderGradient } from "../../ui/hover-border-gradient";
import { AuthContext } from "../../../AuthContext";

export default function Profile() {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        address: '',
        dob: '',
        phone: '',
        shirtSize: '',
        firstAidCert: '',
        allergies: [],
        password: '',
        hourlyRate: '',
    });
    // const [message, setMessage] = useState('');
    const [showAllergyPopup, setShowAllergyPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [tempAllergies, setTempAllergies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { auth } = useContext(AuthContext);
    const [originalProfileData, setOriginalProfileData] = useState({});

    const allergyOptions = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Food Allergy", "Other", "None"];
    const addressInputRef = useRef(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND}/user-profile/${auth.email}`);
                const data = await response.json();
                
                const formattedDob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
                
                const profileData = {
                    name: data.name || '',
                    email: data.email || '',
                    address: data.address || '',
                    dob: formattedDob || '',
                    phone: data.phone || '',
                    shirtSize: data.shirtSize || '',
                    firstAidCert: data.firstAidCert || '',
                    allergies: data.allergies || [],
                    password: '',
                    hourlyRate: data.hourlyRate || '',
                };
                
                setProfileData(profileData);
                setOriginalProfileData(profileData);
                setTempAllergies(data.allergies || []);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        if (auth.email) {
            fetchUserProfile();
        }
    }, [auth.email]);

    useEffect(() => {
        if (window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setProfileData((prevData) => ({ ...prevData, address: place.formatted_address }));
                }
            });
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        const hasChanges = Object.keys(profileData).some(key => {
            if (key === 'password') return false;
            return profileData[key] !== originalProfileData[key];
        });

        if (!hasChanges) {
            toast.error('No changes detected');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/update-profile/${profileData.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                toast.success('Profile updated successfully');
                setOriginalProfileData({...profileData});
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
            console.error('Update error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/update-profile/${profileData.email}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password updated successfully');
                setShowPasswordPopup(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                toast.error(data.message || 'Error updating password');
            }
        } catch (error) {
            toast.error('Error updating password');
            console.error('Password update error:', error);
        }
    };

    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    });

    const togglePasswordVisibility = (field) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };
    

    const handleAllergyChange = (e) => {
        const { value, checked } = e.target;
        setTempAllergies(prev => {
            if (checked) {
                return [...prev, value];
            } else {
                return prev.filter((allergy) => allergy !== value);
            }
        });
    };

    const handleAllergySave = () => {
        setProfileData(prev => ({ ...prev, allergies: tempAllergies }));
        setShowAllergyPopup(false);
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-gray-100 dark:bg-neutral-900 pt-8">
            <form onSubmit={handleProfileUpdate} className="w-full max-w-4xl grid grid-cols-2 gap-8 self-start mb-10 p-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
                <h1 className="col-span-2 text-3xl font-bold text-neutral-900 dark:text-white mb-2">Update Profile</h1>
                <hr className="col-span-2 border-neutral-200 dark:border-neutral-700 mb-6" />

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        disabled
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Hourly Rate</label>
                    <input
                        type="text"
                        name="hourlyRate"
                        value={`$${profileData.hourlyRate || '0'}/hour`}
                        className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                        disabled
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        ref={addressInputRef}
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={profileData.dob}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">T-Shirt Size</label>
                    <select
                        name="shirtSize"
                        value={profileData.shirtSize || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                        <option value="" className="bg-white dark:bg-neutral-900">Select Size</option>
                        {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map(size => (
                            <option key={size} value={size} className="bg-white dark:bg-neutral-900">{size}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">First Aid Certified</label>
                    <select
                        name="firstAidCert"
                        value={profileData.firstAidCert || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                        <option value="" className="bg-white dark:bg-neutral-900">Select Option</option>
                        <option value="Yes" className="bg-white dark:bg-neutral-900">Yes</option>
                        <option value="No" className="bg-white dark:bg-neutral-900">No</option>
                    </select>
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Allergies</label>
                    <button 
                        type="button" 
                        onClick={() => setShowAllergyPopup(true)}
                        className="px-4 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors"
                    >
                        Change Allergies
                    </button>
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-2 text-sm">Password</label>
                    <button 
                        type="button" 
                        onClick={() => setShowPasswordPopup(true)}
                        className="px-4 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors"
                    >
                        Change Password
                    </button>
                </div>

                {showAllergyPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
                        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg w-full border border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-xl text-neutral-900 dark:text-white mb-10">Update Allergies</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {allergyOptions.map((option) => (
                                    <label key={option} className="inline-flex items-center text-neutral-300">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={tempAllergies.includes(option)}
                                            onChange={handleAllergyChange}
                                            className="form-checkbox bg-neutral-800 border-neutral-700 text-blue-500"
                                        />
                                        <span className="ml-2">{option}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowAllergyPopup(false)}
                                    className="px-4 py-2 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAllergySave}
                                    className="px-4 py-2 bg-black text-white rounded-lg transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPasswordPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
                        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg w-full border border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-xl text-neutral-900 dark:text-white mb-4">Update Password</h2>

                            {/* Current Password */}
                            <div className="relative mb-4">
                                <input
                                    type={showPassword.currentPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                                <span
                                    className="absolute right-3 top-3 cursor-pointer text-neutral-400"
                                    onClick={() => togglePasswordVisibility("currentPassword")}
                                >
                                    {showPassword.currentPassword ? (
                                        <ion-icon name="eye-off"></ion-icon>
                                    ) : (
                                        <ion-icon name="eye"></ion-icon>
                                    )}
                                </span>
                            </div>

                            {/* New Password */}
                            <div className="relative mb-4">
                                <input
                                    type={showPassword.newPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                                <span
                                    className="absolute right-3 top-3 cursor-pointer text-neutral-400"
                                    onClick={() => togglePasswordVisibility("newPassword")}
                                >
                                    {showPassword.newPassword ? (
                                        <ion-icon name="eye-off"></ion-icon>
                                    ) : (
                                        <ion-icon name="eye"></ion-icon>
                                    )}
                                </span>
                            </div>

                            {/* Confirm New Password */}
                            <div className="relative mb-4">
                                <input
                                    type={showPassword.confirmNewPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                                <span
                                    className="absolute right-3 top-3 cursor-pointer text-neutral-400"
                                    onClick={() => togglePasswordVisibility("confirmNewPassword")}
                                >
                                    {showPassword.confirmNewPassword ? (
                                        <ion-icon name="eye-off"></ion-icon>
                                    ) : (
                                        <ion-icon name="eye"></ion-icon>
                                    )}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordPopup(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmNewPassword('');
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePasswordUpdate}
                                    className="px-4 py-2 bg-black text-white rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="col-span-2 flex justify-center mt-6">
                    <HoverBorderGradient>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex items-center justify-center gap-2 px-4 py-[2px] bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] h-[15px]"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-white text-sm">Updating...</span>
                                </>
                            ) : (
                                <span className="text-white text-sm mb-4">Update Profile</span>
                            )}
                        </button>
                    </HoverBorderGradient>
                </div>
            </form>
        </div>
    );
}