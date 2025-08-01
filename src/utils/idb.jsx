import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval"; // Import IndexedDB helper

const AuthContext = createContext();
  const appKey = "CallCalendarApp";
  const priceDiscoutUsernames = ["puneet", "gunjan"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await get("LoggedInUser");
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (userData) => {
    const updatedUserData = {
    ...userData,
    appKey,
  };
    setUser(updatedUserData);
    await set("LoggedInUser", updatedUserData);
  };

  const logout = async () => {
    setUser(null);
    await del("LoggedInUser");
  };

  const setFavourites = async (favourites) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        favMenus: favourites,
      };
      set("LoggedInUser", updatedUser);
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, setFavourites,priceDiscoutUsernames }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
