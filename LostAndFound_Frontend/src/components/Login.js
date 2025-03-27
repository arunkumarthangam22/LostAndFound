import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../api";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("user_email");
    // console.log("📧 Retrieved Email:", userEmail);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login/", formData);

      const { access, refresh, user } = response.data;

      if (user && user.email) {
        localStorage.setItem("user_email", user.email);
      } else {
        console.error(" Email not found in response data.");
      }

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      dispatch(loginSuccess({ access, refresh }));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || " Invalid credentials.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container
    maxWidth="xl"
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "80vh",
    }}
  >
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={3}
      sx={{ width: "100%" }}
     
    >
      <Grid item xs={12} sm={8} md={6}>
        <Card
          sx={{
            boxShadow: 10,
            borderRadius: 6,
            bgcolor: "background.paper",
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
                Welcome Back!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please enter your login credentials to continue.
              </Typography>
            </Box>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={4000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                severity={error ? "error" : "success"}
                variant="filled"
                sx={{ width: "100%" }}
              >
                {error || "Login Successful! 🎉"}
              </Alert>
            </Snackbar>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading || !formData.username || !formData.password}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>
            </form>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Button
                  href="/register"
                  variant="text"
                  color="primary"
                  size="small"
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Container>
  );
};

export default Login;
