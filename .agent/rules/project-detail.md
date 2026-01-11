---
trigger: always_on
---

# Project Name: IronLog (Working Title)
**Type:** Personal Mobile Workout Tracker Application

## 1. Project Overview
A personal, frictionless mobile application designed to track gym workouts, manage training programs, and visualize progress. The core philosophy is **"Data over Distraction"**—minimizing clicks while entering data during a workout, but maximizing insights post-workout.

## 2. Core Features & Functional Requirements

### A. Dashboard (Home Tab)
The command center for analyzing performance.
1.  **Streak Counter:** Simple visual counter of consecutive days/weeks worked out.
2.  **Weekly/Month/Year Dashboard:** A card-style view showing workouts completed in the current week/month/year.Ability to toggle dashboard views between Week, Month, and Year.
3.  **PR Feed:** A section highlighting recent Personal Records (highest weight moved for specific exercises).

### B. Program Manager (Program Tab)
View and select workout routines.
1.  **Program List:** Displays available routines (e.g., Push-Pull-Legs, Upper/Lower).
2.  **JSON Import:** Programs are loaded via a `.json` file upload. No in-app program creator initially.
3.  **Program Detail View:**
    * List of workouts within the program (e.g., "Push A", "Pull B").
    * List of exercises within a workout.
    * Display target Sets, Rep ranges, and logic (Strength vs. Hypertrophy).

### C. Active Workout (The Logger)
The primary screen used while at the gym.
1.  **Workout Context:** Shows the current workout name and target duration.
2.  **Exercise List (Feed):** Vertical list of exercises to complete.
3.  **Smart History:** Immediately visible "Last Session" data (Weight x Reps) displayed above the input fields for the current exercise.
4.  **Logging Mechanism:**
    * Input fields for Weight (kg/lbs), Reps, and RPE (Rate of Perceived Exertion 1-10).
    * Checkbox to mark a set as "Complete."
5.  **Rest Timer:** Automatic or manual timer button. Defaults based on exercise type (e.g., 3m for Strength, 90s for Hypertrophy).
6.  **Exercise Info Modal:** Clicking an exercise name opens a modal showing:
    * Instructions (text only).
    * Detailed History (list of past performance).
    * Substitution options (filter by muscle group).
7.  **Partial Completion:** Users can finish a workout without checking off every single exercise.

### D. Exercise Library & History (New Tab)
A reference guide and historical log.
1.  **Searchable List:** Full list of exercises parsed from the master `exercises.json`.
2.  **Filtering:** Filter by Body Part (Chest, Back) or Equipment (Barbell, Dumbbell).
3.  **Detail View:**
    * Text instructions.
    * Personal history log (scrollable list of dates and stats).
    * Placeholder icons (No heavy images).

## 3. Data Architecture

### Master Data (`exercises.json`)
* **Role:** Read-only library.
* **Key Fields Used:** `id`, `name`, `primaryMuscles`, `secondaryMuscles`, `category` (strength/cardio), `mechanic` (compound/isolation), `instructions`.

### Program Data (`program.json`)
* **Role:** Definition of the plan.
* **Structure:**
    ```json
    {
      "programName": "String",
      "workouts": [
        {
          "name": "String",
          "exercises": [
            { "id": "String", "sets": Int, "reps": "String", "rest": Int }
          ]
        }
      ]
    }
    ```

### User User Data (Local Database)
* **WorkoutLogs:** Stores date, program used, and duration.
* **SetLogs:** Stores exercise ID, weight, reps, RPE, timestamp.

## 4. Constraints & Non-Goals (v1)
* **No Cloud Sync:** Local storage only for v1.
* **No Social Features:** This is for personal use only.
* **No In-App Program Creator:** Editing done via JSON file.
* **No Heavy Media:** No exercise videos or high-res images to keep app size small.