import EmployeeComponent from './components/EmployeeComponent';
import ListEmployeeComponent from "./components/ListEmployeeComponent";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import RegisterComponent from './components/auth/RegisterComponent';
import LoginComponent from './components/auth/LoginComponent';
import ListDepartmentComponent from './components/ListDepartmentComponent';
import DepartmentComponent from './components/DepartmentComponent';
import ListTeamComponent from './components/ListTeamComponent';
import TeamComponent from './components/TeamComponent';
import LeaveComponent from './components/LeaveComponent';
import AttendanceComponent from './components/AttendanceComponent';
import SalaryComponent from './components/SalaryComponent';
import ProfileComponent from './components/ProfileComponent';
import AnnouncementComponent from './components/AnnouncementComponent';
import ReportComponent from './components/ReportComponent';
import ErrorBoundary from './components/common/ErrorBoundary';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { isUserLoggedIn } from './services/auth/AuthService';

function App() {
  const AuthenticatedRoute = ({ children }) => {
    return isUserLoggedIn() ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<LoginComponent />} />
          <Route path='/register' element={<RegisterComponent />} />

          {/* Protected Routes inside Dashboard Layout */}
          <Route path='/*' element={
            <AuthenticatedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/employees' element={<ListEmployeeComponent />} />
                  <Route path='/add-employee' element={<EmployeeComponent />} />
                  <Route path='/edit-employee/:id' element={<EmployeeComponent />} />
                  <Route path='/departments' element={<ListDepartmentComponent />} />
                  <Route path='/add-department' element={<DepartmentComponent />} />
                  <Route path='/edit-department/:id' element={<DepartmentComponent />} />
                  <Route path='/teams' element={<ListTeamComponent />} />
                  <Route path='/add-team' element={<TeamComponent />} />
                  <Route path='/edit-team/:id' element={<TeamComponent />} />
                  <Route path='/leaves' element={<LeaveComponent />} />
                  <Route path='/attendance' element={<AttendanceComponent />} />
                  <Route path='/salaries' element={<SalaryComponent />} />
                  <Route path='/profile' element={<ProfileComponent />} />
                  <Route path='/profile/:employeeId' element={<ProfileComponent />} />
                  <Route path='/announcements' element={<AnnouncementComponent />} />
                  <Route path='/reports' element={<ReportComponent />} />
                </Routes>
              </DashboardLayout>
            </AuthenticatedRoute>
          } />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
