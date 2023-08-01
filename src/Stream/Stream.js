import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import MaterialTabs from "react-native-material-tabs";
import RadioStreamScreen from "../RadioStream/RadioStream";
import MusicStreamScreen from "../MusicStream/MusicStream";
import FavoriteScreen from "../Favorites/Favorites";
import { useTheme } from '../../components/ThemeContext';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    mainArea: {
      flex: 11,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 1,
      paddingTop: 0,
    },
    iconButton: {
      width: 40,
      height: 40,
      top: 4,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  // Function to toggle the theme
  const handleThemeToggle = () => {
    toggleTheme();
    // Store the updated theme state in AsyncStorage
    storeThemeState(theme);
  };

  // Function to store the theme state in AsyncStorage
  const storeThemeState = async (themeState) => {
    try {
      await AsyncStorage.setItem("@theme_state", JSON.stringify(themeState));
    } catch (error) {
      console.log("Error storing theme state: ", error);
    }
  };

  // Load the theme state from AsyncStorage on component mount
  useEffect(() => {
    const loadThemeState = async () => {
      try {
        const themeState = await AsyncStorage.getItem("@theme_state");
        if (themeState !== null) {
          toggleTheme(JSON.parse(themeState));
        }
      } catch (error) {
        console.log("Error loading theme state: ", error);
      }
    };

    loadThemeState();
  }, []);

  let showList;
  if (selectedTab === 0) {
    showList = <RadioStreamScreen navigation={navigation} />;
  } else if (selectedTab === 1) {
    showList = <MusicStreamScreen navigation={navigation} />;
  } else if (selectedTab === 2) {
    showList = <FavoriteScreen navigation={navigation} />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <MaterialTabs
          items={["Radio Stream", "Music Stream", "Favorites"]}
          selectedIndex={selectedTab}
          onChange={setSelectedTab}
          barColor={theme.backgroundColor}
          indicatorColor="#219ebc"
          inactiveTextColor={theme.textColor}
          activeTextColor="#219ebc"
          uppercase={false}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleThemeToggle}>
          <MaterialCommunityIcons
            name={theme.dark ? "weather-night" : "weather-night"}
            size={22}
            color="#219ebc"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.mainArea}>{showList}</View>
    </View>
  );
};

export default Home;
