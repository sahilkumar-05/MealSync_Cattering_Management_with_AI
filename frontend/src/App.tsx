import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { connectSocket } from './lib/socket';
import IngredientsPage from './pages/IngredientsPage';
import CohortsPage from './pages/CohortsPage';
import DietaryProfilesPage from './pages/DietaryProfilesPage';
import MenusPage from './pages/MenusPage';
import ProcurementPage from './pages/ProcurementPage';
import WastePage from './pages/WastePage';
import MealOrdersPage from './pages/MealOrdersPage';

function App() {
    const { token, tenantId } = useAuthStore();

  useEffect(() => {
    if (token && tenantId) {
      connectSocket(tenantId);
    }
  }, [token, tenantId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="cohorts" element={<CohortsPage />} />
            <Route path="dietary-profiles" element={<DietaryProfilesPage />} />
            <Route path="menus" element={<MenusPage />} />
            <Route path="procurement" element={<ProcurementPage />} />
            <Route path="waste" element={<WastePage />} />
            <Route path="meal-orders" element={<MealOrdersPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;