import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import MultiSelect from './MultiSelect'; // Import MultiSelect if needed

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get user ID from URL
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hourlyRate: "",
    address: "",
    phone: "",
    dob: "",
    shirtSize: "",
    firstAidCert: "",
    allergies: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/email/${id}`);
        setFormData(response.data);
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/update-user/${id}`, formData);
      toast.success("User updated successfully");
      navigate("/admin/manage-users");
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Edit User</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-800 rounded-lg shadow-xl p-8 space-y-8"
      >
        <div>
          <label className="block text-neutral-200 text-lg font-bold mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-neutral-200 text-lg font-bold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
            required
          />
        </div>

        {/* Add similar input fields for other user attributes here */}
        <div>
          <label className="block text-neutral-200 text-lg font-bold mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/manage-users")}
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
} 