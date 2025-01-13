import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // Ensure fetch happens only once

  const fetchUser = async () => {
    try {
      const cachedUser = sessionStorage.getItem("user");

      // Use cached data if available
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setIsInitialized(true);
        return;
      }

      // Fetch from backend if no cached data exists
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/check`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data.valid) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture || "/default-avatar.png",
        };
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData)); // Cache in sessionStorage
      } else {
        setUser(null);
        sessionStorage.removeItem("user"); // Clear cached data if user is invalid
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      sessionStorage.removeItem("user");
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      fetchUser(); // Fetch only if not already initialized
    }
  }, [isInitialized]);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
