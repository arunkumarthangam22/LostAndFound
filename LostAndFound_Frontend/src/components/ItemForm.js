import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../api";
import {
  TextField,
  Button,
  Container,
  Typography,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Paper,
} from "@mui/material";

const ItemForm = ({ mode = "report", existingItem = null }) => {
  const navigate = useNavigate();
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    title: existingItem?.title || "",
    description: existingItem?.description || "",
    category: existingItem?.category || "lost",
    location: existingItem?.location || "",
    contact_email: existingItem?.contact_email || "",
    image: existingItem?.image || null,
  });

  const [preview, setPreview] = useState(existingItem?.image || null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle Image Selection & Preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type and size (5MB limit)
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Only image files are allowed.");
        setOpenSnackbar(true);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size should be less than 5 MB.");
        setOpenSnackbar(true);
        return;
      }

      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setOpenSnackbar(false);

    let fcmToken = null;
    // if (!isEditMode) {
    //   try {
    //     fcmToken = await requestPermission();
    //   } catch (err) {
    //     console.warn("FCM permission denied.");
    //   }
    // }

    const submissionData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value) {
        if (typeof value === "string" && value.startsWith("http")) {
          const cleanedUrl = value.replace(/.*\/image\/upload\//, ""); 
          submissionData.append(key, cleanedUrl);
        } else if (value instanceof File) {
          submissionData.append(key, value);
        }
      } else if (value) {
        submissionData.append(key, value);
      }
    });

    if (fcmToken) submissionData.append("fcm_token", fcmToken);

    try {
      const token = localStorage.getItem("token");
      if (isEditMode && !token) {
        setErrorMessage("You must be logged in to edit.");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      const url = isEditMode ? `/items/${existingItem.id}/` : "/items/";
      const method = isEditMode ? "patch" : "post";
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axiosInstance[method](url, submissionData, { headers });

      setSuccessMessage(`Item ${isEditMode ? "updated" : "reported"} successfully!`);
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate("/dashboard"); // Redirect after submission
      }, 2000);

      if (!isEditMode) {
        setFormData({
          title: "",
          description: "",
          category: "lost",
          location: "",
          contact_email: "",
          image: null,
        });
        setPreview(null);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || `Failed to ${isEditMode ? "update" : "report"} item.`
      );
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
<Container maxWidth="sm">
  <Paper
    elevation={6}
    sx={{
      p: 4,
      mt: 4,
      borderRadius: 7,
      boxShadow: 9,
    }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      mb={3}
      align="center"
      sx={{
        color: "#1976D2",
        textTransform: "uppercase",
        letterSpacing: 1.2,
      }}
    >
      {isEditMode ? "Edit Item" : "Report a Lost Item"}
    </Typography>

    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <TextField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        fullWidth
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            backgroundColor: "#fff",
            "&:hover fieldset": { borderColor: "#1976D2" },
            "&.Mui-focused fieldset": { borderColor: "#1976D2", borderWidth: 2 },
          },
        }}
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        multiline
        rows={3}
        fullWidth
        variant="outlined"
      />

      <TextField
        select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        fullWidth
        variant="outlined"
      >
        <MenuItem value="lost">Lost</MenuItem>
      </TextField>

      <TextField
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
        fullWidth
        variant="outlined"
      />

      {!isEditMode && (
        <TextField
          label="Your Email"
          name="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
        />
      )}

      <Box
        sx={{
          border: "2px dashed #ccc",
          borderRadius: 3,
          p: 2,
          textAlign: "center",
          backgroundColor: "#fafafa",
          "&:hover": { borderColor: "#1976D2" },
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{
            cursor: "pointer",
            outline: "none",
          }}
          required
        />
      </Box>

      {preview && (
        <Box
          mt={2}
          sx={{
            textAlign: "center",
            border: "2px dashed #ccc",
            borderRadius: 3,
            p: 1,
            maxWidth: "300px",
            mx: "auto",
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{
          fontWeight: "bold",
          py: 1.2,
          borderRadius: 3,
          letterSpacing: 1,
          backgroundColor: "#1976D2",
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? "Update Item" : "Submit"}
      </Button>
    </form>

    <Snackbar
      open={openSnackbar}
      autoHideDuration={4000}
      onClose={() => setOpenSnackbar(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setOpenSnackbar(false)}
        severity={errorMessage ? "error" : "success"}
        variant="filled"
        sx={{
          backgroundColor: errorMessage ? "#d32f2f" : "#388e3c",
          color: "#fff",
        }}
      >
        {errorMessage || successMessage}
      </Alert>
    </Snackbar>
  </Paper>
</Container>

  );
};

export default ItemForm;
