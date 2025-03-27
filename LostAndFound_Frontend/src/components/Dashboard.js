import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ContactReporter from "./ContactReporter"; 

const Dashboard = () => {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [openContact, setOpenContact] = useState(false); 
  const [selectedItem, setSelectedItem] = useState(null); 
  // Fetch Items from Backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("https://lostandfound-backend-loxq.onrender.com/api/items/");
        
        setItems(response.data);
      } catch (err) {
        setError(" Failed to load items. Please try again.");
        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const userEmail = localStorage.getItem("user_email"); 
  // console.log(userEmail);


  const handleContact = (item) => {
    // console.log(item.contact_email);
    setSelectedItem(item);
    setOpenContact(true); // Open the Contact Reporter modal
  };

  return (
    <Container
    maxWidth="lg"
    sx={{
      py: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(255, 255, 255, 0)'
    }}
  >
    <Typography
      variant="h4"
      align="center"
      fontWeight="bold"
      gutterBottom
      sx={{
        letterSpacing: 1.2,
        mb: 3,
      }}
    >
      Lost & Found Items
    </Typography>
  
    <Snackbar
      open={openError}
      autoHideDuration={4000}
      onClose={() => setOpenError(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="error"
        onClose={() => setOpenError(false)}
        sx={{ width: "100%" }}
      >
        {error || "Something went wrong!"}
      </Alert>
    </Snackbar>
  
    {loading && (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress size={40} color="primary" />
      </Box>
    )}
  
    {!loading && items.length === 0 && (
      <Box textAlign="center" mt={3}>
        <Typography variant="h6" color="textSecondary">
           No items found. Be the first to report!
        </Typography>
      </Box>
    )}
  
    {!loading && items.length > 0 && (
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        {items.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={
                  item.image && item.image.startsWith("http")
                    ? item.image
                    : "/default-placeholder.png"
                }
                alt={item.title || "Lost Item"}
                onError={(e) => {
                  e.target.src = "/default-placeholder.png"; 
                }}
                sx={{
                  objectFit: "cover",
                  borderRadius: "12px 12px 0 0",
                }}
              />
  
              <CardContent
                sx={{
                  p: 2,
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: "#333" }}
                >
                  {item.title || "Untitled Item"}
                </Typography>
  
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      item.category === "lost" ? "#e57373" : "#4caf50",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  📋 {item.category ? item.category.toUpperCase() : "Unknown"}
                </Typography>
  
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  📍 Location: {item.location || "Unknown"}
                </Typography>
  
                {/* Contact Button */}
                <Button
                  variant="contained"
                  color={item.category === "found" ? "success" : "primary"}
                  fullWidth
                  sx={{
                    mt: 1,
                    py: 1,
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor:
                        item.category === "found" ? "#388E3C" : "#1565C0",
                    },
                  }}
                  onClick={() => handleContact(item)}
                  disabled={item.category === "found" || item.contact_email === userEmail }
                >
                  {item.category === "found"
                    ? "Item Found 🎉"
                    : "Contact Reporter"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  
    <Dialog
      open={openContact}
      onClose={() => setOpenContact(false)}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#1976D2",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        ✉️ Contact Reporter
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {selectedItem && (
          <ContactReporter
            itemId={selectedItem.id}
            contactEmail={selectedItem.contact_email || "N/A"}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={() => setOpenContact(false)}
          variant="outlined"
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
  
    
  );
};

export default Dashboard;
