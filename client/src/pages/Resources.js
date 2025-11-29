import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiBook, FiHeart, FiFilter, FiSearch } from 'react-icons/fi';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.language) params.append('language', filters.language);
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/resources?${params.toString()}`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (resourceId) => {
    try {
      const response = await api.patch(`/resources/${resourceId}/like`);
      setResources(resources.map(r => 
        r._id === resourceId 
          ? { ...r, likes: response.data.likes, liked: response.data.liked }
          : r
      ));
    } catch (error) {
      console.error('Error liking resource:', error);
    }
  };

  const categories = ['grammar', 'vocabulary', 'pronunciation', 'culture', 'idioms', 'exercises'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FiBook />
          <span>Learning Resources</span>
        </h1>
        <p className="text-gray-600 mt-2">Curated resources to enhance your language learning</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <FiBook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    {resource.category}
                  </span>
                  <span className="ml-2 inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {resource.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => handleLike(resource._id)}
                  className={`p-2 rounded-full transition ${
                    resource.liked ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <FiHeart className={resource.liked ? 'fill-current' : ''} />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{resource.language}</span>
                <div className="flex items-center space-x-2">
                  <FiHeart className="text-gray-400" />
                  <span>{resource.likes?.length || 0}</span>
                </div>
              </div>

              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Resource →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;

