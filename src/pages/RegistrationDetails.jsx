import { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Save, Eye, X, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Axios instance configuration
const axiosInstance = axios.create({
  baseURL: 'https://mactromtest-backend.onrender.com/api',
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

export default function FormFieldSettings() {
  const [fields, setFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    field_name: '',
    label: '',
    field_type: 'text',
    is_required: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Textarea' }
  ];

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsFetching(true);
    try {
      const { data } = await axiosInstance.get("/formfields");

      // Remove duplicates by field_name, keeping the latest one
      const uniqueFields = data.reduce((acc, field) => {
        const existingIndex = acc.findIndex(f => f.field_name === field.field_name);
        if (existingIndex === -1) {
          acc.push(field);
        } else if (new Date(field.createdAt) > new Date(acc[existingIndex].createdAt)) {
          acc[existingIndex] = field;
        }
        return acc;
      }, []);

      setFields(uniqueFields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      alert("Error loading fields");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldChange = (fieldId, property, value) => {
    setFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    );
  };

  const addField = () => {
    if (!newField.field_name.trim() || !newField.label.trim()) {
      alert('Please fill in both field name and label');
      return;
    }

    if (fields.some(field => field.field_name === newField.field_name)) {
      alert('Field name already exists. Please choose a different name.');
      return;
    }

    const field = {
      id: Date.now(),
      ...newField,
      field_name: newField.field_name.replace(/\s+/g, '').toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFields(prev => [...prev, field]);
    setNewField({
      field_name: '',
      label: '',
      field_type: 'text',
      is_required: false
    });
    setShowAddField(false);
  };

  const removeField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    const isNewField = typeof fieldId === 'number' && fieldId > 1000000000000;
    
    if (isNewField) {
      setFields(prev => prev.filter(field => field.id !== fieldId));
    } else {
      setIsDeleting(fieldId);
      try {
        await axiosInstance.delete(`/formfields/${fieldId}`);
        setFields(prev => prev.filter(field => field.id !== fieldId));
        alert('Field deleted successfully!');
      } catch (error) {
        console.error('Error deleting field:', error);
        alert(`Failed to delete field: ${error.message}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        fields: fields.map(({ id, createdAt, updatedAt, ...field }) => field)
      };

      await axiosInstance.post('/formfields/fields', payload);
      alert('Form fields saved successfully!');
      await fetchFields();
    } catch (error) {
      console.error('Error saving fields:', error);
      alert(`Failed to save fields: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFieldName = (label) => {
    return label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-full">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Registration Form Settings</h1>
                <p className="text-gray-600">Configure fields for the registration form</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchFields}
                disabled={isFetching}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Show Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-xl shadow-lg p-6">
          {isFetching ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading fields...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 border-b pb-3">
                <h2 className="text-2xl font-semibold text-gray-800">Form Fields Configuration</h2>
                <div className="text-sm text-gray-500">
                  Total Fields: {fields.length}
                </div>
              </div>
              
              {/* Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {field.field_type.toUpperCase()}
                        </span>
                        {field.is_required && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeField(field.id)}
                        disabled={isDeleting === field.id}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove field"
                      >
                        {isDeleting === field.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => {
                            handleFieldChange(field.id, 'label', e.target.value);
                            handleFieldChange(field.id, 'field_name', generateFieldName(e.target.value));
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Field label"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                        <input
                          type="text"
                          value={field.field_name}
                          onChange={(e) => handleFieldChange(field.id, 'field_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="fieldName"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <select
                            value={field.field_type}
                            onChange={(e) => handleFieldChange(field.id, 'field_type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {fieldTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <label className="flex items-center space-x-2 pb-2">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => handleFieldChange(field.id, 'is_required', e.target.checked)}
                              className="text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Required</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Field Card */}
                {showAddField ? (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-5 bg-purple-50">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Field</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newField.label}
                        onChange={(e) => {
                          setNewField(prev => ({
                            ...prev,
                            label: e.target.value,
                            field_name: generateFieldName(e.target.value)
                          }));
                        }}
                        placeholder="Field label (e.g., Phone Number)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      
                      <input
                        type="text"
                        value={newField.field_name}
                        onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                        placeholder="Field name (e.g., phoneNumber)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={newField.field_type}
                          onChange={(e) => setNewField(prev => ({ ...prev, field_type: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newField.is_required}
                            onChange={(e) => setNewField(prev => ({ ...prev, is_required: e.target.checked }))}
                            className="text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Required</span>
                        </label>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={addField}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add Field
                        </button>
                        <button
                          onClick={() => setShowAddField(false)}
                          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setShowAddField(true)}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="font-medium">Add New Field</span>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="border-t pt-6 flex items-center justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || fields.length === 0}
                  className="w-50 flex items-center justify-center space-x-2 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Saving Form Fields...' : 'Save Form Fields'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Registration Form Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.field_type === 'textarea' ? (
                      <textarea
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                        disabled
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      >
                        <option>Select {field.label.toLowerCase()}</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    ) : field.field_type === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled
                        />
                        <span className="text-sm text-gray-600">Check this option</span>
                      </div>
                    ) : (
                      <input
                        type={field.field_type}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                    )}
                  </div>
                ))}
                
                {fields.length > 0 && (
                  <div className="pt-6 border-t">
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
                    >
                      Submit Registration (Preview Only)
                    </button>
                  </div>
                )}
              </div>
              
              {fields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No fields configured yet.</p>
                  <p>Add some fields to see the registration form preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}