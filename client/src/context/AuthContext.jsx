import { createContext, useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:4000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    axios.post("/auth/logout").finally(() => setUser(null));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
