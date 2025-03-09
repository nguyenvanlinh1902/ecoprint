# EcoPrint Assets Package Structure (Optimized)

This document outlines the optimized organization of the @assets package.

## Directory Structure (Optimized)

```
assets/
├── src/
│   ├── actions/            # Redux actions
│   ├── components/         # Reusable UI components
│   ├── config/             # Frontend configuration
│   ├── const/              # Constants and enums
│   ├── contexts/           # React context providers
│   ├── helpers/            # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layout components
│   ├── loadables/          # Code splitting components
│   ├── locale/             # Internationalization
│   ├── pages/              # Page components
│   ├── reducers/           # Redux reducers
│   ├── resources/          # Static resources and assets
│   ├── routes/             # Application routing
│   ├── services/           # API and external services
│   ├── styles/             # Global styles and themes
│   ├── App.js              # Main application component
│   ├── embed.js            # Embedded app entry point
│   ├── helpers.js          # General helper functions
│   ├── history.js          # Browser history configuration
│   ├── main.js             # Main application entry point
│   ├── serviceWorker.js    # Progressive Web App service worker
│   └── standalone.js       # Standalone app entry point
├── index.html              # Main HTML template
├── embed.html              # Embedded app HTML template
├── standalone.html         # Standalone app HTML template
├── vite.config.js          # Vite bundler configuration
├── package.json            # Frontend dependencies
└── various config files    # (.babelrc, .eslintrc.js, etc.)
└── theme.js             # Material UI theme configuration
```

## Naming Conventions

1. **Files**: 
   - PascalCase for React components (e.g., ProductList.js)
   - camelCase for utilities and services (e.g., formatDate.js, authService.js)
   - kebab-case for styles (e.g., main-layout.scss)

2. **Folders**: 
   - kebab-case for folder names (e.g., form-controls)
   - Lower case for major section folders (e.g., components, features)

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

## Code Optimization

1. **Split Large Components**: Break down large components like ProductsManagement into smaller, focused components
2. **Reusable Hooks**: Extract repetitive logic into custom hooks
3. **Common UI Elements**: Create reusable UI elements in the components/ui directory 
4. **Consistent Imports**: Use absolute imports from the project root

## Best Practices

1. Keep components small and focused on a single responsibility 
2. Use TypeScript interfaces or PropTypes for component props
3. Implement lazy loading for route components
4. Adopt React.memo for performance optimization where appropriate
5. Follow Material UI's styling conventions consistently 