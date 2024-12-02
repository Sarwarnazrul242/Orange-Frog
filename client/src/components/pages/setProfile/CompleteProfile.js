import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaRuler, FaVenusMars, FaUtensils } from 'react-icons/fa';
import { toast } from 'sonner';
import '../login/loginstyle.css';


function CompleteProfile() {
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [shirtSize, setShirtSize] = useState('');
    const [firstAidCert, setFirstAidCert] = useState('');
    const [allergies, setAllergies] = useState([]);
    const [foodAllergyDetail, setFoodAllergyDetail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const email = Cookies.get('email');
    const addressInputRef = useRef(null);

    const handleAllergyChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAllergies([...allergies, value]);
        } else {
            setAllergies(allergies.filter((allergy) => allergy !== value));
        }
    };

    const handleProfileCompletion = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}/complete-profile`, {
                email,
                address,
                dob,
                phone,
                shirtSize,
                firstAidCert,
                allergies: allergies.includes("Food Allergy") 
                    ? [...allergies, foodAllergyDetail] 
                    : allergies
            });

            if (response.status === 200) {
                toast.success('Profile completed successfully!');
                navigate('/user/dashboard');
            } else {
                setError('Error completing profile');
                toast.error('Error completing profile');
            }
        } catch (error) {
            setError('Error completing profile');
            toast.error('Server error, please try again.');
        }
    };
    
    // Autocomplete address input
    useEffect(() => {
        if (window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });
            
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setAddress(place.formatted_address);
                }
            });
        }
    }, []);

    // Format phone number as (000) 000-0000 and limit to 10 digits
    const handlePhoneChange = (e) => {
        const input = e.target.value.replace(/\D/g, '').slice(0, 10);
        const formattedPhone = input
            .replace(/^(\d{3})(\d)/, '($1) $2')
            .replace(/(\d{3})(\d{1,4})$/, '$1-$2');
        setPhone(formattedPhone);
    };

    return (
        <div className="wrapper">
            <div className="login-box">
                <h2 className="text-2xl font-bold text-center text-white mb-8">Complete Your Profile</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleProfileCompletion} className="grid grid-cols-2 gap-2">
                    {/* Address (Full Row) */}
                    <div className="col-span-2 mb-6">
                        <label className="block text-white mb-2">Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                ref={addressInputRef}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Address"
                                className="w-full pl-8 p-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-6">
                        <label className="block text-white mb-2">Date of Birth <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full pl-8 p-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-6">
                        <label className="block text-white mb-2">Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <FaPhone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="(000) 000-0000"
                                className="w-full pl-8 p-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>

                    {/* T-Shirt Size */}
                    <div className="mb-6">
                        <label className="block text-white mb-2">T-Shirt Size <span className="text-red-500">*</span></label>
                        <select 
                            value={shirtSize} 
                            onChange={(e) => setShirtSize(e.target.value)} 
                            required 
                            className="w-full p-2 border rounded-md"
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

                    {/* First Aid Certified */}
                    <div className="mb-6">
                        <label className="block text-white mb-2">First Aid Certified <span className="text-red-500">*</span></label>
                        <select 
                            value={firstAidCert} 
                            onChange={(e) => setFirstAidCert(e.target.value)} 
                            required 
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    {/* Dietary Restrictions */}
                    <div className="col-span-2 mb-6">
                        <label className="block text-white mb-2">Dietary Restrictions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Food Allergy", "Other", "None"].map((option) => (
                                <label key={option} className="inline-flex items-center text-white">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        onChange={handleAllergyChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">{option}</span>
                                </label>
                            ))}
                        </div>
                        {allergies.includes("Food Allergy") && (
                            <input
                                type="text"
                                value={foodAllergyDetail}
                                onChange={(e) => setFoodAllergyDetail(e.target.value)}
                                placeholder="Specify food allergy"
                                className="mt-2 p-2 border rounded-md w-full"
                            />
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-2  flex justify-center">
                        <button type="submit" className="w-full py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
                            Complete Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfile;