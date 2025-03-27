import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Card, CardContent, Typography, Snackbar, Alert } from "@mui/material";

const ContactReporter = ({ itemId, contactEmail }) => {
  const [formData, setFormData] = useState({
    item_id: itemId,
    sender_email: "", 
    message: "",
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
 
  useEffect(() => {
    const userEmail = localStorage.getItem("user_email"); 
    // console.log("Retrieved Email:", userEmail); 

    // console.log(userEmail);
    setFormData((prevData) => ({
      ...prevData,
      sender_email: userEmail || "", 
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendMessage = async () => {
    if (!formData.message.trim()) {
      setSnackbarMessage("Please enter a message.");
      setSnackbarType("error");
      setOpenSnackbar(true);
      return;
    }
  
    try {
      const response = await axios.post(
        "https://lostandfound-backend-loxq.onrender.com/api/contact-reporter/",
        {
          item_id: formData.item_id, 
          message: formData.message,
          mail:contactEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
        }
      );
  
      if (response.status === 200) {
        setSnackbarMessage(" Message sent successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
        setFormData({ ...formData, message: "" });
      }
    } catch (error) {
      // console.error(" Error sending message:", error.response?.data || error);
      setSnackbarMessage(" Failed to send message. Please try again.");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };
  
  return (
    <Card variant="outlined" sx={{ marginTop: 2, padding: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
           Contact Reporter
        </Typography>
        <TextField
          label="Your Email"
          name="sender_email"
          value={formData.sender_email}
          onChange={handleChange}
          disabled
          fullWidth
          margin="dense"
        />
        <TextField
          label="Reporter's Email"
          value={contactEmail || "N/A"}
          disabled
          fullWidth
          margin="dense"
        />
        <TextField
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="dense"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ marginTop: 2 }}
        >
          Send Message
        </Button>
      </CardContent>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity={snackbarType} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ContactReporter;
