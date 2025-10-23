import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { FaArrowLeft, FaUpload, FaSave, FaImage, FaEdit } from "react-icons/fa"

// Axios wrapper for API calls (since axios is not available)
const api = {
  get: (url) => fetch(url).then(res => res.json()).then(data => ({ data })),
  post: (url, data) => fetch(url, { 
    method: 'POST', 
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(data => ({ data })),
  put: (url, data) => fetch(url, { 
    method: 'PUT', 
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(data => ({ data }))
}

export default function CreateBlogPage() {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode
  const location = useLocation()
  const isEditMode = Boolean(id) || location.pathname.includes('/edit')
  
  const [formData, setFormData] = useState({
    title: "",
    heading: "",
    subHeading: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    thumbnail: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  // Fetch blog data for editing
  const fetchBlogForEdit = async (blogId) => {
    setIsLoading(true)
    try {
      const response = await api.get(`https://macstrombattle-api.kglame.com/api/blogs/${blogId}`)
      const blog = response.data
      
      setFormData({
        title: blog.title || "",
        heading: blog.heading || "",
        subHeading: blog.subheading || "",
        author: blog.author || "",
        date: blog.date ? new Date(blog.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        content: blog.content || "",
        thumbnail: blog.thumbnail || "",
      })
      
      if (blog.thumbnail) {
        setThumbnailPreview(blog.thumbnail)
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isEditMode && id) {
      fetchBlogForEdit(id)
    }
  }, [isEditMode, id])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters"
    } else if (formData.title.length > 70) {
      newErrors.title = "Title must not exceed 70 characters"
    }

    if (!formData.heading.trim()) {
      newErrors.heading = "Heading is required"
    } else if (formData.heading.length < 40) {
      newErrors.heading = "Heading must be at least 40 characters"
    } else if (formData.heading.length > 80) {
      newErrors.heading = "Heading must not exceed 80 characters"
    }

    if (formData.subHeading.trim() && formData.subHeading.length >= formData.heading.length) {
      newErrors.subHeading = "Sub heading should be shorter than the main heading"
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author name is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    const wordCount = formData.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    } else if (wordCount < 200) {
      newErrors.content = `Content must be at least 200 words (current: ${wordCount})`
    } else if (wordCount > 1500) {
      newErrors.content = `Content must not exceed 1500 words (current: ${wordCount})`
    }

    // For create mode, thumbnail is required. For edit mode, it's optional if already exists
    if (!isEditMode && !thumbnailFile && !formData.thumbnail) {
      newErrors.thumbnail = "Thumbnail image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, thumbnail: "Please select a valid image file" }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, thumbnail: "Image size should be less than 5MB" }))
        return
      }

      setThumbnailFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
        setFormData((prev) => ({ ...prev, thumbnail: e.target.result }))
      }
      reader.readAsDataURL(file)

      if (errors.thumbnail) {
        setErrors((prev) => ({ ...prev, thumbnail: undefined }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      
      // Append all form fields
      submitFormData.append('title', formData.title)
      submitFormData.append('heading', formData.heading)
      submitFormData.append('subheading', formData.subHeading)
      submitFormData.append('author', formData.author)
      submitFormData.append('date', formData.date)
      submitFormData.append('content', formData.content)
      
      // Handle thumbnail
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      } else if (formData.thumbnail && !isEditMode) {
        submitFormData.append('thumbnail', formData.thumbnail)
      }

      if (isEditMode) {
        // Update existing blog
        await api.put(`https://macstrombattle-api.kglame.com/api/blogs/${id}`, submitFormData)
        console.log("Blog updated successfully")
      } else {
        // Create new blog
        await api.post('https://macstrombattle-api.kglame.com/api/blogs', submitFormData)
        console.log("Blog created successfully")
      }

      // Navigate back to blogs list
      navigate("/blogs")
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} blog:`, error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading blog data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <button
              onClick={() => navigate("/blogs")}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-600 text-white font-semibold rounded-lg hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              <FaArrowLeft className="text-sm" />
              Back to Blogs
            </button>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2 text-white">
                {isEditMode ? 'Edit Blog' : 'Create New Blog'}
              </h1>
              <p className="text-lg text-slate-200">
                {isEditMode ? 'Update your blog post' : 'Share your thoughts with the world'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-slate-100">
              {isEditMode ? (
                <FaEdit className="text-2xl text-indigo-600" />
              ) : (
                <FaUpload className="text-2xl text-indigo-600" />
              )}
              <h2 className="text-2xl font-bold text-slate-800">
                {isEditMode ? 'Edit Blog Details' : 'Blog Details'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thumbnail */}
              <div className="space-y-2">
                <label htmlFor="thumbnail" className="block font-semibold text-slate-700">
                  Thumbnail Image {!isEditMode && '*'}
                </label>
                <div className="mt-2">
                  <input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                  <label
                    htmlFor="thumbnail"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 text-center gap-2"
                  >
                    <FaImage className="text-3xl text-slate-400 group-hover:text-indigo-500 transition-colors duration-300" />
                    <span className="font-semibold text-slate-700 text-base">
                      {isEditMode ? 'Click to update image' : 'Click to upload image'}
                    </span>
                    <small className="text-slate-500 text-sm">PNG, JPG, GIF up to 5MB</small>
                  </label>
                </div>
                {errors.thumbnail && <div className="text-red-500 text-sm font-medium">{errors.thumbnail}</div>}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-indigo-600">
                      {thumbnailFile?.name || 'Current thumbnail'}
                    </p>
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

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/blogs")}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="text-sm" />
                  {isSubmitting 
                    ? (isEditMode ? "Updating..." : "Publishing...") 
                    : (isEditMode ? "Update Blog" : "Publish Blog")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
