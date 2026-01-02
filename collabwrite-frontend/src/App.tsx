import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts & Components
import { AdminRoute } from "./components/AdminRoute";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

// Pages
import { AdminDashboard } from "./pages/AdminDashboard";
import { DashboardPage } from "./pages/DashboardPage";
import DocumentEditorPage from "./pages/DocumentEditorPage";
import FileViewerPage from "./pages/FileViewerPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MyDocumentsPage } from "./pages/MyDocumentsPage";
import { MyFoldersPage } from "./pages/MyFoldersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

// Layout pour les pages sans header/footer (login, register)
function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Layout pour les pages avec header/footer
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-documents"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyDocumentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-folders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyFoldersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:documentId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DocumentEditorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewer/:fileId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FileViewerPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Alias supplémentaire si nécessaire */}
          <Route
            path="/document/:documentId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DocumentEditorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
