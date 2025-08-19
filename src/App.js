import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import { AuthProvider } from "./auth/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import PrivateRoute from "./auth/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";
import TaskManager from "./pages/TaskManager";
import ExpenseTracker from "./pages/ExpenseTracker";
import IncomeManager from "./pages/IncomeManager";
import TransactionManager from "./pages/TransactionManager";
import DebtManager from "./pages/DebtManager";
import EmailManager from "./pages/EmailManager";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
            <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/task-manager"
            element={
              <PrivateRoute>
                <TaskManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/expense-tracker"
            element={
              <PrivateRoute>
                <ExpenseTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/income-manager"
            element={
              <PrivateRoute>
                <IncomeManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/transaction-manager"
            element={
              <PrivateRoute>
                <TransactionManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/debt-manager"
            element={
              <PrivateRoute>
                <DebtManager/>
              </PrivateRoute>
            }
          />
          <Route
            path="/email-manager"
            element={
              <PrivateRoute>
                <EmailManager/>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
