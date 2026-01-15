# Ironlog

Ironlog is a fitness tracking, workout planning, and analytics application built with React Native and Expo.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Expo Go](https://expo.dev/client) app on your iOS or Android device

## Setup

1. **Clone the repository** (if you haven't already)
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the App

You can run the app using the following commands:

- **Start the development server**:
  ```bash
  npm start
  ```
  Or:
  ```bash
  npx expo start
  ```

- **Run on iOS Simulator** (requires Xcode / macOS):
  ```bash
  npm run ios
  ```

- **Run on Android Emulator** (requires Android Studio):
  ```bash
  npm run android
  ```

- **Run in Web Browser**:
  ```bash
  npm run web
  ```

## Running on iPhone (Expo Go)

To run the app on your physical iPhone using Expo Go:

1. **Install Expo Go**: Download the "Expo Go" app from the Apple App Store on your iPhone.
2. **Connect to Wi-Fi**: Ensure both your computer and your iPhone are connected to the **same Wi-Fi network**.
3. **Start the Project**:
   Run the following command in your terminal:
   ```bash
   npx expo start
   ```
4. **Scan QR Code**:
   - You will see a QR code in your terminal (and in the browser tab that may open).
   - Open the **Camera app** on your iPhone.
   - Point it at the QR code.
   - Tap the "Open in Expo Go" notification that appears.
   
   *Alternatively, you can open the Expo Go app directly and if you are logged in to the same Expo account, it might appear in the list, or you can manually enter the URL displayed in the terminal.*

## Project Structure

- `app/`: Main application source code.
- `components/`: Reusable UI components.
- `constants/`: Configuration and constants (e.g., Theme).
- `assets/`: Images and fonts.

## Troubleshooting

- **"No bundle URL present"**: Ensure the bundler (`npx expo start`) is running.
- **Connection issues**: Make sure devices are on the same network. You might need to disable your computer's firewall or change the connection mode to "Tunnel" by running `npx expo start --tunnel` if the LAN connection fails.
