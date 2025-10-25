import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Memoized EditableField component to prevent unnecessary re-renders
const EditableField = React.memo(({ label, name, value, onChange, isTextArea = false, isNumber = false, isPercent = false }) => (
    <div className="flex items-start mb-4">
        <strong className="w-40 min-w-[120px] text-gray-600 text-sm">{label}:</strong>
        {isTextArea ? (
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:border-indigo-500 min-h-[80px] w-full resize-none text-sm"
                rows="3"
                placeholder={`Enter ${label}`}
            />
        ) : (
            <div className="flex-grow flex items-center">
                <input
                    type={isNumber ? "number" : "text"}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-indigo-500 w-full text-sm"
                    placeholder={`Enter ${label}`}
                    step={isNumber ? "0.01" : undefined}
                />
                {isPercent && <span className="ml-2 text-gray-500 text-sm">%</span>}
            </div>
        )}
    </div>
));

// --- Main Component ---
const EnhancedInvoiceForm = () => {
    const [data, setData] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Stable event handlers using useCallback
    const handleDataChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    }, []);

    // Handler for tax rate change (ensures it's a number)
    const handleTaxRateChange = useCallback((e) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value);
        setData(prevData => ({
            ...prevData,
            [name]: isNaN(numValue) ? '' : numValue
        }));
    }, []);

    // --- CRUD Functions ---

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/invoices`);
            if (response.data.success) {
                setInvoices(response.data.data);

                // Auto-load the first invoice if available
                if (response.data.data.length > 0 && !selectedInvoice) {
                    const firstInvoice = response.data.data[0];
                    loadInvoiceForEdit(firstInvoice);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching invoices:', error);
            toast.error('Error loading invoices.');
        } finally {
            setLoading(false);
        }
    };

    // Transform API data to form data format
    const transformApiDataToFormData = (apiData) => {
        return {
            ...apiData,
            // Ensure tax rates are numbers
            cgstRate: apiData.cgstRate ? parseFloat(apiData.cgstRate) : 9,
            sgstRate: apiData.sgstRate ? parseFloat(apiData.sgstRate) : 9,
        };
    };

    // Get empty form data for new invoice
    const getEmptyFormData = () => ({
        sellerLegalName: '',
        sellerTradeName: '',
        sellerGstin: '',
        taxpayerType: '',
        registrationDate: '',
        sellerAddress: '',
        contactPhone: '',
        contactEmail: '',
        contactWebsite: '',
        paymentTerms: '',
        description: '',
        sac: '',
        declaration: '',
        cgstRate: 9,
        sgstRate: 9,
        pos: '',
    });

    const handleSave = async () => {
        if (!data.sellerLegalName || !data.sellerTradeName || !data.sellerGstin) {
            toast.error('Please fill required fields: Legal Name, Trade Name, and GSTIN');
            return;
        }

        setIsUpdating(true);
        try {
            if (selectedInvoice) {
                // Update existing invoice
                await axiosInstance.put(`/invoices/${selectedInvoice.id}`, data);
                toast.success(`Invoice updated successfully!`);
            } else {
                // Create new invoice
                const response = await axiosInstance.post(`/invoices`, data);
                if (response.data.success) {
                    toast.success(`Invoice created successfully!`);
                    // Auto-select the newly created invoice
                    const newInvoice = response.data.data;
                    setSelectedInvoice(newInvoice);
                }
            }
            await fetchInvoices();
        } catch (error) {
            console.error('❌ API Error:', error.response?.data || error.message);
            toast.error(`Save failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            await axiosInstance.delete(`/invoices/${invoiceId}`);
            toast.success('Invoice deleted successfully!');
            await fetchInvoices();

            if (selectedInvoice && selectedInvoice.id === invoiceId) {
                setData(getEmptyFormData());
                setSelectedInvoice(null);
            }
        } catch (error) {
            console.error('❌ API Error:', error.response?.data || error.message);
            toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const loadInvoiceForEdit = (invoice) => {
        setSelectedInvoice(invoice);
        const formData = transformApiDataToFormData(invoice);
        setData(formData);
    };

    const handleNewInvoice = () => {
        setData(getEmptyFormData());
        setSelectedInvoice(null);
        toast.info("Ready to create new invoice");
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen p-5 sm:p-10">
            <div className="max-w-6xl mx-auto">
                <ToastContainer position="top-right" autoClose={3000} />

                {/* Form Section */}
                <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h1 className="text-2xl font-bold text-indigo-700">
                            Invoice Master Data {selectedInvoice ? `(Editing: ${selectedInvoice.sellerTradeName || selectedInvoice.sellerLegalName})` : '(New Invoice)'}
                        </h1>
                        
                    </div>

                    {/* Editable Fields Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">

                        {/* Seller Details Column */}
                        <div className="lg:col-span-1 border-r pr-5 border-gray-200">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Seller/Contact Details</h2>
                            <EditableField label="Legal Name *" name="sellerLegalName" value={data.sellerLegalName} onChange={handleDataChange} />
                            <EditableField label="Trade Name *" name="sellerTradeName" value={data.sellerTradeName} onChange={handleDataChange} />
                            <EditableField label="GSTIN *" name="sellerGstin" value={data.sellerGstin} onChange={handleDataChange} />
                            <EditableField label="Taxpayer Type" name="taxpayerType" value={data.taxpayerType} onChange={handleDataChange} />
                            <EditableField label="Reg. Date" name="registrationDate" value={data.registrationDate} onChange={handleDataChange} />
                            <EditableField label="Phone" name="contactPhone" value={data.contactPhone} onChange={handleDataChange} />
                            <EditableField label="Email" name="contactEmail" value={data.contactEmail} onChange={handleDataChange} />
                            <EditableField label="Website" name="contactWebsite" value={data.contactWebsite} onChange={handleDataChange} />
                        </div>

                        {/* Address, Invoice & Payment Column */}
                        <div className="lg:col-span-1 border-r pr-5 border-gray-200">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Address & Invoice Info</h2>
                            <EditableField label="Place of Supply" name="pos" value={data.pos} onChange={handleDataChange} />
                            <EditableField label="Payment Terms" name="paymentTerms" value={data.paymentTerms} onChange={handleDataChange} />
                            <EditableField label="Principal Address" name="sellerAddress" value={data.sellerAddress} onChange={handleDataChange} isTextArea={true} />

                            <h2 className="text-xl font-bold mb-4 mt-8 text-gray-800 border-b pb-2">Declaration</h2>
                            <EditableField
                                label="Declaration Text"
                                name="declaration"
                                value={data.declaration}
                                onChange={handleDataChange}
                                isTextArea={true}
                            />
                        </div>

                        {/* Line Item & Tax Info Column */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Service Details</h2>
                            <EditableField label="Description" name="description" value={data.description} onChange={handleDataChange} />
                            <EditableField label="SAC Code" name="sac" value={data.sac} onChange={handleDataChange} />

                            <div className="mt-8">
                                <h3 className="font-bold text-gray-700 mb-2">Tax Rates</h3>
                                <div className='space-y-3'>
                                    <EditableField
                                        label="CGST Rate"
                                        name="cgstRate"
                                        value={data.cgstRate}
                                        onChange={handleTaxRateChange}
                                        isNumber={true}
                                        isPercent={true}
                                    />
                                    <EditableField
                                        label="SGST Rate"
                                        name="sgstRate"
                                        value={data.sgstRate}
                                        onChange={handleTaxRateChange}
                                        isNumber={true}
                                        isPercent={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-10">
                        <button
                            className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-150 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...' : selectedInvoice ? 'Update' : 'Create'}
                        </button>

                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-150"
                            onClick={handleNewInvoice}
                        >
                            New
                        </button>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 mt-6">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Saved Invoices ({invoices.length})</h2>
                        <button
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                            onClick={fetchInvoices}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading records...</p>
                        </div>
                    )}

                    {!loading && invoices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No invoices found. Create your first invoice above.</div>
                    )}

                    {!loading && invoices.length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className={`border rounded-lg p-4 cursor-pointer flex justify-between items-center transition-all ${selectedInvoice?.id === invoice.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'}`}
                                    onClick={() => loadInvoiceForEdit(invoice)}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                            {invoice.sellerTradeName || invoice.sellerLegalName || 'Unnamed Invoice'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            <strong>GSTIN:</strong> {invoice.sellerGstin || 'N/A'} | <strong>POS:</strong> {invoice.pos || 'N/A'} | <strong>Phone:</strong> {invoice.contactPhone || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Created: {new Date(invoice.createdAt).toLocaleDateString()} | 
                                            CGST: {invoice.cgstRate}% | SGST: {invoice.sgstRate}%
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id); }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex-shrink-0"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedInvoiceForm;