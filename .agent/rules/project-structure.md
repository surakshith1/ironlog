---
trigger: always_on
---

# Expo/React Native Project Architecture Standard

This document outlines the standard architecture, organization, and best practices for robust Expo/React Native applications. It is designed to be used as a **System Prompt** or **Template** for initializing new projects.

---

## 1. Directory Structure

The project follows a **Feature-First** and **Separation of Concerns** philosophy.

```text
/
├── assets/             # Static assets (fonts, images, icons)
├── components/         # Reusable UI components
│   ├── business/       # "Smart" components (connected to store/API, domain logic)
│   ├── display/        # "Dumb" components (pure UI, receive props only)
│   └── inputs/         # Standardized form inputs (TextInput, Pickers, etc.)
├── constants/          # App-wide constants (colors, secrets, enums)
│   └── theme.ts        # Design system tokens (colors, spacing, typography)
├── api/                # Encapsulated API layer (services, DTOs/models)
│   ├── services/       # API call definitions (AuthService, UserService)
│   └── models/         # TypeScript interfaces for API responses
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx    # Root switching logic (Auth vs Main)
│   └── [Feature]Stack.tsx  # Specific stacks (HomeStack, ProfileStack)
├── screens/            # Page-level components (entry points for routes)
├── store/              # Global state management (Zustand)
├── utils/              # Helper functions (date formatting, validation)
└── App.tsx             # Application Entry Point (Providers, Listeners)
```

---

## 2. Navigation Pattern (React Navigation)

**Standard:** Use a "Switching Root" pattern. The root navigator listens to the global authentication state and switches between an `AuthNavigator` and a `MainNavigator`. This avoids complex reset actions on login/logout.

### Generic Example: `navigation/AppNavigator.tsx`

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useStore } from '../store'; // Global store
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { theme } from '../constants/theme';

export const AppNavigator = () => {
  // Select only what you need to prevent unnecessary re-renders
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer theme={theme}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

---

## 3. State Management Standard (Zustand)

**Standard:** Use **Zustand** for global state. Split state into **Slices** to prevent a monolithic store file. Use `persist` middleware for data that should survive app restarts (like Auth tokens).

### Generic Example: `store/index.ts` (Store Composition)

```tsx
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Define Slices
interface AuthSlice {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

const createAuthSlice = (set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
});

// 2. Combine Slices into one Store
interface StoreState extends AuthSlice {} // Add other slices here

export const useStore = create<StoreState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      // ...createOtherSlice(set, get, api),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token }), // Whitelist persisted keys
    }
  )
);
```

---

## 4. API Layer Architecture

**Standard:** Never call `axios` or `fetch` directly in UI components. Encapsulate all network logic in a dedicated `api/` directory using Service classes or objects. This allows for easy refactoring and centralized error handling.

### Generic Example: `api/services/AuthService.ts`

```tsx
import axios from 'axios';
import { AuthResponse, LoginCredentials } from '../models';

// Configure base instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Handle or rethrow standard error format
      throw error;
    }
  },

  logout: async () => {
    // API call to invalidate session if needed
  }
};
```

**Usage in Component:**
```tsx
// Clean and readable
const handleLogin = async () => {
    const data = await AuthService.login({ email, password });
    setToken(data.token);
};
```

---

## 5. Component Organization Criteria

**Standard:** Distinguish clearly between **Display** and **Business** components.

| Type | Directory | Characteristics | Example |
|------|-----------|-----------------|---------|
| **Display** | `components/display` | **Stateless**, Visual only. Receives data via Props. No API calls. No Store access. | `CustomButton`, `Card`, `Badge` |
| **Business** | `components/business` | **Stateful**. Connects to Store/API. Contains domain logic. Composes Display components. | `UserProfileCard`, `LoginForm` |
| **Screens** | `screens/` | **Page Entry**. corresponds to a Route. orchestrates the page layout. | `HomeScreen`, `SettingsScreen` |

---

## Appendix: Generic System Prompt

*Copy and paste the block below to instruct an AI Assistant to follow this architecture.*

> **Role**: You are an expert React Native/Expo Architect.
> **Constraint**: You must strictly follow the "Feature-First" and "Separated Concerns" architecture.
>
> **Rules**:
> 1. **Navigation**: Use `react-navigation`. centralize logic in `navigation/`. Use a "Switching Root" pattern for Auth flows.
> 2. **State**: Use `zustand`. Split stores into slices. Persist sensitive data with `AsyncStorage`.
> 3. **API**: Create a dedicated `api/` folder. Never write `fetch/axios` in a React Component. Use Service objects (e.g., `AuthService`).
> 4. **Components**:
>    - Place reusable generic UI in `components/display`.
>    - Place domain-specific logic in `components/business`.
>    - Place form inputs in `components/inputs`.
> 5. **Styling**: Use a centralized `constants/theme.ts` for all colors and spacing. Avoid hardcoded hex values in components.
>
> **Objective**: Build a scalable, maintainable codebase that allows for easy testing and future expansion.
