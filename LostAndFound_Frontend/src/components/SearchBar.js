import React, { useState, useCallback } from "react";
import axiosInstance from "../api";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";

const SearchBar = ({ setItems }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // 🔹 Optimized Debounce API Call
  const fetchSearchResults = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data } = await axiosInstance.get(`/items/?search=${searchTerm}`);
        setItems(data);
      } catch (err) {
        setError("Failed to search. Please try again!");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    }, 500),
    [setItems]
  );

  // Handle Input Change
  const handleChange = (e) => {
    setQuery(e.target.value);
    fetchSearchResults(e.target.value);
  };

  // Clear Search Query
  const handleClear = () => {
    setQuery("");
    setItems([]);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        mb: 3,
        borderRadius: 3,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        {/* Modern Input Field */}
        <TextField
          fullWidth
          placeholder="Search by title, description, or location..."
          variant="outlined"
          value={query}
          onChange={handleChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#fff",
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "#1976D2",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976D2",
                borderWidth: 2,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} size="small">
                  <CloseIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Search Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{
            ml: 2,
            minWidth: "120px",
            fontWeight: "bold",
            letterSpacing: 1,
            borderRadius: 3,
            "&:hover": {
              backgroundColor: "#1565c0",
            },
            "&.Mui-disabled": {
              backgroundColor: "#ccc",
            },
          }}
          disabled={loading || !query.trim()}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
        </Button>
      </Box>

      {/* Snackbar for Error Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setOpenSnackbar(false)}
          sx={{
            backgroundColor: "#d32f2f",
            color: "#fff",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SearchBar;
