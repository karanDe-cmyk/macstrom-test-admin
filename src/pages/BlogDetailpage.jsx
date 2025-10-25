// src/pages/BlogDetailPage.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaArrowLeft, FaCalendarAlt, FaUser } from "react-icons/fa"

const API_BASE_URL = "https://macstrombattle-api.kglame.com/api/blogs"

export default function BlogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

useEffect(() => {
  if (!id) {
    setError("Invalid blog link");
    setLoading(false);
    return;
  }

  const fetchBlog = async () => {
    try {
      console.log("📡 Fetching blog by ID:", id);
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error("Failed to fetch blog");

      const data = await response.json();
      console.log("✅ Blog API response:", data);

      // If API returns an array, find blog with matching id
      const foundBlog = Array.isArray(data) ? data.find(b => String(b.id) === String(id)) : data;

      if (!foundBlog) {
        setError("Blog not found");
      } else {
        setBlog(foundBlog);
      }
    } catch (err) {
      console.error("❌ Error fetching blog:", err);
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  fetchBlog();
}, [id]);


  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>
  if (!blog) return <div className="text-center p-4">Blog not found</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button className="flex items-center gap-2 mb-4 text-blue-600" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold">{blog.title}</h1>

      <div className="flex items-center gap-4 text-gray-600 text-sm mt-2">
        <span><FaUser className="inline mr-1" /> {blog.author || "Unknown"}</span>
        <span><FaCalendarAlt className="inline mr-1" /> {blog.date || "N/A"}</span>
      </div>
    <h1 className="text-3xl font-bold">{blog.heading}</h1>

<p className="text-gray-600 mt-1">{blog.subheading}</p>
      <img src={blog.thumbnail} alt={blog.title} className="my-6 w-full rounded-lg" />

      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {blog.content}
      </div>
    </div>
  )
}
