import { createContext, useContext, useState, useEffect } from "react";
import { 
  loginUser, 
  registerPatient, 
  registerDoctor, 
  logoutUser,
  getFirebaseToken 
} from "../services/api";

import { auth } from "../firebase";
import { signInWithCustomToken, signOut as firebaseSignOut } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectToFirebase = async () => {
    try {
      const data = await getFirebaseToken();
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
        console.log("Connected to Firebase Chat");
      }
    } catch (error) {
      console.error("Failed to connect to Firebase:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          await connectToFirebase();
        } catch (error) {
          console.error("Failed to parse user data", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      
      await connectToFirebase();

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const signup = async (userData, role) => {
    try {
      let response;
      
      if (role === 'doctor') {
        response = await registerDoctor(userData);
      } else {
        response = await registerPatient(userData);
      }

      const newUser = response.data;

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", newUser.token);

      await connectToFirebase();

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
        await logoutUser(); 
        await firebaseSignOut(auth); 
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