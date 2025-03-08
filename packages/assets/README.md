# EcoPrint Assets Package

This package contains the frontend assets for the EcoPrint application.

## Structure

The codebase follows a modular structure with clear separation of concerns:

```
src/
├── components/          # Reusable components
│   ├── common/          # Shared components used across the app
│   ├── ui/              # Basic UI components
│   └── shared/          # Shared layout components
├── features/            # Feature-specific components and logic
│   ├── admin/           # Admin-specific features
│   │   ├── products/    # Product management 
│   │   ├── users/       # User management
│   │   ├── orders/      # Order management
│   │   ├── settings/    # Admin settings
│   │   └── reports/     # Admin reports
│   ├── user/            # User-specific features
│   │   ├── profile/     # User profile
│   │   ├── orders/      # User orders
│   │   ├── products/    # Product browsing
│   │   └── transactions/# User transactions
│   └── auth/            # Authentication features
├── pages/               # Page components  
├── hooks/               # Custom React hooks
│   ├── api/             # API-related hooks
│   └── ui/              # UI and state management hooks
├── contexts/            # React contexts
├── store/               # State management
│   ├── actions/         # Redux actions
│   ├── reducers/        # Redux reducers
│   └── types/           # Type definitions
├── services/            # API services and external integrations
├── routes/              # Route configurations
│   └── utils/           # Route utility functions
├── layouts/             # Layout wrapper components
├── utils/               # Utility functions and helpers
├── styles/              # Global styles and theme configurations
├── App.js               # Main application component
├── main.js              # Application entry point
├── firebase.js          # Firebase configuration
└── theme.js             # Material UI theme configuration
```

## Naming Conventions

1. **Files**: PascalCase for React components (e.g., ProductList.js), camelCase for utilities (e.g., formatDate.js), kebab-case for styles (e.g., main-layout.scss)
2. **Folders**: kebab-case for folder names to distinguish them from files
3. **Components**: Group related components in subfolders for better organization

## Component Organization

1. **components/**: Reusable, generic components that can be used in multiple places
   - **ui/**: Basic UI elements like buttons, inputs, search fields
   - **common/**: Common components like Notification, Modal
   - **shared/**: Shared layout components like collapsible sidebar

2. **features/**: Feature-specific components organized by domain and user role
   - **admin/**: Admin-only features, organized by feature area
   - **user/**: User-only features, organized by feature area
   - **auth/**: Authentication-related features

## Development Guidelines

1. Keep components small and focused on a single responsibility
2. Extract reusable logic to custom hooks
3. Use common UI components from the `components/ui` directory
4. Follow Material UI's styling conventions
5. Use absolute imports from the project root when possible

## Available Scripts

- `npm start` - Start the development server
- `npm build` - Build the production bundle
- `npm test` - Run tests
- `npm lint` - Run linting

## Dependencies

- React 18+
- Material UI 5+
- React Router 6+
- Redux for state management 