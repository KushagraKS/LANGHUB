import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiMessageSquare, FiUser, FiSearch, FiPlus } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  useEffect(() => {
    fetchChats();
    fetchPartners();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get(`/users/${user.id}/chats`);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await api.get('/users/match/partners');
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const startChat = async (partnerId) => {
    try {
      const response = await api.post('/chats', { partnerId });
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMessageSquare className="inline mr-2" />
            My Chats ({chats.length})
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'partners'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="inline mr-2" />
            Find Partners ({partners.length})
          </button>
        </nav>
      </div>

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-lg shadow">
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chats yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start a conversation with a language partner!</p>
              <button
                onClick={() => setActiveTab('partners')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiPlus className="mr-2" />
                Find Partners
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => {
                const partner = chat.participants.find(p => p._id !== user.id);
                return (
                  <button
                    key={chat._id}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    className="w-full px-6 py-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {partner.avatar ? (
                          <img className="h-12 w-12 rounded-full" src={partner.avatar} alt={partner.name} />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiUser className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {partner.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(chat.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {chat.languagePair.native} ↔ {chat.languagePair.learning}
                          </span>
                        </div>
                        {chat.lastMessage && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div key={partner._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                {partner.avatar ? (
                  <img className="h-16 w-16 rounded-full" src={partner.avatar} alt={partner.name} />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="h-8 w-8 text-primary-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                  {partner.rating.average > 0 && (
                    <p className="text-sm text-gray-500">
                      ⭐ {partner.rating.average.toFixed(1)} ({partner.rating.count})
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Native:</span> {partner.nativeLanguage}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Learning:</span> {partner.learningLanguages.join(', ')}
                </p>
              </div>
              {partner.bio && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{partner.bio}</p>
              )}
              <button
                onClick={() => startChat(partner._id)}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
              >
                Start Chat
              </button>
            </div>
          ))}
          {partners.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
              <p className="mt-1 text-sm text-gray-500">Update your profile to find better matches!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

