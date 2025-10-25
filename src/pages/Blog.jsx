import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Calendar, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// API wrapper
const api = {
  get: (url) => fetch(url).then(res => res.json()).then(data => ({ data })),
  delete: (url) => fetch(url, { method: 'DELETE' }).then(res => res.json()).then(data => ({ data }))
};

const BlogApp = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'view'
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('https://macstrombattle-api.kglame.com/api/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const deleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`https://macstrombattle-api.kglame.com/api/blogs/${id}`);
        setBlogs(blogs.filter(blog => blog.id !== id));
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Header Component
  const Header = () => (
    <div className="bg-slate-800 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {currentView !== 'list' ? (
          <button
            onClick={() => {
              setCurrentView('list');
              setSelectedBlog(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            ← Back to Blogs
          </button>
        ) : (
          <h1 className="text-xl font-semibold">Blog Management</h1>
        )}
        
        {currentView === 'list' && (
          <button
            onClick={() => navigate('/createblog')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Create Blog
          </button>
        )}
      </div>
    </div>
  );

  // Blog Card Component
  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      {blog.thumbnail && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={blog.thumbnail} 
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{calculateReadingTime(blog.content)} min read</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/createblog/edit/${blog.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit blog"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteBlog(blog.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete blog"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{blog.heading}</p>
        
        <button
          onClick={() => {
            setSelectedBlog(blog);
            setCurrentView('view');
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
        >
          Read More
        </button>
      </div>
    </div>
  );

  // Blog View Component
  const BlogView = () => (
    selectedBlog && (
      <div className="max-w-4xl mx-auto p-6">
        {selectedBlog.thumbnail && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={selectedBlog.thumbnail} 
              alt={selectedBlog.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{selectedBlog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(selectedBlog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{calculateReadingTime(selectedBlog.content)} min read</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {selectedBlog.content.split(' ').length} words
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedBlog.title}</h1>
          <h2 className="text-xl text-gray-700 mb-2">{selectedBlog.heading}</h2>
          <h3 className="text-lg text-gray-600 mb-6">{selectedBlog.subheading}</h3>
        </div>
        
        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedBlog.content}</div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(`/createblog/edit/${selectedBlog.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit Blog
          </button>
          <button
            onClick={() => deleteBlog(selectedBlog.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            Delete Blog
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        {currentView === 'list' && (
          <div className="max-w-7xl mx-auto px-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentView === 'view' && <BlogView />}
      </main>
    </div>
  );
};

export default BlogApp;