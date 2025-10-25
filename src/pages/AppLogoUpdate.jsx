import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { Upload, Palette, ImageIcon } from "lucide-react";

const AppForm = () => {
  const [appLogo, setAppLogo] = useState(null);
  const [appName, setAppName] = useState("");
  const [appColor, setAppColor] = useState("#2196f3");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setAppLogo(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ appLogo, appName, appColor });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-start py-12">
      <Paper
        elevation={4}
        className="w-[92%] max-w-3xl rounded-2xl shadow-lg p-10"
        sx={{
          borderRadius: "1.5rem",
          background: "white",
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          fontWeight="bold"
          className="text-center mb-8 text-blue-600"
        >
          App Configuration
        </Typography>

        {/* Form */}
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {/* App Logo */}
          <Box className="flex flex-col items-center gap-4">
            {appLogo ? (
              <img
                src={appLogo}
                alt="App Logo"
                className="w-28 h-28 object-cover rounded-full shadow-md border"
              />
            ) : (
              <Box className="w-28 h-28 flex items-center justify-center border-2 border-dashed rounded-full bg-gray-50">
                <ImageIcon className="text-gray-400" size={36} />
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload size={16} />}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: "500",
              }}
            >
              Upload Logo
              <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </Button>
          </Box>

          {/* App Name */}
          <TextField
            label="App Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Enter your app name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon size={18} className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* App Color */}
          <Box className="flex items-center gap-4">
            <TextField
              label="App Color"
              value={appColor}
              onChange={(e) => setAppColor(e.target.value)}
              type="text"
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Palette size={18} className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
            <input
              type="color"
              value={appColor}
              onChange={(e) => setAppColor(e.target.value)}
              className="w-14 h-14 border rounded-lg cursor-pointer"
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              py: 1.4,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Save App Details
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default AppForm;
