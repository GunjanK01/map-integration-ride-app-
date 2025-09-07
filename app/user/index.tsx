import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export default function UserScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<Id<"rides"> | null>(null);
  const [rideStatus, setRideStatus] = useState<string>('');

  const createRide = useMutation(api.rides.createRide);
  const currentRide = useQuery(api.rides.getRideById, 
    currentRideId ? { rideId: currentRideId } : "skip"
  );

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Allow location access to use this app');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const handleBookRide = async () => {
    if (!pickup || !destination || !location) {
      Alert.alert('Error', 'Please fill all fields and ensure location is available');
      return;
    }

    try {
      // Simple distance calculation (in real app, use proper routing API)
      const distance = Math.random() * 10 + 2; // 2-12 km
      const duration = distance * 3; // ~3 min per km
      const fare = distance * 15; // $15 per km

      const rideId = await createRide({
        userId: `user_${Date.now()}`,
        pickup: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: pickup,
        },
        destination: {
          latitude: location.coords.latitude + (Math.random() - 0.5) * 0.01,
          longitude: location.coords.longitude + (Math.random() - 0.5) * 0.01,
          address: destination,
        },
        fare: Math.round(fare),
        distance: Math.round(distance * 100) / 100,
        duration: Math.round(duration),
      });

      setCurrentRideId(rideId);
      setRideStatus('pending');
      setShowBookingModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to book ride');
    }
  };

  const renderRideStatusModal = () => (
    <Modal visible={showBookingModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {rideStatus === 'pending' && (
            <>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.modalTitle}>Finding a driver...</Text>
              <Text style={styles.modalText}>Please wait while we find you a ride</Text>
            </>
          )}
          
          {rideStatus === 'accepted' && currentRide && (
            <>
              <Text style={styles.modalTitle}>Driver Found!</Text>
              <Text style={styles.modalText}>Your driver is on the way</Text>
              <View style={styles.rideDetails}>
                <Text style={styles.detailText}>Distance: {currentRide.distance} km</Text>
                <Text style={styles.detailText}>Duration: ~{currentRide.duration} min</Text>
                <Text style={styles.detailText}>Fare: ${currentRide.fare}</Text>
              </View>
            </>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowBookingModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Simulate ride acceptance after 3 seconds
  useEffect(() => {
    if (rideStatus === 'pending') {
      const timer = setTimeout(() => {
        setRideStatus('accepted');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus]);

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          followsUserLocation
        >
          {currentRide && currentRide.riderLocation && (
            <>
              <Marker
                coordinate={currentRide.riderLocation}
                title="Driver"
                pinColor="blue"
              />
              <Polyline
                coordinates={[
                  { latitude: location.coords.latitude, longitude: location.coords.longitude },
                  currentRide.riderLocation,
                ]}
                strokeColor="#2196F3"
                strokeWidth={3}
              />
            </>
          )}
        </MapView>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pickup location"
            placeholderTextColor="#666"
            value={pickup}
            onChangeText={setPickup}
          />
          <TextInput
            style={styles.input}
            placeholder="Where to?"
            placeholderTextColor="#666"
            value={destination}
            onChangeText={setDestination}
          />
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
          <Text style={styles.bookButtonText}>Book Ride</Text>
        </TouchableOpacity>
      </View>

      {renderRideStatusModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  rideDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});