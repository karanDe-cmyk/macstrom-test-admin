import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

const BundleManager = () => {
  const [bundles, setBundles] = useState([
    { 
      id: 1, 
      image: 'https://as2.ftcdn.net/v2/jpg/04/42/21/53/1000_F_442215355_AjiR6ogucq3vPzjFAAEfwbPXYGqYVAap.jpg',
      name: 'New ', 
      requiredSpins: 120,
      requiredCoins: null,
      status: 'Active' 
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    requiredSpins: '',
    requiredCoins: '',
    requirementType: 'spins',
    status: 'Active'
  });
  const [imagePreview, setImagePreview] = useState('');

  const handleAdd = () => {
    setEditingBundle(null);
    setFormData({ 
      image: '', 
      name: '', 
      requiredSpins: '', 
      requiredCoins: '', 
      requirementType: 'spins',
      status: 'Active' 
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setFormData({
      image: bundle.image,
      name: bundle.name,
      requiredSpins: bundle.requiredSpins || '',
      requiredCoins: bundle.requiredCoins || '',
      requirementType: bundle.requiredSpins ? 'spins' : 'coins',
      status: bundle.status
    });
    setImagePreview(bundle.image);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setBundles(bundles.filter(b => b.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.image) return;
    if (formData.requirementType === 'spins' && !formData.requiredSpins) return;
    if (formData.requirementType === 'coins' && !formData.requiredCoins) return;

    const bundleData = {
      image: formData.image,
      name: formData.name,
      requiredSpins: formData.requirementType === 'spins' ? parseInt(formData.requiredSpins) : null,
      requiredCoins: formData.requirementType === 'coins' ? parseInt(formData.requiredCoins) : null,
      status: formData.status
    };

    if (editingBundle) {
      setBundles(bundles.map(b => b.id === editingBundle.id ? { ...editingBundle, ...bundleData } : b));
    } else {
      setBundles([...bundles, { id: Date.now(), ...bundleData }]);
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white">
              <Plus size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Bundle Manager</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13">Manage your bundle offerings and rewards</p>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-medium shadow-sm transition-colors"
          >
            <Plus size={18} />
            Add New Bundle
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600">
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">Bundle Image</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">Bundle Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">Required Spins</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img 
                        src={bundle.image} 
                        alt={bundle.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-800">{bundle.name}</td>
                    <td className="px-6 py-4 text-gray-800">
                      {bundle.requiredSpins || bundle.requiredCoins}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        bundle.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {bundle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bundle)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bundle.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex gap-4 mb-4">
                <img 
                  src={bundle.image} 
                  alt={bundle.name}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-gray-800 font-medium mb-1">{bundle.name}</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    bundle.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {bundle.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Required:</span>
                  <span className="text-gray-800 font-medium">
                    {bundle.requiredSpins || bundle.requiredCoins}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(bundle)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-sm font-medium"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bundle.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingBundle ? 'Edit Bundle' : 'Add Bundle'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bundle Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Bundle Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bundle Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., New Outfit"
                  />
                </div>

                {/* Requirement Type */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Requirement Type
                  </label>
                  <select
                    value={formData.requirementType}
                    onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="spins">Spins</option>
                    <option value="coins">Coins</option>
                  </select>
                </div>

                {/* Required Spins or Coins */}
                {formData.requirementType === 'spins' ? (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Required Spins
                    </label>
                    <input
                      type="number"
                      value={formData.requiredSpins}
                      onChange={(e) => setFormData({ ...formData, requiredSpins: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="120"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Required Coins
                    </label>
                    <input
                      type="number"
                      value={formData.requiredCoins}
                      onChange={(e) => setFormData({ ...formData, requiredCoins: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="500"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-colors mt-2"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleManager;