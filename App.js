import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Mock database - In production, replace with Convex or Firebase
let mockDatabase = {
  rides: [],
  riderLocations: {},
};

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Main App Component
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userType, setUserType] = useState(null);
  const [userId] = useState(generateId());

  const navigateTo = (screen, type = null) => {
    setCurrentScreen(screen);
    if (type) setUserType(type);
  };

  if (currentScreen === 'splash') {
    return <SplashScreen onNavigate={navigateTo} />;
  }

  if (currentScreen === 'customer') {
    return <CustomerScreen userId={userId} onBack={() => navigateTo('splash')} />;
  }

  if (currentScreen === 'rider') {
    return <RiderScreen userId={userId} onBack={() => navigateTo('splash')} />;
  }

  return <SplashScreen onNavigate={navigateTo} />;
}

// Splash Screen Component
function SplashScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.splashContent}>
        <Text style={styles.title}>🚗 Simple Ride App</Text>
        <Text style={styles.subtitle}>Choose your role</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roleButton, styles.customerButton]}
            onPress={() => onNavigate('customer', 'customer')}
          >
            <Text style={styles.roleButtonText}>👤 Customer</Text>
            <Text style={styles.roleSubtext}>Book a ride</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleButton, styles.riderButton]}
            onPress={() => onNavigate('rider', 'rider')}
          >
            <Text style={styles.roleButtonText}>🏍️ Rider</Text>
            <Text style={styles.roleSubtext}>Accept rides</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Customer Screen Component
function CustomerScreen({ userId, onBack }) {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Current Location');
  const [myRides, setMyRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate getting location
    setTimeout(() => {
      setCurrentLocation('123 Main St, City Center');
    }, 1000);
    
    // Poll for ride updates
    const interval = setInterval(() => {
      const rides = mockDatabase.rides.filter(ride => ride.customerId === userId);
      setMyRides(rides);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const bookRide = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setIsLoading(true);
    
    // Create ride request
    const ride = {
      id: generateId(),
      customerId: userId,
      pickup: currentLocation,
      destination: destination.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    mockDatabase.rides.push(ride);
    setDestination('');
    setIsLoading(false);
    
    Alert.alert('Success', 'Ride requested! Waiting for a rider...');
  };

  const activeRide = myRides.find(ride => ride.status === 'accepted');
  const pendingRide = myRides.find(ride => ride.status === 'pending');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Simple Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>📍 Your Location</Text>
          <Text style={styles.locationText}>{currentLocation}</Text>
          {activeRide && (
            <View style={styles.riderInfo}>
              <Text style={styles.riderText}>🏍️ Rider en route!</Text>
              <Text style={styles.riderLocation}>
                Rider: {mockDatabase.riderLocations[activeRide.riderId] || 'Unknown location'}
              </Text>
            </View>
          )}
        </View>

        {/* Destination Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Where to?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter destination..."
            value={destination}
            onChangeText={setDestination}
            editable={!isLoading && !activeRide}
          />
          
          <TouchableOpacity
            style={[styles.bookButton, (isLoading || activeRide) && styles.disabledButton]}
            onPress={bookRide}
            disabled={isLoading || !!activeRide}
          >
            <Text style={styles.bookButtonText}>
              {isLoading ? 'Booking...' : activeRide ? 'Ride Active' : 'Book Ride'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ride Status */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Ride Status</Text>
          {myRides.length === 0 && (
            <Text style={styles.noRidesText}>No rides yet. Book your first ride!</Text>
          )}
          
          {myRides.map(ride => (
            <View key={ride.id} style={styles.rideCard}>
              <Text style={styles.rideDestination}>📍 To: {ride.destination}</Text>
              <Text style={styles.rideStatus}>
                Status: {ride.status === 'pending' ? '⏳ Finding rider...' : 
                        ride.status === 'accepted' ? '🚗 Rider coming!' : 
                        ride.status}
              </Text>
              {ride.riderId && (
                <Text style={styles.rideRider}>Rider: {ride.riderId}</Text>
              )}
              <Text style={styles.rideTime}>
                {new Date(ride.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Rider Screen Component
function RiderScreen({ userId, onBack }) {
  const [availableRides, setAvailableRides] = useState([]);
  const [myLocation, setMyLocation] = useState('Unknown');
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    // Simulate getting location
    setTimeout(() => {
      setMyLocation('Downtown Area, City');
      mockDatabase.riderLocations[userId] = 'Downtown Area, City';
    }, 1000);

    // Poll for available rides
    const interval = setInterval(() => {
      const rides = mockDatabase.rides.filter(ride => ride.status === 'pending');
      setAvailableRides(rides);
      
      // Check if we have an active ride
      const active = mockDatabase.rides.find(ride => ride.riderId === userId && ride.status === 'accepted');
      setActiveRide(active);
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  const acceptRide = (ride) => {
    // Update ride status
    const rideIndex = mockDatabase.rides.findIndex(r => r.id === ride.id);
    if (rideIndex !== -1) {
      mockDatabase.rides[rideIndex] = {
        ...mockDatabase.rides[rideIndex],
        riderId: userId,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      };
      
      Alert.alert('Success', `Ride accepted! Heading to ${ride.pickup}`);
      
      // Simulate movement
      simulateMovement(ride.id);
    }
  };

  const simulateMovement = (rideId) => {
    const locations = [
      'Moving towards pickup...',
      'Almost at pickup location',
      'Arrived at pickup!',
      'Passenger picked up',
      'En route to destination',
      'Arriving at destination',
    ];
    
    let locationIndex = 0;
    const moveInterval = setInterval(() => {
      if (locationIndex < locations.length) {
        mockDatabase.riderLocations[userId] = locations[locationIndex];
        locationIndex++;
      } else {
        // Complete the ride
        const rideIndex = mockDatabase.rides.findIndex(r => r.id === rideId);
        if (rideIndex !== -1) {
          mockDatabase.rides[rideIndex].status = 'completed';
        }
        clearInterval(moveInterval);
        setActiveRide(null);
        Alert.alert('Ride Complete', 'You have completed the ride!');
      }
    }, 3000);
  };

  if (activeRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Ride</Text>
        </View>

        <View style={styles.activeRideContainer}>
          <Text style={styles.activeRideTitle}>🚗 Ride in Progress</Text>
          <Text style={styles.activeRideDetail}>Customer: {activeRide.customerId}</Text>
          <Text style={styles.activeRideDetail}>Pickup: {activeRide.pickup}</Text>
          <Text style={styles.activeRideDetail}>Destination: {activeRide.destination}</Text>
          
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <Text style={styles.currentLocation}>{myLocation}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rides</Text>
      </View>

      <View style={styles.riderLocationBox}>
        <Text style={styles.locationLabel}>📍 Your Location:</Text>
        <Text style={styles.riderLocationText}>{myLocation}</Text>
      </View>

      <ScrollView style={styles.content}>
        {availableRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>🔍 No rides available</Text>
            <Text style={styles.emptyStateSubtext}>New ride requests will appear here</Text>
          </View>
        ) : (
          availableRides.map(ride => (
            <View key={ride.id} style={styles.rideRequestCard}>
              <Text style={styles.rideRequestTitle}>🚗 New Ride Request</Text>
              <Text style={styles.rideRequestDetail}>📍 From: {ride.pickup}</Text>
              <Text style={styles.rideRequestDetail}>🎯 To: {ride.destination}</Text>
              <Text style={styles.rideRequestDetail}>👤 Customer: {ride.customerId}</Text>
              <Text style={styles.rideRequestTime}>
                ⏰ {new Date(ride.createdAt).toLocaleTimeString()}
              </Text>
              
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptRide(ride)}
              >
                <Text style={styles.acceptButtonText}>✅ Accept Ride</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Splash Screen Styles
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  roleButton: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  customerButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  riderButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  roleButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  roleSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Map Placeholder Styles
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
  },
  mapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  riderInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  riderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  riderLocation: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 5,
  },

  // Input Section Styles
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  bookButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Status Section Styles
  statusSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  noRidesText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  rideCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  rideDestination: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  rideStatus: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 5,
  },
  rideRider: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  rideTime: {
    fontSize: 12,
    color: '#6c757d',
  },

  // Rider Screen Styles
  riderLocationBox: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  locationLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  riderLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
  },
  
  rideRequestCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideRequestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  rideRequestDetail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  rideRequestTime: {
    fontSize: 12,
    color: '#adb5bd',
    marginBottom: 15,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Active Ride Styles
  activeRideContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  activeRideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 30,
  },
  activeRideDetail: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    paddingLeft: 10,
  },
  statusBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 10,
  },
  currentLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
  },
});