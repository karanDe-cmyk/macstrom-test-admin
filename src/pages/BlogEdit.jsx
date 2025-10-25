import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft, FaEdit, FaSave, FaImage } from "react-icons/fa"

export default function EditBlogPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: "",
    heading: "",
    subHeading: "",
    author: "",
    date: "",
    content: "",
    thumbnail: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  useEffect(() => {
    const savedBlogs = localStorage.getItem("blogs")
    if (savedBlogs) {
      const blogs = JSON.parse(savedBlogs)
      const blog = blogs.find((b) => b.id === id)
      if (blog) {
        setFormData(blog)
        if (blog.thumbnail) {
          setThumbnailPreview(blog.thumbnail)
        }
      }
    }
    setLoading(false)
  }, [id])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    else if (formData.title.length < 10) newErrors.title = "Title must be at least 10 characters"
    else if (formData.title.length > 70) newErrors.title = "Title must not exceed 70 characters"

    if (!formData.heading.trim()) newErrors.heading = "Heading is required"
    else if (formData.heading.length < 40) newErrors.heading = "Heading must be at least 40 characters"
    else if (formData.heading.length > 80) newErrors.heading = "Heading must not exceed 80 characters"

    if (formData.subHeading.trim() && formData.subHeading.length >= formData.heading.length)
      newErrors.subHeading = "Sub heading should be shorter than the main heading"

    if (!formData.author.trim()) newErrors.author = "Author name is required"
    if (!formData.date) newErrors.date = "Date is required"

    const wordCount = formData.content.trim().split(/\s+/).filter((word) => word.length > 0).length
    if (!formData.content.trim()) newErrors.content = "Content is required"
    else if (wordCount < 200) newErrors.content = `Content must be at least 200 words (current: ${wordCount})`
    else if (wordCount > 1500) newErrors.content = `Content must not exceed 1500 words (current: ${wordCount})`

    if (!thumbnailPreview && !formData.thumbnail) newErrors.thumbnail = "Thumbnail image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) return setErrors((prev) => ({ ...prev, thumbnail: "Please select a valid image file" }))
      if (file.size > 5 * 1024 * 1024) return setErrors((prev) => ({ ...prev, thumbnail: "Image size should be less than 5MB" }))

      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
        setFormData((prev) => ({ ...prev, thumbnail: e.target.result }))
      }
      reader.readAsDataURL(file)
      if (errors.thumbnail) setErrors((prev) => ({ ...prev, thumbnail: undefined }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const existingBlogs = JSON.parse(localStorage.getItem("blogs") || "[]")
      const updatedBlogs = existingBlogs.map((blog) =>
        blog.id === id ? { ...blog, ...formData, updatedAt: Date.now() } : blog
      )
      localStorage.setItem("blogs", JSON.stringify(updatedBlogs))
      navigate("/") // Redirect to blog list
    } catch (error) {
      console.error("Error updating blog:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600">Loading blog...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-600 text-white font-semibold rounded-lg hover:bg-white hover:text-slate-900 transition-all duration-200"
          >
            <FaArrowLeft className="text-sm" /> Back to Blogs
          </button>
          <h1 className="text-4xl font-bold">Edit Blog</h1>
        </div>
      </header>

      {/* Form */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-slate-100">
              <FaEdit className="text-2xl text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-800">Edit Blog Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thumbnail */}
              <div className="space-y-2">
                <label htmlFor="thumbnail" className="block font-semibold text-slate-700">
                  Thumbnail Image *
                </label>
                <div className="mt-2">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="thumbnail"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 text-center gap-2"
                  >
                    <FaImage className="text-3xl text-slate-400 group-hover:text-indigo-500 transition-colors duration-300" />
                    <span className="font-semibold text-slate-700 text-base">Click to upload new image</span>
                    <small className="text-slate-500 text-sm">PNG, JPG, GIF up to 5MB</small>
                  </label>
                </div>
                {errors.thumbnail && <div className="text-red-500 text-sm font-medium">{errors.thumbnail}</div>}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Thumbnail preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200"
                    />
                    {thumbnailFile && (
                      <p className="mt-2 text-center text-sm font-medium text-indigo-600">{thumbnailFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="flex justify-between items-center font-semibold text-slate-700">
                  Blog Title *
                  <span className="text-sm text-slate-500 font-normal">({formData.title.length}/70 characters)</span>
                </label>
                <input
                  id="title"
                  placeholder="Enter your blog title (10-70 characters)"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white ${
                    errors.title
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                  maxLength={70}
                />
                {errors.title && <div className="text-red-500 text-sm font-medium">{errors.title}</div>}
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <label htmlFor="heading" className="flex justify-between items-center font-semibold text-slate-700">
                  Blog Heading *
                  <span className="text-sm text-slate-500 font-normal">({formData.heading.length}/80 characters)</span>
                </label>
                <input
                  id="heading"
                  placeholder="Enter your blog heading (40-80 characters)"
                  value={formData.heading}
                  onChange={(e) => handleInputChange("heading", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white ${
                    errors.heading
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                  maxLength={80}
                />
                {errors.heading && <div className="text-red-500 text-sm font-medium">{errors.heading}</div>}
              </div>

              {/* Sub Heading */}
              <div className="space-y-2">
                <label htmlFor="subHeading" className="flex justify-between items-center font-semibold text-slate-700">
                  Blog Sub Heading
                  <span className="text-sm text-slate-500 font-normal">
                    ({formData.subHeading.length} characters - should be less than heading)
                  </span>
                </label>
                <input
                  id="subHeading"
                  placeholder="Enter your blog sub heading (optional)"
                  value={formData.subHeading}
                  onChange={(e) => handleInputChange("subHeading", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white ${
                    errors.subHeading
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.subHeading && <div className="text-red-500 text-sm font-medium">{errors.subHeading}</div>}
              </div>

              {/* Author and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="author" className="block font-semibold text-slate-700">
                    Author Name *
                  </label>
                  <input
                    id="author"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white ${
                      errors.author
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.author && <div className="text-red-500 text-sm font-medium">{errors.author}</div>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="date" className="block font-semibold text-slate-700">
                    Publication Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white ${
                      errors.date
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.date && <div className="text-red-500 text-sm font-medium">{errors.date}</div>}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="flex justify-between items-center font-semibold text-slate-700">
                  Blog Content *
                  <span className="text-sm text-slate-500 font-normal">
                    ({getWordCount(formData.content)} words - 200-1500 required)
                  </span>
                </label>
                <textarea
                  id="content"
                  placeholder="Write your blog content here... (minimum 200 words, maximum 1500 words)"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-200 bg-slate-50 focus:outline-none focus:bg-white resize-y min-h-[200px] font-inherit ${
                    errors.content
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                  rows={12}
                />
                {errors.content && <div className="text-red-500 text-sm font-medium">{errors.content}</div>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4 border-t-2 border-slate-100">
                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="text-sm" />
                  {isSubmitting ? "Updating..." : "Update Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
