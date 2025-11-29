import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiUser, FiMail, FiGlobe, FiSave, FiEdit2 } from 'react-icons/fi';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nativeLanguage: '',
    learningLanguages: [],
    bio: '',
    interests: []
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nativeLanguage: user.nativeLanguage || '',
        learningLanguages: user.learningLanguages || [],
        bio: user.bio || '',
        interests: user.interests || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLanguageToggle = (language) => {
    setFormData({
      ...formData,
      learningLanguages: formData.learningLanguages.includes(language)
        ? formData.learningLanguages.filter(l => l !== language)
        : [...formData.learningLanguages, language]
    });
  };

  const handleInterestAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        interests: [...formData.interests, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  const handleInterestRemove = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/users/${user.id}`, formData);
      updateUser(response.data);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <FiEdit2 />
              <span>Edit</span>
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline mr-2" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <p className="text-gray-600">{formData.email}</p>
            </div>

            {/* Native Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiGlobe className="inline mr-2" />
                Native Language
              </label>
              {editing ? (
                <select
                  name="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{formData.nativeLanguage}</p>
              )}
            </div>

            {/* Learning Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages I Want to Learn
              </label>
              {editing ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {LANGUAGES.filter(lang => lang !== formData.nativeLanguage).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                        formData.learningLanguages.includes(lang)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.learningLanguages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {editing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap">{formData.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests
              </label>
              {editing ? (
                <div>
                  <input
                    type="text"
                    onKeyPress={handleInterestAdd}
                    placeholder="Type an interest and press Enter"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{interest}</span>
                        <button
                          type="button"
                          onClick={() => handleInterestRemove(interest)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.length > 0 ? (
                    formData.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Rating */}
            {user.rating && user.rating.average > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <p className="text-gray-900">
                  ⭐ {user.rating.average.toFixed(1)} ({user.rating.count} reviews)
                </p>
              </div>
            )}

            {editing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  <FiSave />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      nativeLanguage: user.nativeLanguage || '',
                      learningLanguages: user.learningLanguages || [],
                      bio: user.bio || '',
                      interests: user.interests || []
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

