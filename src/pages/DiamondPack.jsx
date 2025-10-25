import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const DiamondPackManager = () => {
  const [packs, setPacks] = useState([
    { id: 1, name: '100 Diamonds', quantity: 100, price: 50, currency: 'coins', status: 'Active' }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    currency: '',
    status: 'Active'
  });

  const handleAdd = () => {
    setEditingPack(null);
    setFormData({ name: '', quantity: '', price: '', currency: '', status: 'Active' });
    setShowModal(true);
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      quantity: pack.quantity,
      price: pack.price,
      currency: pack.currency,
      status: pack.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPacks(packs.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.quantity || !formData.price) return;

    if (editingPack) {
      setPacks(packs.map(p => p.id === editingPack.id ? { ...editingPack, ...formData } : p));
    } else {
      setPacks([...packs, { id: Date.now(), ...formData }]);
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">Diamond Packs</h1>
          <p className="text-blue-600">Manage your diamond pack offerings</p>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} />
            Add New Diamond Pack
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Diamond Text</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {packs.map((pack) => (
                  <tr key={pack.id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-blue-900 font-medium">{pack.name}</td>
                    <td className="px-6 py-4 text-blue-700">{pack.quantity}</td>
                    <td className="px-6 py-4 text-blue-700">
                      {pack.price} {pack.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        pack.status === 'Active' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {pack.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(pack)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pack.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
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
          {packs.map((pack) => (
            <div key={pack.id} className="bg-white rounded-xl p-5 border border-blue-200 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-blue-900 font-bold text-lg mb-1">{pack.name}</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    pack.status === 'Active' 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {pack.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pack)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600 text-sm">Quantity:</span>
                  <span className="text-blue-900 font-medium">{pack.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 text-sm">Price:</span>
                  <span className="text-blue-900 font-medium">
                    {pack.price} {pack.currency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md border border-blue-200 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">
                  {editingPack ? 'Edit Diamond Pack' : 'Add Diamond Pack'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-blue-600 hover:text-blue-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-blue-900 text-sm font-medium mb-2">
                    Diamond Name/Text
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g., 100 Diamonds"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-900 text-sm font-medium mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="50"
                    />
                  </div>
                    <div>
                        <label className="block text-blue-900 text-sm font-medium mb-2">
                        Currency
                        </label>
                        <input
                        type="text"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="e.g., coins or ₹"
                        />
                    </div>
                </div>

                <div>
                  <label className="block text-blue-900 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-6"
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

export default DiamondPackManager;