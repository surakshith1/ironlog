---
trigger: always_on
---

# Design Brief: "Iron & Clay" System

## 1. Design Philosophy
**"Stealth Utility"** — A sophisticated Dark Mode aesthetic maximizing legibility in dim gym environments. The system prioritizes data entry speed and clarity, using high-contrast elements and warm, earthy accents derived from the "Claude" dark mode aesthetic.

---

## 2. Color Palette

### Primary Colors
* **Primary White:** `#FFFFFF`
    * *Usage:* Primary Buttons, High-Emphasis Text.
* **Primary Background:** `#151517`
    * *Usage:* Deep, matte charcoal for the main global background.
* **Surface Grey:** `#222224`
    * *Usage:* Slightly lighter grey for Cards, Modals, and Settings items.

### Accent Colors
* **Clay Terra Cotta:** `#D68F70`
    * *Usage:* Active states, focus borders, specific highlights, and the "Streak" fire (Derived from the loading spinner).
* **Muted Blue:** `#768598`
    * *Usage:* Neutral interactive elements or unselected tabs.

### Functional Colors
* **Success Green:** `#81C784`
    * *Usage:* Desaturated for dark mode legibility; used for "Set Complete" checkboxes.
* **Error Red:** `#E57373`
    * *Usage:* Softened red for invalid inputs or destructive actions.
* **Input Grey:** `#2C2C2E`
    * *Usage:* Background for text entry fields.
* **Text Secondary:** `#A1A1AA`
    * *Usage:* Labels, previous stats context, and subtitles.

### Background Colors
* **App Background:** `#151517`
* **Modal Overlay:** `#000000` (60% Opacity)
* **Toast/Snackbar:** `#323232`

---

## 3. Typography

### Font Family
* **Primary Font:** `SF Pro Text` (iOS) / `Inter` (Android/Web)
    * *Usage:* General UI, instructions, navigation.
* **Data Font:** `SF Mono` / `JetBrains Mono`
    * *Usage:* Strictly for Weight, Reps, and Timer numbers to ensure tabular alignment.

### Font Weights
* **Regular:** 400
* **Medium:** 500
* **SemiBold:** 600

### Text Styles
* **Headings**
    * **Display:** 32px/38px, SemiBold, Tracking -0.5px (Current Workout Name)
    * **H1:** 24px/30px, SemiBold, Tracking -0.3px (Section Headers like "This Week")
    * **H2:** 20px/24px, Medium, Tracking -0.2px (Exercise Names)
* **Body Text**
    * **Body Main:** 16px/24px, Regular (Instructions, General UI)
    * **Body Secondary:** 14px/20px, Regular, Color `#A1A1AA` (Meta-data, "Last Session" history)
* **Data Entry (The Logger)**
    * **Input Large:** 24px, Medium, Monospace (Active typing field for Weight/Reps)
    * **Timer Display:** 32px, Monospace, Tracking 1px

---

## 4. Component Styling

### Buttons
* **Primary Action** (The "Finish" or "Save" button)
    * **Background:** White (`#FFFFFF`)
    * **Text:** Black (`#000000`)
    * **Height:** 50dp
    * **Corner Radius:** 25dp (Pill shape)
    * **Interaction:** Scale down 2% on press.
* **Secondary Action** (Timers, Add Set)
    * **Background:** Surface Grey (`#222224`)
    * **Text:** Clay Terra Cotta (`#D68F70`) or White (`#FFFFFF`)
    * **Border:** 1px solid `#3F3F46`
    * **Height:** 44dp
    * **Corner Radius:** 12dp

### Cards (Dashboard & Program View)
* **Standard Card**
    * **Background:** Surface Grey (`#222224`)
    * **Corner Radius:** 16dp
    * **Padding:** 16dp
    * **Border:** None (rely on value contrast with background)
    * **Shadow:** None (Flat design for performance feel)

### Input Fields (The Logger)
* **Gym Input**
    * **Height:** 56dp
    * **Corner Radius:** 12dp
    * **Background:** Input Grey (`#2C2C2E`)
    * **Text Color:** White (`#FFFFFF`)
    * **Border:** 1px solid Transparent (Default) / 1px solid Clay Terra Cotta (Active/Focused)
    * *Note:* Large touch targets are critical for gym usage.

### Icons
* **Style:** Filled/Solid (easier to read at a glance than thin outlines).
* **Size:** 24dp standard, 20dp small.
* **Color:** White for active tabs, Grey (`#52525B`) for inactive.

---

## 5. Spacing System
* **4dp - Micro:** Space between number and unit (e.g., "100 kg").
* **8dp - Small:** Padding inside buttons, space between list items.
* **16dp - Standard:** Page margins, card padding.
* **24dp - Section:** Space between "Exercise List" and "Rest Timer".
* **48dp - Reach:** Bottom padding to clear home bar.

---

## 6. Motion & Animation
* **Page Transitions:** 250ms `ease-out` (Slide from right).
* **Checkmark Completion:** 300ms `spring` (Bouncy effect when marking a set complete to give positive reinforcement).
* **Modal Slide:** 200ms `ease-in-out` (Slide up from bottom for Exercise History).

## 7. UI Framework to use
* **Framework:** gluestack ui
* **Icons:** Lucid
* Use stylesheet and gluestack UI components. Don't use nativewind or tailwind libraries strictly.