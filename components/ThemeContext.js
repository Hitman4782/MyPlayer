import React, { createContext, useState, useContext } from 'react';

// Define the theme context
const ThemeContext = createContext();

// Define a custom hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Define the ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Define the light mode and dark mode themes
  const darkTheme = {
    backgroundColor: '#2D3047',
    textColor: '#CCCEDE',
    cardBackground: '#44486A',
    favoriteIconColor: 'red',
    shareIconColor: 'red',
    addButtonColor: '#f1304d',
    inputColor: '#44486A',
    BottomNavigation: '#44486A',
    BottomIcon: '#CCCEDE'
  };

  const lightTheme = {
    backgroundColor: 'white',
    textColor: 'black',
    cardBackground: '#e2f5fa',
    favoriteIconColor: 'red',
    shareIconColor: 'red',
    addButtonColor: '#f1304d',
    inputColor: "white",
    BottomNavigation: 'white',
    BottomIcon: 'black'
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Use the appropriate theme based on the mode
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
