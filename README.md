# Fit Forge Frontend

**_This application was born out of our passion for fitness, nutrition, and coding._**

**_The app aims to be a food and workout tracker that is easy and enjoyable to use as well as a guideline for beginners._**

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Application Structure](#application-structure)
- [Code Organization](#code-organization)
- [Implementation Details](#implementation-details)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Development](#development)
- [Roadmap](#roadmap)

## Overview
Fit Forge is a comprehensive fitness and nutrition tracking application built with Angular. It allows users to track their food intake, monitor workouts, view progress over time, and receive personalized recommendations. The application is designed to be user-friendly and accessible for beginners while providing detailed insights for more experienced users.

## Features

### 1. Food Tracking
- Track daily food intake with detailed nutritional information
- Get comprehensive macro nutrient overview and analysis
- Visualize progress and get insights through charts and statistics
- Add custom food items and recipes to your personal library
- Search for food items in the database
- Scan barcodes to quickly add food items
- Use AI-powered food recognition to estimate nutritional content from images

### 2. Workout Tracking
- Log exercises and track progress over time
- Create and customize workout routines
- Access a comprehensive exercise library with documentation and examples
- Track sets, reps, and weights for each exercise
- Monitor performance improvements over time
- Receive personalized workout recommendations
- Work towards achievements and fitness goals

### 3. User Management
- Create and manage user profiles
- Track personal metrics (weight, height, age, etc.)
- Customize application settings
- View progress history and statistics
- Set and monitor fitness goals

## Application Structure
The application follows a modular architecture with the following main sections:

### Components
- **Auth**: Login and registration components
- **Home**: Main dashboard and overview
- **Landing Page**: Introduction page for new users
- **Navigation**: Navigation bar and menu components
- **Nutrition**: Food tracking, search, and management components
- **Profile**: User profile management
- **Settings**: Application and user settings
- **Training**: Workout tracking and exercise library

### Core Modules
- **Authentication**: User authentication and authorization services
- **Services**: Core application services

### Domain Modules
- **Food**: Food-related models and services
- **Local Storage**: Local data persistence
- **Member**: Membership management
- **User**: User profile management
- **Workouts**: Workout and exercise tracking

## Code Organization
The project follows Angular best practices with a clear separation of concerns:

```
src/
├── app/
│   ├── components/       # UI components
│   │   ├── auth/         # Authentication components
│   │   ├── dialog/       # Dialog components
│   │   ├── home/         # Home page components
│   │   ├── landing-page/ # Landing page components
│   │   ├── nav-bar/      # Navigation components
│   │   ├── nutrition/    # Food tracking components
│   │   ├── profile/      # User profile components
│   │   ├── settings/     # Settings components
│   │   └── training/     # Workout components
│   ├── core/             # Core functionality
│   │   ├── auth/         # Authentication services
│   │   └── services/     # Core services
│   ├── domain/           # Business logic
│   │   ├── food/         # Food domain
│   │   ├── local-storage/ # Local storage services
│   │   ├── member/       # Member domain
│   │   ├── user/         # User domain
│   │   ├── user-login/   # User login domain
│   │   └── workouts/     # Workouts domain
│   ├── app-routing.module.ts  # Application routes
│   ├── app.component.ts       # Root component
│   └── app.module.ts          # Root module
├── assets/               # Static assets
├── data/                 # Static data files
├── environments/         # Environment configurations
└── styles.scss           # Global styles
```

## Implementation Details

### Frontend Technologies
- **Angular 17**: Modern web framework for building the user interface
- **Angular Material**: UI component library for consistent design
- **Bootstrap**: CSS framework for responsive design
- **Chart.js**: Library for data visualization
- **RxJS**: Library for reactive programming
- **NgRx**: State management (if applicable)

### Backend Integration
The application communicates with a RESTful API backend through HTTP requests. The API endpoints are defined in the `endpoint-dictionary.ts` file and include:
- User management (registration, login, profile updates)
- Food item management (search, add, edit, delete)
- Workout and exercise tracking
- Progress logging and statistics

### Authentication and Authorization
The application implements a token-based authentication system with route guards:
- `LoggedInGuardService`: Prevents logged-in users from accessing login/register pages
- `MemberGuardService`: Restricts access to member-only features

### Data Models
Key data models include:
- **User**: User profile information (username, email, password, physical attributes)
- **Food Item**: Nutritional information for food items
- **Workout**: Workout routines and schedules
- **Exercise**: Exercise details and instructions
- **Log**: Food and workout tracking logs

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v17)

### Installation Steps
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd gym_website_web
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

### Building for Production
```bash
npm run build
```

## Usage

### User Registration and Login
1. Navigate to the landing page
2. Click "Register" to create a new account
3. Fill in your details and submit
4. Log in with your credentials

### Food Tracking
1. Navigate to the "Food" section
2. Search for food items or scan barcodes
3. Add items to your daily log
4. View nutritional information and statistics

### Workout Tracking
1. Navigate to the "Workouts" section
2. Create a new workout or select an existing one
3. Add exercises from the library
4. Track your sets, reps, and weights
5. Save your workout and view progress over time

### Profile Management
1. Navigate to the "Profile" section
2. Update your personal information
3. Track your weight and other metrics
4. View your progress history

## Development

### Project Structure
The project follows Angular best practices with a modular architecture:
- Components are organized by feature
- Services handle data access and business logic
- Models define data structures
- Guards control route access

### Key Commands
- `npm start`: Start the development server
- `npm run build`: Build the application for production
- `npm test`: Run unit tests
- `npm run watch`: Build and watch for changes

## Roadmap

### Release 1 - Mid-August
**_This release will include:_**
- Food and macro tracking
- Progress tracking and insights
- Food library with ability to create and modify items

### Release 2 - Mid-December
**_This release will include:_**
- Workout and exercise tracking
- Exercise documentation and examples
- Achievements
- Workout generation
