import React, { useState } from 'react';
import { Settings, Shield, Globe, Clock, Webhook, Bug, Eye, EyeOff } from 'lucide-react';

const PhonePeConfigUI = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSaltKey, setShowSaltKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  
  const [config, setConfig] = useState({
    merchantId: 'PGTESTPAYUAT',
    saltKey: 'xxxxxxxxxxxxxxxxxxxxx',
    saltIndex: '1',
    environment: 'UAT',
    baseUrlUat: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
    baseUrlProd: 'https://api.phonepe.com/apis/hermes',
    appId: 'com.yourcompany.yourapp',
    redirectUrl: 'https://yourapp.com/payments/phonepe/redirect',
    callbackUrl: 'https://api.yourapp.com/payments/phonepe/callback',
    paymentTimeout: '900',
    webhookSecret: 'change_me',
    logLevel: 'info'
  });

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Configuration saved:', { isEnabled, ...config });
    // Here you would typically send the data to your backend
    alert('Configuration saved successfully!');
  };

  const configSections = [
    {
      title: 'Core Merchant Configuration',
      icon: <Settings className="w-5 h-5" />,
      fields: [
        { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Your Merchant ID from PhonePe' },
        { key: 'saltKey', label: 'Salt Key', type: showSaltKey ? 'text' : 'password', placeholder: 'Secret key used to sign requests', isSecret: true },
        { key: 'saltIndex', label: 'Salt Index', type: 'number', placeholder: 'Salt index provided with the key' }
      ]
    },
    {
      title: 'Environment & Base URLs',
      icon: <Globe className="w-5 h-5" />,
      fields: [
        { key: 'environment', label: 'Environment', type: 'select', options: ['UAT', 'PROD'] },
        { key: 'baseUrlUat', label: 'Base URL UAT', type: 'url', placeholder: 'UAT environment base URL' },
        { key: 'baseUrlProd', label: 'Base URL PROD', type: 'url', placeholder: 'Production environment base URL' }
      ]
    },
    {
      title: 'App & Product Settings',
      icon: <Shield className="w-5 h-5" />,
      fields: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'For UPI intent/deeplink flows' },
        { key: 'redirectUrl', label: 'Redirect URL', type: 'url', placeholder: 'Payment redirect URL' },
        { key: 'callbackUrl', label: 'Callback URL', type: 'url', placeholder: 'Server callback URL' }
      ]
    },
    {
      title: 'Order & Timeouts',
      icon: <Clock className="w-5 h-5" />,
      fields: [
        { key: 'paymentTimeout', label: 'Payment Timeout (seconds)', type: 'number', placeholder: 'Order expiry window' }
      ]
    },
    {
      title: 'Webhook & Security',
      icon: <Webhook className="w-5 h-5" />,
      fields: [
        { key: 'webhookSecret', label: 'Webhook Secret', type: showWebhookSecret ? 'text' : 'password', placeholder: 'HMAC for callback endpoint', isSecret: true }
      ]
    },
    {
      title: 'Logging & Debug',
      icon: <Bug className="w-5 h-5" />,
      fields: [
        { key: 'logLevel', label: 'Log Level', type: 'select', options: ['debug', 'info', 'warn', 'error'] }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="w-[96%] max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">PhonePay Configuration</h1>
                <p className="text-gray-600 mt-1">Manage your PhonePe payment gateway settings</p>
              </div>
            </div>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span className={`text-sm font-medium transition-colors ${isEnabled ? 'text-gray-500' : 'text-gray-700'}`}>
                Disabled
              </span>
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isEnabled ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    isEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          {configSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  {section.icon}
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className={field.key === 'baseUrlUat' || field.key === 'baseUrlProd' || field.key === 'redirectUrl' || field.key === 'callbackUrl' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {field.label}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          value={config[field.key]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          disabled={!isEnabled}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-gray-800"
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type}
                            value={config[field.key]}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={!isEnabled}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-gray-800 pr-12"
                          />
                          
                          {field.isSecret && (
                            <button
                              type="button"
                              onClick={() => {
                                if (field.key === 'saltKey') setShowSaltKey(!showSaltKey);
                                if (field.key === 'webhookSecret') setShowWebhookSecret(!showWebhookSecret);
                              }}
                              disabled={!isEnabled}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              {(field.key === 'saltKey' ? showSaltKey : showWebhookSecret) ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isEnabled}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-gray-700 font-medium">
              PhonePe Integration: {isEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePeConfigUI;