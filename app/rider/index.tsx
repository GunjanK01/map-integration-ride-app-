import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Ride {
  _id: string;
  userId: string;
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  fare: number;
  distance: number;
  duration: number;
  status: string;
}

export default function RiderScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const pendingRides = useQuery(api.rides.getPendingRides);
  const acceptRide = useMutation(api.rides.acceptRide);
  const updateRiderLocation = useMutation(api.rides.updateRiderLocation);

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

  const handleAcceptRide = async (ride: Ride) => {
    try {
      await acceptRide({
        rideId: ride._id as any,
        riderId: `rider_${Date.now()}`,
      });

      // Update rider location for the accepted ride
      if (location) {
        await updateRiderLocation({
          rideId: ride._id as any,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });
      }

      Alert.alert('Success', 'Ride accepted! Navigate to pickup location.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept ride');
    }
  };

  const renderRideItem = ({ item: ride }: { item: Ride }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.fareText}>${ride.fare}</Text>
        <Text style={styles.distanceText}>{ride.distance} km</Text>
      </View>
      
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.pickup.address}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.destinationDot]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.destination.address}
          </Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <Text style={styles.detailText}>~{ride.duration} min</Text>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRide(ride)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <TouchableOpacity
          style={[styles.onlineToggle, isOnline && styles.onlineToggleActive]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <Text style={[styles.onlineToggleText, isOnline && styles.onlineToggleTextActive]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {pendingRides?.map((ride) => (
            <Marker
              key={ride._id}
              coordinate={{
                latitude: ride.pickup.latitude,
                longitude: ride.pickup.longitude,
              }}
              title={`$${ride.fare}`}
              description={ride.pickup.address}
              pinColor="green"
            />
          ))}
        </MapView>
      )}

      <View style={styles.ridesList}>
        <FlatList
          data={pendingRides || []}
          renderItem={renderRideItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ridesListContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isOnline ? 'No rides available' : 'Go online to see rides'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineToggle: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  onlineToggleActive: {
    backgroundColor: '#4CAF50',
  },
  onlineToggleText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  onlineToggleTextActive: {
    color: 'white',
  },
  map: {
    height: 200,
  },
  ridesList: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  ridesListContent: {
    paddingHorizontal: 20,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  fareText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  distanceText: {
    fontSize: 16,
    color: '#666',
  },
  locationInfo: {
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#FF5722',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },})