"use client"

/* eslint-disable react/jsx-no-target-blank */
import { useState, useEffect } from "react"
import { Plus, X, Upload, Edit, Trash2, Loader, Settings, Save } from "lucide-react"
import axiosInstance from "../utils/axios"

// Functionality, data flow, and handlers remain unchanged.

const AdminPanel = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [showFeaturesManager, setShowFeaturesManager] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Default features that come with the system
  const defaultFeatures = {
    soloGames: "Solo Games",
    basicGameModes: "Basic Game Modes",
    communityAccess: "Community Access",
    duoSquadGames: "Duo/Squad Games",
    streamingVideos: "Streaming Videos",
    streamingVideosHD: "Streaming Videos HD",
    megaContests: "Mega Contests",
  }

  // Available features that can be used across all plans - loaded from memory
  const [availableFeatures, setAvailableFeatures] = useState(() => {
    const savedFeatures = JSON.parse(sessionStorage.getItem("adminAvailableFeatures") || "null")
    return savedFeatures || defaultFeatures
  })

  // State for managing features
  const [newFeatureKey, setNewFeatureKey] = useState("")
  const [newFeatureLabel, setNewFeatureLabel] = useState("")
  const [editingFeature, setEditingFeature] = useState(null)

  const [formData, setFormData] = useState({
    planName: "",
    price: "",
    duration: "monthly",
    description: "",
    image: null,
    features: {},
  })

  // Initialize features object based on available features
  const initializeFeatures = () => {
    const features = {}
    Object.keys(availableFeatures).forEach((key) => {
      features[key] = false
    })
    return features
  }

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/subscriptions')

      if (response.data.success) {
        setPlans(response.data.data)
        setError(null)
      } else {
        setError("Failed to fetch plans")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load plans on component mount
  useEffect(() => {
    fetchPlans()
    loadAvailableFeatures()
  }, [])

  // Save features to persistent storage whenever they change
  useEffect(() => {
    sessionStorage.setItem("adminAvailableFeatures", JSON.stringify(availableFeatures))
    // saveFeaturesToAPI(availableFeatures) // Placeholder for production
  }, [availableFeatures])

  // Load available features from API or persistent storage
  const loadAvailableFeatures = async () => {
    try {
      const savedFeatures = JSON.parse(sessionStorage.getItem("adminAvailableFeatures") || "null")
      if (savedFeatures) {
        setAvailableFeatures(savedFeatures)
      }
    } catch (err) {
      console.error("Failed to load features:", err)
      setAvailableFeatures(defaultFeatures)
    }
  }

  // Save features to API (placeholder function)
  const saveFeaturesToAPI = async (_features) => {
    try {
      // Implement API call if needed
    } catch (err) {
      console.error("Failed to save features to API:", err)
    }
  }

  const openAddPlanPopup = () => {
    setEditingPlan(null)
    setFormData({
      planName: "",
      price: "",
      duration: "monthly",
      description: "",
      image: null,
      features: initializeFeatures(),
    })
    setShowPopup(true)
  }

  const openEditPlanPopup = (plan) => {
    setEditingPlan(plan.id)
    const planFeatures = initializeFeatures()

    Object.keys(planFeatures).forEach((key) => {
      if (plan.features && Object.prototype.hasOwnProperty.call(plan.features, key)) {
        planFeatures[key] = plan.features[key]
      }
    })

    setFormData({
      planName: plan.planName,
      price: plan.price,
      duration: plan.duration,
      description: Array.isArray(plan.description) ? plan.description.join("\n") : plan.description || "",
      image: null,
      features: planFeatures,
    })
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
    setEditingPlan(null)
  }

  // Features Management Functions
  const addNewFeature = () => {
    if (!newFeatureKey.trim() || !newFeatureLabel.trim()) {
      alert("Please enter both feature key and label")
      return
    }

    const normalized = newFeatureKey.trim().replace(/\s+/g, "")
    const camelCaseKey = normalized.charAt(0).toLowerCase() + normalized.slice(1)

    if (Object.prototype.hasOwnProperty.call(availableFeatures, camelCaseKey)) {
      alert("This feature key already exists")
      return
    }

    setAvailableFeatures((prev) => ({
      ...prev,
      [camelCaseKey]: newFeatureLabel.trim(),
    }))

    if (showPopup) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [camelCaseKey]: false,
        },
      }))
    }

    setNewFeatureKey("")
    setNewFeatureLabel("")
  }

  const deleteFeature = (featureKey) => {
    if (!window.confirm(`Are you sure you want to delete the feature "${availableFeatures[featureKey]}"?`)) {
      return
    }

    const updatedFeatures = { ...availableFeatures }
    delete updatedFeatures[featureKey]
    setAvailableFeatures(updatedFeatures)

    if (showPopup) {
      const updatedFormFeatures = { ...formData.features }
      delete updatedFormFeatures[featureKey]
      setFormData((prev) => ({
        ...prev,
        features: updatedFormFeatures,
      }))
    }
  }

  const startEditFeature = (featureKey) => {
    setEditingFeature({
      key: featureKey,
      originalKey: featureKey,
      label: availableFeatures[featureKey],
    })
  }

  const saveEditFeature = () => {
    if (!editingFeature.key.trim() || !editingFeature.label.trim()) {
      alert("Please enter both feature key and label")
      return
    }

    const normalized = editingFeature.key.trim().replace(/\s+/g, "")
    const camelCaseKey = normalized.charAt(0).toLowerCase() + normalized.slice(1)

    if (
      camelCaseKey !== editingFeature.originalKey &&
      Object.prototype.hasOwnProperty.call(availableFeatures, camelCaseKey)
    ) {
      alert("This feature key already exists")
      return
    }

    const updatedFeatures = { ...availableFeatures }

    if (camelCaseKey !== editingFeature.originalKey) {
      delete updatedFeatures[editingFeature.originalKey]
      updatedFeatures[camelCaseKey] = editingFeature.label.trim()

      if (showPopup) {
        const updatedFormFeatures = { ...formData.features }
        updatedFormFeatures[camelCaseKey] = updatedFormFeatures[editingFeature.originalKey] || false
        delete updatedFormFeatures[editingFeature.originalKey]

        setFormData((prev) => ({
          ...prev,
          features: updatedFormFeatures,
        }))
      }
    } else {
      updatedFeatures[camelCaseKey] = editingFeature.label.trim()
    }

    setAvailableFeatures(updatedFeatures)
    setEditingFeature(null)
  }

  const cancelEditFeature = () => {
    setEditingFeature(null)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const handleFeatureToggle = (featureKey) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [featureKey]: !formData.features[featureKey],
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.planName.trim() || !formData.price) {
      alert("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("planName", formData.planName)
      formDataToSend.append("price", Number.parseInt(formData.price))
      formDataToSend.append("duration", formData.duration)

      if (formData.description.trim()) {
        const descriptionArray = formData.description.split("\n").filter((line) => line.trim())
        formDataToSend.append("description", JSON.stringify(descriptionArray))
      }

      formDataToSend.append("features", JSON.stringify(formData.features))

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      let response

      if (editingPlan) {
        response = await axiosInstance.put(`/subscriptions/${editingPlan}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        response = await axiosInstance.post('/subscriptions', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      if (editingPlan) {
        // Update the plan in-place (preserve array order)
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === editingPlan ? { ...plan, ...response.data.data } : plan
          )
        )
      } else {
        // Add new plan at the end (or start, depending on your preference)
        setPlans((prev) => [...prev, response.data.data])
      }

      closePopup()
    } catch (err) {
      console.error("Submit error:", err)
      alert(`Error: ${err.response?.data?.message || "Failed to save plan"}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return
    }

    try {
      await axiosInstance.delete(`/subscriptions/${planId}`)
      await fetchPlans()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete plan")
    }
  }

  const renderPlanFeatures = (features) => {
    return Object.entries(availableFeatures).map(([key, displayName]) => (
      <div key={key} className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ring-1 ring-inset ${
            features[key] ? "bg-green-100 text-green-700 ring-green-200" : "bg-gray-100 text-gray-400 ring-gray-200"
          }`}
          aria-label={`${displayName}: ${features[key] ? "Included" : "Not included"}`}
          title={features[key] ? "Included" : "Not included"}
        >
          {features[key] ? "✓" : "×"}
        </div>
        <span className={`text-sm ${features[key] ? "text-gray-900" : "text-gray-500"}`}>{displayName}</span>
      </div>
    ))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center" role="status" aria-live="polite">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPlans}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-200 p-4 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">Subscription Plans</h1>
              <p className="text-gray-600 mt-1">Manage your subscription plans and pricing</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFeaturesManager(true)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2"
                aria-label="Manage Features"
                title="Manage Features"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">Manage Features</span>
              </button>
              <button
                onClick={openAddPlanPopup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Add New Plan"
                title="Add New Plan"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Add New Plan</span>
              </button>
            </div>
          </div>
        </header>

        {/* Plans Grid */}
        <section aria-label="Plans" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              aria-labelledby={`plan-${plan.id}-title`}
            >
              {/* Plan Image */}
              <div className="h-44 bg-gray-100 rounded-t-2xl overflow-hidden">
                {plan.imageUrl ? (
                  <img
                    src={plan.imageUrl || "/placeholder.svg"}
                    alt={plan.planName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload size={44} aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Plan Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 id={`plan-${plan.id}-title`} className="text-xl font-semibold mb-1">
                      {plan.planName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-700">₹{plan.price}</span>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                        /{plan.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditPlanPopup(plan)}
                      className="text-gray-500 hover:text-blue-700 rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      aria-label={`Edit ${plan.planName}`}
                      title="Edit Plan"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-gray-500 hover:text-red-600 rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      aria-label={`Delete ${plan.planName}`}
                      title="Delete Plan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {plan.description && Array.isArray(plan.description) && plan.description.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <ul className="space-y-1">
                      {plan.description.map((desc, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-600 mr-2" aria-hidden="true">
                            •
                          </span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">{renderPlanFeatures(plan.features)}</div>
              </div>
            </article>
          ))}
        </section>

        {plans.length === 0 && (
          <div className="text-center py-14">
            <div className="text-gray-400 mb-3">
              <Plus size={60} className="mx-auto mb-3" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-6">Create your first subscription plan to get started</p>
            <button
              onClick={openAddPlanPopup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Add Your First Plan
            </button>
          </div>
        )}
      </div>

      {/* Features Manager Modal */}
      {showFeaturesManager && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="features-manager-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 id="features-manager-title" className="text-2xl font-semibold">
                  Manage Features
                </h2>
                <button
                  onClick={() => setShowFeaturesManager(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                  aria-label="Close features manager"
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Add New Feature */}
              <div className="bg-blue-50/60 p-4 rounded-xl ring-1 ring-inset ring-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Feature</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="new-feature-key" className="text-xs font-medium text-gray-600">
                      Feature Key
                    </label>
                    <input
                      id="new-feature-key"
                      type="text"
                      value={newFeatureKey}
                      onChange={(e) => setNewFeatureKey(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      placeholder="e.g., premiumSupport"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="new-feature-label" className="text-xs font-medium text-gray-600">
                      Display Label
                    </label>
                    <input
                      id="new-feature-label"
                      type="text"
                      value={newFeatureLabel}
                      onChange={(e) => setNewFeatureLabel(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      placeholder="e.g., Premium Support"
                    />
                  </div>
                </div>
                <button
                  onClick={addNewFeature}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Plus size={16} />
                  Add Feature
                </button>
              </div>

              {/* Existing Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Existing Features</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {Object.entries(availableFeatures).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      {editingFeature && editingFeature.originalKey === key ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={editingFeature.key}
                            onChange={(e) => setEditingFeature({ ...editingFeature, key: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Feature Key"
                          />
                          <input
                            type="text"
                            value={editingFeature.label}
                            onChange={(e) => setEditingFeature({ ...editingFeature, label: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Display Label"
                          />
                          <button
                            onClick={saveEditFeature}
                            className="text-green-600 hover:text-green-700 rounded-md p-2 transition-colors"
                            aria-label="Save feature"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEditFeature}
                            className="text-gray-600 hover:text-gray-700 rounded-md p-2 transition-colors"
                            aria-label="Cancel editing"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{label}</div>
                            <div className="text-xs text-gray-500">Key: {key}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditFeature(key)}
                              className="text-blue-700 hover:text-blue-800 rounded-md p-2 transition-colors"
                              aria-label={`Edit ${label}`}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteFeature(key)}
                              className="text-red-600 hover:text-red-700 rounded-md p-2 transition-colors"
                              aria-label={`Delete ${label}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Plan Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 id="plan-modal-title" className="text-2xl font-semibold">
                  {editingPlan ? "Edit Plan" : "Add New Plan"}
                </h2>
                <button
                  onClick={closePopup}
                  className="text-gray-500 hover:text-gray-700 rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                  aria-label="Close plan modal"
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Plan Name */}
              <div>
                <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="plan-name"
                  type="text"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Enter plan name (e.g., Bronze, Silver, Gold)"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="plan-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹/{formData.duration}) <span className="text-red-500">*</span>
                </label>
                <input
                  id="plan-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Enter price"
                  min="0"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="plan-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="plan-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="plan-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Description
                </label>
                <textarea
                  id="plan-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Enter plan description"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">Each line will be displayed as a separate bullet point</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Image</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="plan-image" />
                  <label
                    htmlFor="plan-image"
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {formData.image ? (
                      <div className="text-center">
                        <Upload size={32} className="text-green-600 mb-2 mx-auto" />
                        <span className="text-green-700 text-sm">Image selected: {formData.image.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400 mb-2" aria-hidden="true" />
                        <span className="text-gray-700 text-sm">Click to upload image</span>
                        <span className="text-gray-500 text-xs">PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Plan Features</label>
                  <button
                    type="button"
                     onClick={() => {
                        closePopup(); 
                        setShowFeaturesManager(true);
                    }}
                    className="text-sm text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Settings size={14} />
                    Manage Features
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {Object.entries(availableFeatures).map(([key, displayName]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`feature-${key}`}
                          type="checkbox"
                          checked={formData.features[key] || false}
                          onChange={() => handleFeatureToggle(key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          aria-checked={formData.features[key] || false}
                        />
                        <label
                          htmlFor={`feature-${key}`}
                          className={`${formData.features[key] ? "text-gray-900" : "text-gray-600"}`}
                        >
                          {displayName}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-800 bg-white rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {submitting && <Loader size={16} className="animate-spin" aria-hidden="true" />}
                  {submitting
                    ? editingPlan
                      ? "Updating..."
                      : "Creating..."
                    : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminPanel