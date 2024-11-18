// src/components/home/Profile.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Profile({ profileData, setProfileData, handleInputChange, message, setMessage }) {
    const [showAllergyPopup, setShowAllergyPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [tempAllergies, setTempAllergies] = useState([]);
    const [buttonState, setButtonState] = useState("Update Profile");

    const allergyOptions = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Food Allergy", "Other", "None"];

    useEffect(() => {
        if (showAllergyPopup) {
            setTempAllergies([...profileData.allergies]);
        }
    }, [showAllergyPopup, profileData.allergies]);


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setButtonState("Loading...");
        try {
            const response = await axios.put(`http://localhost:8000/update-profile/${profileData.email}`, {
                name: profileData.name,
                address: profileData.address,
                dob: profileData.dob,
                phone: profileData.phone,
                shirtSize: profileData.shirtSize,
                firstAidCert: profileData.firstAidCert,
                allergies: profileData.allergies,
                foodAllergyDetail: profileData.foodAllergyDetail
            });

            if (response.status === 200) {
                setMessage('Profile updated successfully');
                setButtonState("Updated!");
                setTimeout(() => {
                    setButtonState("Update Profile");
                    setMessage('');
                }, 3000);
            }
        } catch (error) {
            setMessage('Error updating profile');
            setButtonState("Update Profile");
            console.error('Update error:', error);
        }
    };

    const handlePasswordUpdate = () => {
        if (newPassword !== confirmNewPassword) {
            setMessage('New passwords do not match');
            return;
        }
        axios.put(`http://localhost:8000/update-password/${profileData.email}`, { password: newPassword })
            .then(() => {
                setMessage('Password updated successfully!');
                setShowPasswordPopup(false);
            })
            .catch(() => setMessage('Error updating password. Please try again.'));
    };

    const handleAllergyChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setTempAllergies([...tempAllergies, value]);
        } else {
            setTempAllergies(tempAllergies.filter((allergy) => allergy !== value));
        }
    };

    const handleAllergySave = () => {
        setProfileData({ ...profileData, allergies: tempAllergies });
        setShowAllergyPopup(false);
    };
    
    const addressInputRef = useRef(null);

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
    }, [setProfileData]);

    return (
        <form onSubmit={handleProfileUpdate} className="w-full max-w-4xl grid grid-cols-2 gap-8  mb-10">
            {/* Existing fields */}
            <h1 className="col-span-2 text-2xl text-white mb-4 mt-56">Update Profile</h1>
            <div className="col-span-1">
                <label className="block text-white mb-2">Name</label>
                <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>
            <div className="col-span-1">
                <label className="block text-white mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md bg-white"
                    disabled
                />
            </div>

            <div className="col-span-2">
                <label className="block text-white mb-2">Address</label>
                <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                    ref={addressInputRef} 
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">Phone</label>
                <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                />
            </div>
            <div className="col-span-1">
                <label className="block text-white mb-2">Date of Birth</label>
                <input
                    type="date"
                    name="dob"
                    value={profileData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">T-Shirt Size</label>
                <select
                    name="shirtSize"
                    value={profileData.shirtSize || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                >
                    <option value="">Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-white mb-2">First Aid Certified</label>
                <select
                    name="firstAidCert"
                    value={profileData.firstAidCert || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                >
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div className="col-span-2">
                <label className="block text-white mb-2">Allergies</label>
                <button type="button" onClick={() => setShowAllergyPopup(true)} className="bg-white hover:bg-gray-400 text-black p-1 rounded-md">Change Allergies</button>
                {showAllergyPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white p-8 rounded-md shadow-md max-w-lg w-full">
                            <h2 className="text-xl mb-4">Update Allergies</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {allergyOptions.map((option) => (
                                    <label key={option} className="inline-flex items-center text-gray-800">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={tempAllergies.includes(option)}
                                            onChange={handleAllergyChange}
                                            className="form-checkbox"
                                        />
                                        <span className="ml-2">{option}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button onClick={() => setShowAllergyPopup(false)} className="px-4 py-2 bg-red-500 text-white rounded-full">Cancel</button>
                                <button onClick={handleAllergySave} className="px-4 py-2 bg-black text-white rounded-full">Update</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="col-span-2">
                <label className="block text-white mb-2">Password</label>
                <button type="button" onClick={() => setShowPasswordPopup(true)} className="bg-white hover:bg-gray-400 text-black p-1 rounded-md">Change Password</button>
                {showPasswordPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white p-8 rounded-md shadow-md max-w-lg w-full">
                            <h2 className="text-xl mb-4">Update Password</h2>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full mb-4 p-3 border rounded-md"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full mb-4 p-3 border rounded-md"
                            />
                            <div className="flex justify-end gap-4">
                                <button onClick={() => setShowPasswordPopup(false)} className="px-4 py-2 bg-red-500 text-white rounded-full">Cancel</button>
                                <button onClick={handlePasswordUpdate} className="px-4 py-2 bg-black text-white rounded-full">Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="col-span-2 flex justify-center mt-4">
                <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-full transition duration-300 ease-in-out"
                >
                    {buttonState}
                </button>
            </div>

            {message && <p className={`col-span-2 text-center ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'} mt-4`}>{message}</p>}
        </form>
    );
}
