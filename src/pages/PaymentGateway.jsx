import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Globe, Key, CheckCircle, XCircle } from 'lucide-react';

export default function GatewayConfigForm() {
  const [formData, setFormData] = useState({
    gatewayName: '',
    apiKey: '',
    saltKey: '',
    isActive: true,
    successUrl: '',
    failedUrl: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showSaltKey, setShowSaltKey] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.gatewayName.trim()) {
      newErrors.gatewayName = 'Gateway name is required';
    }
    
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }
    
    if (!formData.saltKey.trim()) {
      newErrors.saltKey = 'Salt key is required';
    }
    
    // URL validation (optional fields)
    const urlPattern = /^https?:\/\/.+/;
    if (formData.successUrl && !urlPattern.test(formData.successUrl)) {
      newErrors.successUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }
    
    if (formData.failedUrl && !urlPattern.test(formData.failedUrl)) {
      newErrors.failedUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Form submitted:', formData);
        alert('Gateway configuration saved successfully!');
        
        // Reset form after successful submission
        setFormData({
          gatewayName: '',
          apiKey: '',
          saltKey: '',
          isActive: true,
          successUrl: '',
          failedUrl: ''
        });
        
      } catch (error) {
        console.error('Error saving configuration:', error);
        alert('Error saving configuration. Please try again.');
      }
    } else {
      setErrors(newErrors);
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData({
      gatewayName: '',
      apiKey: '',
      saltKey: '',
      isActive: true,
      successUrl: '',
      failedUrl: ''
    });
    setErrors({});
    setShowApiKey(false);
    setShowSaltKey(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-[80%] max-w-[90%] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Gateway Configuration</h1>
          <p className="text-gray-600">Configure your payment gateway settings securely</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Gateway Details
            </h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Gateway Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Gateway Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="gatewayName"
                  value={formData.gatewayName}
                  onChange={handleInputChange}
                  placeholder="Enter gateway name (e.g., Stripe, PayPal, Razorpay)"
                  className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.gatewayName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.gatewayName && <p className="text-red-500 text-sm mt-1">{errors.gatewayName}</p>}
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your API key"
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.apiKey ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.apiKey && <p className="text-red-500 text-sm mt-1">{errors.apiKey}</p>}
            </div>

            {/* Salt Key */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Salt Key *
              </label>
              <div className="relative">
                <input
                  type={showSaltKey ? "text" : "password"}
                  name="saltKey"
                  value={formData.saltKey}
                  onChange={handleInputChange}
                  placeholder="Enter your salt key"
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.saltKey ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowSaltKey(!showSaltKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSaltKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.saltKey && <p className="text-red-500 text-sm mt-1">{errors.saltKey}</p>}
            </div>

            {/* Active/Inactive Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Gateway Status
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg ${
                      formData.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  {formData.isActive ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.isActive ? 'Gateway is enabled and ready to process payments' : 'Gateway is disabled and will not process payments'}
              </p>
            </div>

            {/* Success URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Success URL
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="successUrl"
                  value={formData.successUrl}
                  onChange={handleInputChange}
                  placeholder="https://yoursite.com/payment-success"
                  className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.successUrl ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <CheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.successUrl && <p className="text-red-500 text-sm mt-1">{errors.successUrl}</p>}
              <p className="text-sm text-gray-500">Redirect URL after successful payment</p>
            </div>

            {/* Failed URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Failed URL
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="failedUrl"
                  value={formData.failedUrl}
                  onChange={handleInputChange}
                  placeholder="https://yoursite.com/payment-failed"
                  className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.failedUrl ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <XCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.failedUrl && <p className="text-red-500 text-sm mt-1">{errors.failedUrl}</p>}
              <p className="text-sm text-gray-500">Redirect URL after failed payment</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-1/2 font-semibold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Gateway Configuration'
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-800 font-semibold text-sm">Security Note</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Your API and salt keys are encrypted and stored securely. Never share these credentials with unauthorized personnel. 
                    Make sure to use HTTPS URLs for production environments.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            {formData.gatewayName && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
                <h4 className="text-gray-800 font-semibold text-sm mb-2">Configuration Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Gateway:</span> {formData.gatewayName}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-1 ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p><span className="font-medium">API Key:</span> {formData.apiKey ? '••••••••••••••••' : 'Not set'}</p>
                  <p><span className="font-medium">Salt Key:</span> {formData.saltKey ? '••••••••••••••••' : 'Not set'}</p>
                  {formData.successUrl && <p><span className="font-medium">Success URL:</span> {formData.successUrl}</p>}
                  {formData.failedUrl && <p><span className="font-medium">Failed URL:</span> {formData.failedUrl}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}