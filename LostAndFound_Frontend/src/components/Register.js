import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";  
import {
  Container, TextField, Button, Card, CardContent, Typography, 
  CircularProgress, Snackbar, Alert, Box
} from "@mui/material";

const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("error");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        //  Basic frontend validation
        if (!formData.username) {
            setMessage(" Username is required");
            setOpenSnackbar(true);
            setLoading(false);
            return;
        }
        if (!formData.email.includes("@")) {
            setMessage(" Invalid email format");
            setOpenSnackbar(true);
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setMessage("Password must be at least 6 characters");
            setOpenSnackbar(true);
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/auth/register/", formData);

            // Store JWT token & Auto-login
            localStorage.setItem("token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            // Show success message
            setSeverity("success");
            setMessage(" Registration successful! Redirecting...");
            setOpenSnackbar(true);

            setTimeout(() => navigate("/dashboard"), 2000); //  Redirect after success
        } catch (error) {
            setSeverity("error");
            setMessage(error.response?.data?.email?.[0] || " Registration failed. Please try again.");
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
       <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "85vh",
      }}
    >
      <Box mt={8} width="100%">
        <Card
          sx={{
            boxShadow: 10,
            borderRadius: 6,
            p: 3,
          }}
        >
          <CardContent>
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                 Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join us and unlock exclusive features.
              </Typography>
            </Box>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <TextField
                fullWidth
                label="Username"
                name="username"
                variant="outlined"
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                margin="normal"
                onChange={handleChange}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>
            </form>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Button
                  href="/login"
                  variant="text"
                  color="primary"
                  size="small"
                >
                  Login
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={severity}
          onClose={() => setOpenSnackbar(false)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>

    );
};

export default Register;
