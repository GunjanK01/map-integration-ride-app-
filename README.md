RideNow - Real-time Ride Booking App 👋

This is a complete ride booking application built with Expo, React Native, Convex, and OpenStreetMap.
No Google Maps API required! 🌍

Get started

Install dependencies

npm install


Start the app

npx expo start


In the output, you’ll find options to open the app in a:

Development build

Android emulator

iOS simulator

Expo Go
, a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the app directory.
This project uses file-based routing
.

Features

🎯 Role selection (User / Driver)

⚡ Real-time updates with Convex

🗺️ Live maps powered by OpenStreetMap

📡 GPS-based location tracking

🚖 Ride booking & driver dashboard

💵 Automatic fare calculation

Project structure
ridenow-app/
├── app/              # Screens (Expo Router)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── role-selection.tsx
│   ├── user/         # User booking flow
│   └── rider/        # Driver dashboard
├── convex/           # Backend (Convex)
│   ├── schema.ts
│   └── rides.ts
├── assets/           # Images & icons
├── .env.example      # Environment variables
├── package.json
└── app.json

Learn more

To learn more about developing with Expo and Convex, check out:

Expo documentation

Learn Expo tutorial

Convex documentation

Join the community

Expo on GitHub

Convex on GitHub

Expo Discord
