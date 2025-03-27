import React, { useEffect, useState } from "react";
import axiosInstance from "../api"; // ✅ Import axiosInstance
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Avatar,
} from "@mui/material";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reportedItems, setReportedItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [editItem, setEditItem] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profileResponse] = await Promise.all([
        axiosInstance.get("/user/profile/"),
      ]);

      setUser(profileResponse.data.user);
      setReportedItems(profileResponse.data.posted_items);
    } catch (error) {
      handleApiError(error, "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, message) => {
    // console.error(error);
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
    } else {
      setError(message);
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setEditItem({ ...editItem, image: e.target.files[0] });
  };

  const handleEditSubmit = async () => {
    if (editItem.category === "found") {
      const confirmChange = window.confirm(
        "Are you sure you want to mark this item as 'found'? This will notify all users."
      );
      if (!confirmChange) {
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("title", editItem.title);
      formData.append("description", editItem.description);
      formData.append("category", editItem.category);
      formData.append("location", editItem.location);
      if (editItem.image && editItem.image instanceof File) {
        formData.append("image", editItem.image);
      }

      await axiosInstance.put(`/items/${editItem.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbarMessage("Item updated successfully! Users notified.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setOpenEditDialog(false);
      fetchUserData();
    } catch (error) {
      handleApiError(error, "Failed to update item.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/items/${itemId}/`);

      setSnackbarMessage("Item deleted successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      fetchUserData();
    } catch (error) {
      handleApiError(error, "Failed to delete item.");
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 5,
        borderRadius: 3,
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="green">
          My Profile
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Box>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              mb: 3,
              p: 2,
              backgroundColor: "#fff",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  alt={user.username}
                  src={user.profile_image || "/default-avatar.png"}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {user.username}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h5" fontWeight="bold" mb={2}>
            My Reported Items
          </Typography>

          <Grid container spacing={3}>
            {reportedItems.length > 0 ? (
              reportedItems.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      boxShadow: 9,
                      borderRadius: 2,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    {item.image && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={item.image}
                        alt={item.title}
                        sx={{
                          objectFit: "cover",
                          borderRadius: "8px 8px 0 0",
                        }}
                      />
                    )}
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {item.description}
                      </Typography>
                      <Typography variant="body2">
                        📍 Location: {item.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          item.category === "lost" ? "error.main" : "success.main"
                        }
                      >
                        🏷️ Category: {item.category.toUpperCase()}
                      </Typography>

                      <Box mt={2} display="flex" justifyContent="space-between">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditClick(item)}
                          size="small"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  align="center"
                  mt={3}
                >
                  📭 No items reported yet.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        <Typography variant="body1" color="error">
          Unable to load profile.
        </Typography>
      )}

      {editItem && (
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle fontWeight="bold">Edit Reported Item</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={editItem.title}
              onChange={handleEditChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editItem.description}
              onChange={handleEditChange}
              margin="dense"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={editItem.location}
              onChange={handleEditChange}
              margin="dense"
            />
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={editItem.category}
              onChange={handleEditChange}
              margin="dense"
            >
              <MenuItem value="lost">Lost</MenuItem>
              <MenuItem value="found">Found</MenuItem>
            </TextField>
            <Box mt={2}>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} color="primary" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
