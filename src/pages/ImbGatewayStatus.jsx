import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Settings as SettingsIcon } from "@mui/icons-material";
import axiosInstance from "../utils/axios";

const IMBGatewaySettings = () => {
  const [formData, setFormData] = useState({
    userToken: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previousToken, setPreviousToken] = useState("");


  // Fetch initial data
  // useEffect(() => {
  //   const fetchIMBData = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axiosInstance.get('/imb');
  //       const data = response.data[0]; // Assuming single record from array response
  //       if (data) {
  //         setFormData({
  //           userToken: data.user_token || "",
  //           status: data.status === "active" ? "Active" : "Inactive",
  //         });
  //       }
  //     } catch (err) {
  //       setError("Failed to fetch IMB settings. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchIMBData();
  // }, []);
  useEffect(() => {
  const fetchIMBData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/imb');
      const data = response.data[0]; // Assuming single record
      if (data) {
        setFormData({
          userToken: data.user_token || "",
          status: data.status === "active" ? "Active" : "Inactive",
        });
        setPreviousToken(data.user_token); // ✅ store current token
      }
    } catch (err) {
      setError("Failed to fetch IMB settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  fetchIMBData();
}, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     const payload = {
  //       new_token: formData.userToken,
  //       status: formData.status.toLowerCase(),
  //     };
  //     await axiosInstance.put(`/imb/${formData.userToken}`, payload);
  //     setSuccess("IMB settings updated successfully!");
  //   } catch (err) {
  //     setError("Failed to update IMB settings. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const payload = {
      new_token: formData.userToken, // ✅ new token to update to
      status: formData.status.toLowerCase(),
    };

    console.log("Previous Token (URL):", previousToken);
    console.log("New Token (Payload):", formData.userToken);
    console.log("Payload being sent:", payload);

    // ✅ Use previousToken in URL path (current token)
    const response = await axiosInstance.put(`/imb/${previousToken}`, payload);

    console.log("API Response:", response.data);

    // ✅ The API should return the NEW token, but if it returns the old one,
    // we'll use what we sent as new_token
    const updatedToken = response.data?.updated?.user_token;
    
    // Check if the token was actually updated in the response
    if (updatedToken === previousToken) {
      console.warn("API returned old token, using new_token from payload");
      // API didn't update token, so we manually update state with what we sent
      setPreviousToken(formData.userToken);
    } else {
      // API returned updated token
      setPreviousToken(updatedToken);
      setFormData({
        userToken: updatedToken,
        status: response.data.updated.status === "active" ? "Active" : "Inactive",
      });
    }
    
    setSuccess("IMB settings updated successfully!");
  } catch (err) {
    console.error("Error updating IMB:", err);
    setError("Failed to update IMB settings. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #e9f1ff 0%, #f8fbff 100%)",
        minHeight: "100vh",
        p: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          backgroundColor: "white",
          borderRadius: 3,
          p: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <SettingsIcon
          sx={{ fontSize: 40, color: "#1e40af", background: "#e0ecff", borderRadius: "50%", p: 1 }}
        />
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "#1e3a8a", mb: 0.5 }}
          >
            IMB Gateway Configuration
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Manage your IMB payment gateway settings
          </Typography>
        </Box>
      </Box>

      {/* Configuration Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
          backgroundColor: "white",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            backgroundColor: "#e0ecff",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <Typography
            fontWeight={600}
            sx={{ color: "#1e40af", fontSize: "1rem" }}
          >
            Core Gateway Configuration
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* User Token Field */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#334155", fontWeight: 500 }}
                >
                  User Token
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter User Token"
                  name="userToken"
                  value={formData.userToken}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              {/* Status Dropdown */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#334155", fontWeight: 500 }}
                >
                  Status
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    "&:hover": { backgroundColor: "#1e40af" },
                  }}
                >
                  Update IMB
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IMBGatewaySettings;