import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Animated, Alert, Modal, TextInput, ActivityIndicator, ToastAndroid } from 'react-native';
import { Searchbar, Menu } from 'react-native-paper';
import { firebase } from '../../components/firebase';
import { Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../../components/ThemeContext';
import { getStyles } from './styles';

const RadioStreamScreen = ({ navigation }) => {
  const [radioStations, setRadioStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [newStationName, setNewStationName] = useState('');
  const [newStationLocation, setNewStationLocation] = useState('');
  const [newStationUrl, setNewStationUrl] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { theme, toggleTheme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('Favorites')
      .onSnapshot(
        (snapshot) => {
          const favoriteStations = snapshot.docs.map((doc) => doc.data());
          setFavorites(favoriteStations);
        },
        (error) => {
          console.error('Firebase error:', error.message);
          showToast('Error fetching favorites from Firebase.');
        }
      );

    return () => unsubscribe();
  }, []);

  const isFavorite = (station) => {
    return favorites.some(
      (fav) =>
        fav.Name === station.Name && fav.Location === station.Location && fav.url === station.url
    );
  };

  const toggleFavorite = async (station) => {
    try {
      const stationRef = firebase.firestore().collection('Favorites');
      if (isFavorite(station)) {
        await stationRef
          .where('Name', '==', station.Name)
          .where('Location', '==', station.Location)
          .where('url', '==', station.url)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });
      } else {
        await stationRef.add(station);
      }
    } catch (error) {
      console.error('Error adding/removing station from favorites:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('RadioStation')
      .onSnapshot(
        (snapshot) => {
          const stations = snapshot.docs.map((doc) => doc.data());
          setRadioStations(stations);
          setLoading(false);
        },
        (error) => {
          console.error('Firebase error:', error.message);
          showToast('Error fetching data from Firebase.');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        showToast('Please check your internet connection.');
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleStartPlaying = (url, name, index) => {
    if (url) {
      navigation.navigate('Player', {
        audioFile: { uri: url, isRadio: true, name: name },
        RadioIndex: index,
        radioStations: filteredRadioStations,
      });
    }
  };

  const handleAddStation = async () => {
    try {
      await firebase.firestore().collection('RadioStation').add({
        Name: newStationName,
        Location: newStationLocation,
        url: newStationUrl,
      });

      setNewStationName('');
      setNewStationLocation('');
      setNewStationUrl('');
      Alert.alert('Success', 'New radio station added!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding station:', error.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const showMenu = (station) => {
    setSelectedStation(station);
    setVisible(true);
  };

  const hideMenu = () => setVisible(false);

  const handleShare = async (selectedStation) => {
    if (selectedStation) {
      const { Name, Location, url } = selectedStation;
      try {
        const result = await Share.share({
          message: `Check out this radio station:\n${Name}\nLocation: ${Location}\nURL: ${url}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared via activity type (e.g. WhatsApp)
          } else {
            // Shared
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed
        }
      } catch (error) {
        console.error('Error sharing:', error.message);
      }
    }
    hideMenu();
  };

  const filteredRadioStations = radioStations
    .filter(
      (station) =>
        station.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.Location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((station, index) => ({ ...station, index }));

  const showAddPopup = () => {
    setShowPopup(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideAddPopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowPopup(false));
  };

  const renderRadioStationCard = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      style={styles.card}
      onPress={() => handleStartPlaying(item.url, item.Name, item.index)}
    >
      <View style={styles.radioInfo}>
        <Text style={styles.cardName}>{item.Name}</Text>
        <Text style={styles.cardLocation}>{item.Location}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item)}>
        {isFavorite(item) ? (
          <MaterialIcons name="favorite" size={24} color="red" />
        ) : (
          <MaterialIcons name="favorite-border" size={24} color="red" />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleShare(item)} style={styles.iconContainer}>
        <MaterialIcons name="share" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );



  return (
    <View style={styles.container}>

      <Text style={styles.Title}>Add or Play your Favorite Radio Stream</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Radio"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{
            backgroundColor: theme.cardBackground,
          }}
          placeholderTextColor={theme.textColor}
          iconColor={theme.textColor}
          inputStyle={{ color: theme.textColor }}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#f1304d" size="large" />
      ) : (
        <FlatList
          data={filteredRadioStations}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRadioStationCard}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal visible={showPopup} transparent>
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Station</Text>
            </View>
            <View style={styles.modalContent}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputColor, color: theme.textColor }]}
                placeholder="Name"
                value={newStationName}
                onChangeText={setNewStationName}
                placeholderTextColor="#CCCEDE"
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputColor, color: theme.textColor }]}
                placeholder="Location"
                value={newStationLocation}
                onChangeText={setNewStationLocation}
                placeholderTextColor="#CCCEDE"
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputColor, color: theme.textColor }]}
                placeholder="URL"
                value={newStationUrl}
                onChangeText={setNewStationUrl}
                placeholderTextColor="#CCCEDE"
              />
              <TouchableOpacity style={styles.Button} onPress={handleAddStation}>
                <Text style={styles.ButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.Button} onPress={hideAddPopup}>
                <Text style={styles.ButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.addButton} onPress={showAddPopup}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Text style={styles.themeToggleText}>Toggle Theme</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default RadioStreamScreen;
