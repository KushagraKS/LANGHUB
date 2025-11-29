import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageSquare, FiUsers, FiBook, FiGlobe } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect. Learn. Exchange.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Practice languages with native speakers in real-time
            </p>
            {!user && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
                >
                  Sign In
                </Link>
              </div>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why LangHub?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg bg-white shadow-md">
            <FiMessageSquare className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Practice with native speakers through instant messaging
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white shadow-md">
            <FiUsers className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              Find perfect language exchange partners based on your needs
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white shadow-md">
            <FiBook className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
            <p className="text-gray-600">
              Access curated resources to enhance your learning
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white shadow-md">
            <FiGlobe className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Languages</h3>
            <p className="text-gray-600">
              Support for dozens of languages worldwide
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Set your native language and the languages you want to learn
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Find Partners</h3>
              <p className="text-gray-600">
                Discover native speakers learning your language
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Start Practicing</h3>
              <p className="text-gray-600">
                Chat in real-time and help each other improve
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

