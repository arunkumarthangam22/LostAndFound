import React, { useState, useEffect } from "react";
import ContactReporter from "./ContactReporter";

import axiosInstance from "../api";
import { 
  Card, CardMedia, CardContent, Typography, 
  Container, CircularProgress, Alert, Box, Grid 
} from "@mui/material";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance.get("/items/")
        .then((response) => {
            setItems(response.data);
        })
        .catch((err) => {
            const errorMessage = err.response
                ? err.response.data.error || " Server error, please try again later."
                : " Network error, check your internet connection.";
            setError(errorMessage);
            console.error("API Error:", err.response?.data || err.message);
        })
        .finally(() => {
            setLoading(false);
        });
}, []);



  return (
<Container
  maxWidth="lg"
  sx={{
    py: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    boxShadow: 3,
  }}
>
  <Typography
    variant="h4"
    align="center"
    fontWeight="bold"
    gutterBottom
    sx={{
      color: "#1976D2",
      letterSpacing: 1.2,
      mb: 3,
    }}
  >
    Lost & Found Items
  </Typography>

  {loading && (
    <Box display="flex" justifyContent="center" my={4}>
      <CircularProgress size={40} color="primary" />
    </Box>
  )}

  {error && (
    <Alert
      severity="error"
      sx={{
        my: 3,
        borderRadius: 2,
        fontSize: "0.9rem",
      }}
    >
      {error}
    </Alert>
  )}

  {!loading && items.length === 0 && (
    <Typography
      textAlign="center"
      color="textSecondary"
      variant="body1"
      sx={{
        fontStyle: "italic",
        my: 3,
      }}
    >
      No items found. Be the first to report! 📢
    </Typography>
  )}

  {!loading && items.length > 0 && (
    <Grid
      container
      spacing={4}
      justifyContent="center"
      sx={{
        mt: 2,
      }}
    >
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
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
                item.image?.startsWith("http")
                  ? item.image
                  : "https://placehold.co/300x200?text=No+Image"
              }
              alt={item.title || "Lost item"}
              sx={{
                objectFit: "cover",
                borderRadius: "12px 12px 0 0",
                backgroundColor: "#e0e0e0",
              }}
            />

            <CardContent sx={{ p: 2 }}>
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
                📦 {item.category ? item.category.toUpperCase() : "Unknown"}
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontSize: "0.9rem",
                  mb: 1,
                }}
              >
                📍 Location: {item.location || "Unknown"}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  mb: 2,
                }}
              >
                📝 {item.description || "No description available."}
              </Typography>

              <ContactReporter
                itemId={item.id}
                contactEmail={item.contact_email}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )}
</Container>

  );
};

export default ItemList;
