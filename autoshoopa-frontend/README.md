# AutoShoopa Frontend

This is the React frontend for AutoShoopa - A Car Spare Parts Marketplace.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost/autoshoopa-backend
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── common/        # Shared components
│   ├── customer/      # Customer-specific components
│   └── seller/        # Seller-specific components
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── customer/      # Customer dashboard pages
│   ├── seller/        # Seller dashboard pages
│   └── public/        # Public pages
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── services/          # API services
├── utils/             # Utility functions
└── assets/            # Static assets
```

## Features

- 🚀 React with TypeScript
- 🎨 Tailwind CSS for styling
- 🔒 JWT Authentication
- 📱 Responsive design
- 📊 Dashboard with charts
- 🛒 Shopping cart functionality
- 🔍 Search and filtering
- �� Order management 