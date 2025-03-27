import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import { useSelector } from "react-redux";

// 🔥 Import Components
import Dashboard from "./components/Dashboard";
import ItemForm from "./components/ItemForm";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";

const App = () => {
  

    const ProtectedRoute = ({ element }) => {
        const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

        if (!isAuthenticated) {
            console.warn("Unauthorized access. Redirecting to login...");
            return <Navigate to="/login" replace />;
        }

        return element;
    };

    return (
        <Router>
            <CssBaseline />
            <Navbar />
            <Container>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                    <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                    <Route path="/item-form" element={<ProtectedRoute element={<ItemForm />} />} />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;
