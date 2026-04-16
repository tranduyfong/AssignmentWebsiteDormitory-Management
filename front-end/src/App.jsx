import React from 'react';
import { BrowserRouter, Routes, Route, Navigate,Link } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './layouts/AdminLayout';
import Infrastructure from './pages/admin/Infrastructure';
import Students from './pages/admin/Students';
import Rooms from './pages/admin/Rooms';
import Incidents from './pages/admin/Incidents';
import Violations from './pages/admin/Violations';
import DormRules from './pages/admin/DormRules';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Invoices from './pages/admin/Invoices';
import RoomAssignment from './pages/admin/RoomAssignment';
import Contracts from './pages/admin/Contracts';
import StudentLayout from './layouts/StudentLayout';
import RoomRegistration from './pages/student/RoomRegistration';
import RoomList from './pages/student/RoomList';
import MyContracts from './pages/student/MyContracts';
import MyInvoices from './pages/student/MyInvoices';
import PayInvoice from './pages/student/PayInvoice';
import MyViolations from './pages/student/MyViolations';
import ViewRules from './pages/student/ViewRules';
import SubmitIncident from './pages/student/SubmitIncident';
import Profile from './pages/student/Profile';
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Reports />} /> 
          <Route path="students" element={<Students />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="violations" element={<Violations />} />
          <Route path="rules" element={<DormRules />} />
          <Route path="billing" element={<Billing />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="registrations" element={<RoomAssignment />} />
          <Route path="contracts" element={<Contracts />} />
        </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/rooms" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="register-room" element={<RoomRegistration />} />
            <Route path="rooms" element={<RoomList />} />
            <Route path="contracts" element={<MyContracts />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="pay-invoice" element={<PayInvoice />} />
            <Route path="violations" element={<MyViolations />} />
            <Route path="rules" element={<ViewRules />} />
            <Route path="incidents" element={<SubmitIncident />} />
          </Route>

          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-6xl font-black text-slate-300">404</h1>
                <p className="text-slate-500 font-medium mt-2">Trang bạn tìm kiếm không tồn tại.</p>
                <Link
          to="/login"
          className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
        >
          Quay về trang chính
        </Link>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
  </>
  );
}

export default App;