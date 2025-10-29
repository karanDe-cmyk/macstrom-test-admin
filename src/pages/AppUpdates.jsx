import { useState, useEffect } from "react";
import { Upload, Smartphone, Tag, Hash, RefreshCw, Edit3, Link } from "lucide-react";
import axiosInstance from "../utils/axios";
export default function ApkUploadForm() {
  const [formData, setFormData] = useState({
    apkFile: null,
    apkName: '',
    appVersion: '',
    apkUrl: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [existingApps, setExistingApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch existing apps on component mount
  useEffect(() => {
    fetchExistingApps();
  }, []);

  const fetchExistingApps = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/app-updates");
      setExistingApps(response.data.items || []);
    } catch (error) {
      console.error("Error fetching existing apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppSelect = (e) => {
    const appId = e.target.value;
    if (appId) {
      const selectedApp = existingApps.find(app => app.id === appId);
      if (selectedApp) {
        setSelectedAppId(appId);
        setFormData({
          apkFile: null,
          apkName: selectedApp.app_name,
          appVersion: selectedApp.app_version,
          apkUrl: selectedApp.apk_url || ''
        });
        setIsUpdating(true);
      }
    } else {
      resetForm();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.apk')) {
      setFormData(prev => ({
        ...prev,
        apkFile: file
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.apk')) {
        setFormData(prev => ({
          ...prev,
          apkFile: file
        }));
      }
    }
  };

  const handleSubmit = async () => {
    // Optional validation
    // if (!formData.apkFile || !formData.apkName || !formData.appVersion) {
    //   alert("Please fill in all required fields.");
    //   return;
    // }

    if (!isUpdating || !selectedAppId) {
      alert("Please select an existing app to update.");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("app_name", formData.apkName);
      formDataToSend.append("app_version", formData.appVersion);

      if (formData.apkUrl) {
        formDataToSend.append("apk_url", formData.apkUrl);
      }
      if (formData.apkFile) {
        formDataToSend.append("apk", formData.apkFile);
      }

      const response = await axiosInstance.put(
        `/app-updates/${selectedAppId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("App updated successfully!");

      // Reset form and refresh the list
      setFormData({ apkFile: null, apkName: "", appVersion: "", apkUrl: "" });
      setSelectedAppId("");
      setIsUpdating(false);
      await fetchExistingApps();
    } catch (error) {
      console.error("Error updating app:", error);

      const message =
        error.response?.data?.message || "Network error occurred while updating the app.";
      alert(`Update failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({ apkFile: null, apkName: '', appVersion: '', apkUrl: '' });
    setSelectedAppId('');
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            App Updates
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Update App</h2>
              <button
                onClick={fetchExistingApps}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Apps
              </button>
            </div>

            <div className="space-y-8">

              {/* App Selection Dropdown */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Select App to Update
                </label>
                {loading && existingApps.length === 0 ? (
                  <div className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl bg-gray-50 text-gray-500">
                    Loading existing apps...
                  </div>
                ) : (
                  <select
                    value={selectedAppId}
                    onChange={handleAppSelect}
                    className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Choose an app to update</option>
                    {/* {existingApps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.app_name} - v{app.app_version} (Updated: {new Date(app.updated_at).toLocaleDateString()})
                      </option>
                    ))} */}
                    {existingApps.map((app) => {
                      const updatedDate = app.updated_at ? new Date(app.updated_at) : null;
                      const isValidDate = updatedDate && !isNaN(updatedDate);
                      return (
                        <option key={app.id} value={app.id}>
                          {app.app_name} - v{app.app_version}
                          {isValidDate && ` (Updated: ${updatedDate.toLocaleDateString()})`}
                        </option>
                      );
                    })}

                  </select>
                )}
                {existingApps.length === 0 && !loading && (
                  <p className="text-sm text-gray-500 mt-2">No existing apps found</p>
                )}
              </div>

              {/* APK File Upload */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload APK File
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : formData.apkFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".apk"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    {formData.apkFile ? (
                      <>
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-green-700">{formData.apkFile.name}</p>
                          <p className="text-sm text-green-600">
                            {(formData.apkFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop your APK file here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Only .apk files are supported
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* APK Name */}
              <div className="space-y-3">
                <label htmlFor="apkName" className="block text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Tag className="w-5 h-5 text-blue-600" />
                  APK Name
                  {/* {isUpdating && <span className="text-sm font-normal text-gray-500">(from API)</span>} */}
                </label>
                <input
                  type="text"
                  id="apkName"
                  name="apkName"
                  value={formData.apkName}
                  onChange={handleInputChange}
                  placeholder={isUpdating ? "App name loaded from API" : "Enter your app name"}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* APK URL */}
              <div className="space-y-3">
                <label htmlFor="apkUrl" className="block text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Link className="w-5 h-5 text-blue-600" />
                  APK URL
                  {isUpdating && <span className="text-sm font-normal text-gray-500"></span>}
                </label>
                <input
                  type="url"
                  id="apkUrl"
                  name="apkUrl"
                  value={formData.apkUrl}
                  onChange={handleInputChange}
                  placeholder={isUpdating ? "APK URL loaded from API" : "Enter APK download URL (optional)"}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                {formData.apkUrl && (
                  <div className="mt-2">
                    <a
                      href={formData.apkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      <Link className="w-4 h-4" />
                      Open APK URL
                    </a>
                  </div>
                )}
              </div>

              {/* App Version */}
              <div className="space-y-3">
                <label htmlFor="appVersion" className=" text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Hash className="w-5 h-5 text-blue-600" />
                  App Version
                  {isUpdating && <span className="text-sm font-normal text-gray-500"></span>}
                </label>
                <input
                  type="text"
                  id="appVersion"
                  name="appVersion"
                  value={formData.appVersion}
                  onChange={handleInputChange}
                  placeholder={isUpdating ? "Version loaded from API" : "e.g., 1.0.0 or 2.3.1"}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isUpdating}
                  className={`w-50 font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.98] ${loading || !isUpdating
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Updating...
                    </span>
                  ) : isUpdating ? (
                    'Update App'
                  ) : (
                    'Select an App to Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm sm:text-base">
            Supported file types: APK • Maximum file size: 100MB
          </p>
        </div>
      </div>
    </div>
  );
}