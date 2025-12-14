import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session in localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await registerUser(userData);
      const newUser = response.data;

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", newUser.token);

      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Signup failed" 
      };
    }
  };

  const logout = async () => {
    try {
        await logoutUser(); // Notify backend to clear cookies
    } catch (error) {
        console.error("Logout error", error);
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};