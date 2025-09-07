# RideNow - Ride Booking App

A complete ride booking application built with Expo, React Native, Convex, and OpenStreetMap.

## Features

- **Splash Screen**: Beautiful branded intro screen
- **Role Selection**: Choose between User (rider) and Driver
- **User Features**: 
  - Search and book rides
  - Live map with real-time location
  - Track driver location and route
  - Real-time ride status updates
- **Driver Features**:
  - View available rides on map
  - Accept ride requests
  - Real-time ride updates
- **Backend**: Convex for real-time database and live updates
- **Maps**: OpenStreetMap integration (no Google Maps dependency)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Convex

1. Install Convex CLI:
```bash
npm install -g convex
```

2. Create a Convex project:
```bash
npx convex dev
```

3. This will:
   - Create a new Convex project
   - Generate your Convex URL
   - Deploy your schema and functions

### 3. Environment Configuration

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Add your Convex URL to `.env`:
```
EXPO_PUBLIC_CONVEX_URL=https://your-generated-url.convex.cloud
```

### 4. Run the App

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web

## Project Structure

```
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout with Convex provider
│   ├── index.tsx          # Splash screen
│   ├── role-selection.tsx # Choose user/driver role
│   ├── user/
│   │   └── index.tsx      # User ride booking screen
│   └── rider/
│       └── index.tsx      # Driver rides screen
├── convex/                # Backend functions and schema
│   ├── schema.ts          # Database schema
│   └── rides.ts           # Ride management functions
└── assets/                # App icons and images
```

## Key Components

### User Flow
1. **Splash Screen** → **Role Selection** → **User Screen**
2. User enters pickup/destination locations
3. Books a ride (stored in Convex DB)
4. Real-time updates show when driver accepts
5. Live map shows driver location and route

### Driver Flow  
1. **Splash Screen** → **Role Selection** → **Driver Screen**
2. Driver sees available rides on map and in list
3. Can accept rides with one tap
4. Real-time location sharing with users

### Real-time Features
- Live ride status updates
- Driver location tracking
- Automatic ride matching
- Real-time database sync with Convex

## Database Schema

The app uses Convex with the following collections:

**Rides Collection:**
- User and rider IDs
- Pickup/destination coordinates and addresses
- Ride status (pending/accepted/in_progress/completed)
- Fare, distance, and duration
- Real-time rider location updates

**Users Collection:**
- User type (user/rider)
- Current location
- Online status

## Technologies Used

- **Frontend**: Expo 53, React Native, TypeScript
- **Navigation**: Expo Router
- **Maps**: react-native-maps with OpenStreetMap
- **Backend**: Convex (real-time database)
- **Location**: Expo Location
- **State Management**: Convex queries and mutations

## Development Notes

- No Google Maps API required (uses OpenStreetMap)
- No authentication needed (simplified for demo)
- Compatible with Expo SDK 53
- Uses only stable, conflict-free dependencies
- Supports iOS, Android, and Web

## Customization

You can easily customize:
- **Colors**: Update the color scheme in StyleSheet objects
- **Map Style**: Modify map props in MapView components  
- **Business Logic**: Edit Convex functions for custom ride matching
- **UI Components**: Modify screens in the `app/` directory

## Deployment

The app is ready for deployment with:
- Expo Application Services (EAS)
- App Store / Google Play Store
- Convex production deployment

Run `eas build` after setting up EAS CLI for building production apps.
