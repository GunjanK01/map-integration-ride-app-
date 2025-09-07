import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RoleSelection() {
  const router = useRouter();

  const handleRoleSelect = (role: 'user' | 'rider') => {
    if (role === 'user') {
      router.push('/user');
    } else {
      router.push('/rider');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>How would you like to use RideNow?</Text>
        
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, styles.userButton]}
            onPress={() => handleRoleSelect('user')}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <Text style={styles.roleTitle}>I need a ride</Text>
            <Text style={styles.roleDescription}>Book a ride to your destination</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, styles.riderButton]}
            onPress={() => handleRoleSelect('rider')}
          >
            <Text style={styles.roleIcon}>🚗</Text>
            <Text style={styles.roleTitle}>I'm a driver</Text>
            <Text style={styles.roleDescription}>Accept rides and earn money</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 50,
    textAlign: 'center',
  },
  roleContainer: {
    width: '100%',
    gap: 20,
  },
  roleButton: {
    backgroundColor: '#16213e',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userButton: {
    borderColor: '#4CAF50',
  },
  riderButton: {
    borderColor: '#2196F3',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});