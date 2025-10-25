// ImageGallery.jsx
import React, { useState } from "react";
import { Pencil, Trash2, Eye, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { useEffect } from "react";




function ImageGallery() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change this if you want more/less per page
    const [images, setImages] = useState([]);
        useEffect(() => {
        fetchImages();
        }, []);

    const fetchImages = async () => {
        try {
            const res = await axios.get("https://macstrombattle-api.kglame.com/api/auth/admin/images");
            setImages(res.data.data);
        } catch (err) {
            console.error("Failed to fetch images", err);
        }
        };


    const filteredImagesAll = images.filter((img) =>
    img.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredImagesAll.length / itemsPerPage);

    const filteredImages = filteredImagesAll.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    );


  const toggleSelect = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = (e) => {
    if (e.target.checked) {
      setSelectedImages(filteredImages.map((img) => img.id));
    } else {
      setSelectedImages([]);
    }
  };

    const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
        await axios.delete(`https://macstrombattle-api.kglame.com/api/auth/admin/images/${id}`);
        setImages(images.filter((img) => img.id !== id));
        setSelectedImages(selectedImages.filter((i) => i !== id));
    } catch (err) {
        console.error("Delete failed", err);
        alert("Error deleting image");
    }
    };


  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return alert("Select at least one image.");
    if (window.confirm(`Delete ${selectedImages.length} selected image(s)?`)) {
      setImages(images.filter((img) => !selectedImages.includes(img.id)));
      setSelectedImages([]);
    }
  };

  const handleAdd = async (newImage) => {
    if (!newImage.file) {
      alert("Image file is required.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", newImage.title);
      formData.append("image", newImage.file);

      const res = await axios.post("https://macstrombattle-api.kglame.com/api/auth/admin/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages((prev) => [...prev, res.data.data]);
    } catch (error) {
      console.error("Error uploading image", error);
      alert(error.response?.data?.message || "Upload failed");
    }
  };


    const handleEdit = async (updatedImage) => {
    try {
        const formData = new FormData();
        formData.append("title", updatedImage.title);
        if (updatedImage.file) {
        formData.append("image", updatedImage.file);
        }

        const res = await axios.put(
        `https://macstrombattle-api.kglame.com/api/auth/admin/images/${updatedImage.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
        );

        setImages((prev) =>
        prev.map((img) => (img.id === updatedImage.id ? res.data.data : img))
        );
    } catch (err) {
        console.error("Update failed", err);
        alert("Failed to update image");
    }
    };


    const handleExport = (type) => {
    const exportData = (selectedImages.length > 0 ? 
    filteredImagesAll.filter(img => selectedImages.includes(img.id)) : 
    filteredImagesAll
    ).map((img, index) => ({
    "Sr No.": index + 1,
    "Image Title": img.title,
    "Image URL": img.imageUrl,
    }));

    if (type === "CSV" || type === "Excel") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Images");

        const fileType =
        type === "CSV" ? "csv" : "xlsx";

        const fileBuffer = XLSX.write(workbook, {
        bookType: fileType,
        type: "array",
        });

        const file = new Blob([fileBuffer], {
        type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(file, `image-gallery.${fileType}`);
        } else if (type === "PDF") {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "A4",
        });

        const headers = [["Sr No.", "Image Title", "Image URL"]];

        const data = exportData.map((row) => [
            row["Sr No."],
            row["Image Title"],
            row["Image URL"],
        ]);

        autoTable(doc, {
            head: headers,
            body: data,
            startY: 40,
            styles: {
            fontSize: 10,
            cellPadding: 4,
            },
            headStyles: {
            fillColor: [245, 66, 132],
            },
        });

        doc.setFontSize(14);
        doc.text("Image Gallery", 40, 30);
        doc.save("image-gallery.pdf");
        

    } else if (type === "Print") {
        const newWin = window.open("");
        newWin.document.write("<h1>Image Gallery</h1>");
        newWin.document.write("<table border='1' style='width:100%;border-collapse:collapse;'>");
        newWin.document.write("<thead><tr><th>Sr No.</th><th>Image Title</th><th>Image URL</th></tr></thead><tbody>");
        exportData.forEach((row) => {
        newWin.document.write(`<tr><td>${row["Sr No."]}</td><td>${row["Image Title"]}</td><td>${row["Image URL"]}</td></tr>`);
        });
        newWin.document.write("</tbody></table>");
        newWin.document.close();
        newWin.print();


        
    } else if (type === "Copy") {
        const text = exportData
        .map((row) => `${row["Sr No."]}\t${row["Image Title"]}\t${row["Image URL"]}`)
        .join("\n");

        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    }
    };


  return (
    <div className="p-6 min-h-screen bg-neutral-200 dark:bg-zinc-500 text-black dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-semibold">Images</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-zinc-800 transition-colors text-sm font-semibold shadow"
        >
          + Add Image
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex gap-2 flex-wrap">
            {["Print", "CSV", "Excel", "PDF", "Copy"].map((btn) => (
            <button
                key={btn}
                onClick={() => handleExport(btn)}
                className="text-sm bg-black text-white px-3 py-1 rounded shadow hover:bg-zinc-600 transition-colors"
            >
                {btn}
            </button>
            ))}
          <button
            onClick={handleBulkDelete}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition-colors"
          >
            Delete Selected
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border border-gray-300 dark:border-zinc-600 rounded w-full md:w-64 bg-white dark:bg-zinc-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-zinc-800 rounded shadow ">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-zinc-100 dark:bg-zinc-800 text-sm uppercase text-zinc-600 dark:text-zinc-400 tracking-wide border-b dark:border-zinc-700">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={
                    filteredImages.length > 0 &&
                    selectedImages.length === filteredImages.length
                  }
                  onChange={selectAll}
                />
              </th>
              <th className="p-3 font-medium">Sr No.</th>
              <th className="p-3 font-medium">Image Title</th>
              <th className="p-3 font-medium">Image</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredImages.length > 0 ? (
              filteredImages.map((img, index) => (
                <tr
                  key={img.id}
                  className="border-t hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(img.id)}
                      onChange={() => toggleSelect(img.id)}
                    />
                  </td>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{img.title}</td>
                  <td className="p-3">
                    <img
                      src={`${img.imageUrl}`}
                      alt={img.title}
                      className="w-16 h-16 object-contain rounded"
                    />

                  </td>
                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                    title="View"
                    onClick={() => setViewImage(`${img.imageUrl}`)}
                    className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    >
                    <Eye size={16} />
                    </button>

                    <button
                      title="Edit"
                      onClick={() => setShowEditModal(img)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(img.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-zinc-500 py-6 dark:text-zinc-400"
                >
                  No images found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
        <div>
          Showing 1 to {filteredImages.length} of {images.length} entries
        </div>
        <div className="flex gap-2">
        <button
            className={`px-3 py-1 border rounded ${
            currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </button>
        <button
            className={`px-3 py-1 border rounded ${
            currentPage === totalPages || totalPages === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
            onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages || totalPages === 0}
        >
            Next
        </button>
        </div>

      </div>

      {showAddModal && (
        <ImageModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {showEditModal && (
        <ImageModal
          mode="edit"
          data={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSubmit={handleEdit}
        />
      )}
        {viewImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="relative">
              <button
                className="absolute top-2 right-2 text-white hover:text-zinc-300"
                onClick={() => setViewImage(null)}
              >
                <X size={24} />
              </button>
              <img
                src={viewImage}
                alt="View"
                className="max-w-screen max-h-screen object-contain rounded shadow-lg"
              />
            </div>
          </div>
        )}


    </div>
  );
}

function ImageModal({ mode, data = {}, onClose, onSubmit }) {
  const [title, setTitle] = useState(data.title || "");
  const [preview, setPreview] = useState(data.imageUrl || null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || (!file && mode === "add")) {
      alert("Please fill all required fields.");
      return;
    }

    const newData = {
      id: data.id || Date.now(),
      title,
      imageUrl: preview,
      file,
    };

    onSubmit(newData);
    onClose();
  };




  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto pt-10 px-4">
      <div className="bg-white dark:bg-zinc-800 dark:border dark:border-zinc-700 rounded-md w-full max-w-lg shadow-lg p-6 transition-all">

        <h2 className="text-2xl font-semibold mb-4">
          {mode === "edit" ? "Edit Image" : "Add Image"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Image Title *</label>
            <input
              type="text"
              className="p-2 border border-gray-300 dark:border-zinc-600 rounded w-full md:w-64 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-zinc-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm border-gray-300 dark:border-zinc-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Upload 800x500 size of image for better view in app.
            </p>
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-20 object-contain rounded"
                />
                
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-pink-400 text-white hover:bg-pink-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImageGallery;
