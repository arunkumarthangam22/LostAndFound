import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // State for mobile menu
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh_token");
    navigate("/login");
  };

  // Toggle mobile menu
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navbar items
  const navItems = isAuthenticated
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Report Item", path: "/item-form" },
        { name: "Profile", path: "/profile" },
      ]
    : [
        { name: "Login", path: "/login" },
        { name: "Register", path: "/register" },
      ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={4}
        sx={{
          background: "linear-gradient(90deg,rgb(3, 42, 82) 30%,rgb(93, 136, 146) 90%)",
          paddingX: 4,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Typography
            variant="h5"
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              letterSpacing: 1.5,
              color: "#fff",
            }}
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          >
            Lost & Found
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box>
              <Stack direction="row" spacing={3}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    color={
                      location.pathname === item.path ? "secondary" : "inherit"
                    }
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: "#fff",
                      fontWeight:
                        location.pathname === item.path ? "bold" : "normal",
                      letterSpacing: 0.8,
                      "&:hover": {
                        backgroundColor: "#ffffff22",
                        borderRadius: 2,
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
                {isAuthenticated && (
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      backgroundColor: "#f44336",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#d32f2f",
                      },
                      paddingX: 2,
                      fontWeight: "bold",
                      borderRadius: 2,
                    }}
                  >
                    Logout
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            backgroundColor: "#1976D2",
            color: "#fff",
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemText
                primary={item.name}
                sx={{
                  textAlign: "center",
                  fontWeight:
                    location.pathname === item.path ? "bold" : "normal",
                  color:
                    location.pathname === item.path ? "#64B5F6" : "#fff",
                }}
              />
            </ListItem>
          ))}
          {isAuthenticated && (
            <ListItem button onClick={handleLogout}>
              <ListItemText
                primary="Logout"
                sx={{
                  textAlign: "center",
                  color: "#FF5252",
                  fontWeight: "bold",
                }}
              />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
