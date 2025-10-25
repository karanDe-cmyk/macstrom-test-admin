import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { Editor } from "primereact/editor";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import "primeicons/primeicons.css";
import "react-toastify/dist/ReactToastify.css";

function CreateGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    game_name: "",
    package_name: "",
    image: null,
    logo: null,
    game_type: "create",
    coming_soon: "no",
    game_rules: "",
  });

  // Preview URLs
  const [imagePreview, setImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchGameDetails(id);
    }
  }, [id]);

  const fetchGameDetails = async (gameId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`auth/admin/games/${gameId}`);
      const game = res.data.data;

      setForm({
        game_name: game.game_name,
        package_name: game.package_name,
        image: game.image,
        logo: game.logo,
        game_type: game.game_type,
        coming_soon: game.coming_soon,
        game_rules: game.game_rules,
      });
      

      setImagePreview(game.image);
      setLogoPreview(game.logo);
    } catch (err) {
      toast.error("Failed to load game details",err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      const previewUrl = URL.createObjectURL(file);
      if (name === "image") setImagePreview(previewUrl);
      if (name === "logo") setLogoPreview(previewUrl);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("game_name", form.game_name);
    formData.append("package_name", form.package_name);
    formData.append("game_type", form.game_type);
    formData.append("coming_soon", form.coming_soon);
    formData.append("game_rules", form.game_rules);
  
    if (form.image && typeof form.image !== "string")
      formData.append("image", form.image);
    if (form.logo && typeof form.logo !== "string")
      formData.append("logo", form.logo);
  
    try {
      if (isEditMode) {
        await axiosInstance.put(`auth/admin/games/${id}`, formData);
        toast.success("Game updated successfully");
      } else {
        await axiosInstance.post("auth/admin/games", formData);
        toast.success("Game created successfully");
      }
      setTimeout(() => navigate("/games"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save game");
    }
  };
  

  if (loading) {
    return (
      <div className="p-10 text-center text-lg dark:text-white">
        Loading game details...
      </div>
    );
  }

  return (
    <div className="p-6 my-10 md:p-10 max-w-4xl bg-white mx-auto rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">
        {isEditMode ? "Edit Game" : "Create New Game"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-800 dark:text-zinc-200"
      >
        {/* Game Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Game Name *</label>
          <input
            type="text"
            name="game_name"
            required
            value={form.game_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>

        {/* Package Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Package Name *</label>
          <input
            type="text"
            name="package_name"
            required
            value={form.package_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1 text-sm font-medium">Image * (500x500)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            className="block w-full text-sm file:py-1 file:px-3 file:bg-zinc-800 file:text-white file:border-none file:rounded dark:text-white"
          />
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />
          )}
        </div>

        {/* Logo */}
        <div>
          <label className="block mb-1 text-sm font-medium">Logo * (200x200)</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleInputChange}
            className="block w-full text-sm file:py-1 file:px-3 file:bg-zinc-800 file:text-white file:border-none file:rounded dark:text-white"
          />
          {logoPreview && (
            <img src={logoPreview} alt="preview" className="mt-2 w-20 h-20 object-cover rounded" />
          )}
        </div>

        {/* Game Type */}
        <div>
          <label className="block mb-1 text-sm font-medium">Game Type *</label>
          <div className="flex gap-4 items-center mt-1">
            <div className="flex items-center">
              <RadioButton
                inputId="create"
                name="game_type"
                value="User can create challange"
                onChange={(e) => setForm((f) => ({ ...f, game_type: e.value }))}
                checked={form.game_type === "User can create challange"}
              />
              <label htmlFor="create" className="ml-2 text-sm">
                User can Create Challenge
              </label>
            </div>
            <div className="flex items-center">
              <RadioButton
                inputId="nocreate"
                name="game_type"
                value="User cannot create challange"
                onChange={(e) => setForm((f) => ({ ...f, game_type: e.value }))}
                checked={form.game_type === "User cannot create challange"}
              />
              <label htmlFor="nocreate" className="ml-2 text-sm">
                User can't Create Challenge
              </label>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div>
  <label className="block mb-1 text-sm font-medium">Coming Soon *</label>
  <div className="flex gap-4 items-center mt-1">
    <div className="flex items-center">
      <RadioButton
        inputId="yes"
        name="coming_soon"
        value={true}
        onChange={(e) => setForm((f) => ({ ...f, coming_soon: e.value }))}
        checked={form.coming_soon === true}
      />
      <label htmlFor="yes" className="ml-2 text-sm">Yes</label>
    </div>
    <div className="flex items-center">
      <RadioButton
        inputId="no"
        name="coming_soon"
        value={false}
        onChange={(e) => setForm((f) => ({ ...f, coming_soon: e.value }))}
        checked={form.coming_soon === false}
      />
      <label htmlFor="no" className="ml-2 text-sm">No</label>
    </div>
  </div>
</div>


        {/* Game Rules */}
        <div className="col-span-1 md:col-span-2">
          <label className="block mb-1 text-sm font-medium">Game Rules</label>
          <div className="dark:border dark:border-zinc-700 dark:rounded text-black dark:text-white">
            <Editor
              value={form.game_rules}
              onTextChange={(e) =>
                setForm((prev) => ({ ...prev, game_rules: e.htmlValue }))
              }
              style={{ height: "200px", backgroundColor: "inherit" }}
              className="text-black dark:text-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-1 md:col-span-2 text-right mt-4">
          <Button
            label={isEditMode ? "Update Game" : "Create Game"}
            type="submit"
            className="p-button-sm"
            severity="success"
          />
        </div>
      </form>
    </div>
  );
}

export default CreateGame;
