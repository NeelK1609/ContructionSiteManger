import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import DashboardPage from './Pages/Dashboard';
import FlatsPage from './Pages/Flats';
import FlatDetailsPage from './Pages/FlatDetails';
import MaterialsPage from './Pages/Materials';
import './index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/Flats" element={<FlatsPage />} />
            <Route path="/FlatDetails" element={<FlatDetailsPage />} />
            <Route path="/Materials" element={<MaterialsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

