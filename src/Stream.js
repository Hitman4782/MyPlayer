import React, { Component, useState, useRef } from "react";
import { View, Text, StatusBar, StyleSheet, } from "react-native";
import MaterialTabs from "react-native-material-tabs";
import RadioStreamScreen from "./RadioStream";
import MusicStreamScreen from "./MusicStream";
import FavoriteScreen from "./Favorites";

const Home = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  let showList;
  if (selectedTab === 0) {
    showList = <RadioStreamScreen navigation={navigation} />;
  } else if (selectedTab === 1) {
    showList = <MusicStreamScreen navigation={navigation} />; 
  }else if (selectedTab === 2) {
    showList = <FavoriteScreen navigation={navigation} />;
  }
  return (
    <View style={styles.container}>
      
        <MaterialTabs
          items={["Radio Stream", "Music Stream", "Favorites"]}
          selectedIndex={selectedTab}
          onChange={setSelectedTab}
          barColor="#44486A"
          indicatorColor="#219ebc"
          inactiveTextColor="#CCCEDE"
          activeTextColor="#219ebc"
          uppercase={false}
        />
      
      <View style={styles.mainArea}>{showList}</View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D3047",
  },
  mainArea: {
    flex: 11,
  },
});
