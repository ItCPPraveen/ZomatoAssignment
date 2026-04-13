
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import { AuthProvider } from './store/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Projects } from './features/projects/Projects';
import { ProjectDetail } from './features/projects/ProjectDetail';

function Layout() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
