import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18+
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'; // Import Semantic UI CSS
import './style.css'; // Custom styles

// Import Pages
import Dashboard from './pages/Dashboard';
import DownloadFilePage from './pages/DownloadFilePage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFoundPage';
import UploadFilePage from './pages/UploadFilePage';

// Utility function to get user data from token
const getUserDataFromToken = (token: string): { email?: string } | null => {
  try {
    return JSON.parse(token);
  } catch (error) {
    console.error('Invalid token format:', error);
    return null;
  }
};

// Loader function to check authentication
const checkAuthLoader = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return redirect('/auth'); // Redirect to login if no token
  }

  const userData = getUserDataFromToken(token);
  if (!userData || !userData.email) {
    return redirect('/auth'); // Redirect to login if token is invalid
  }

  return userData.email; // Return user email if authenticated
};

// Define routes
const routes = [
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/auth/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    loader: checkAuthLoader,
    children: [
      {
        path: '', // Default route for /dashboard
        element: <div>Welcome to the Dashboard</div>,
      },
      {
        path: 'upload',
        element: <UploadFilePage />,
      },
      {
        path: 'download',
        element: <DownloadFilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

// Create browser router
const router = createBrowserRouter(routes);

// Render application
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // Create root for React 18
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found'); // Handle case when root element is missing
}