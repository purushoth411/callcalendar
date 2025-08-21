import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval"; // Import IndexedDB helper
import moment from "moment-timezone";

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
      const now = moment().tz("Asia/Kolkata").valueOf();
      const twelveHours = moment.duration(12, "hours").asMilliseconds();

      if (now - storedUser.loginTime < twelveHours) {
        setUser(storedUser);
      } else {
        await del("LoggedInUser"); 
        setUser(null);
      }
    }
    setLoading(false);
  };

  fetchUser();
}, []);

const login = async (userData) => {
  const updatedUserData = {
    ...userData,
    appKey,
    loginTime: moment().tz("Asia/Kolkata").valueOf(), 
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
  const setUserArray = async (userArray) => {
  setUser((prev) => {
    const updatedUser = {
      ...prev,
      ...userArray, 
    };
    console.log("Updated User Array:", updatedUser);
    set("LoggedInUser", updatedUser); 
    return updatedUser;
  });
};

  return (
    <AuthContext.Provider
      value={{ user,setUser, login, logout, loading, setFavourites,setUserArray,priceDiscoutUsernames }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
