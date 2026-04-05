import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import Infrastructure from './pages/Infrastructure';
import Students from './pages/Students';
import Rooms from './pages/Rooms';
import Incidents from './pages/Incidents';
import Violations from './pages/Violations';
import DormRules from './pages/DormRules';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import RoomAssignment from './pages/RoomAssignment';
import Contracts from './pages/Contracts';
import StudentLayout from './layouts/StudentLayout';
import RoomRegistration from './pages/student/RoomRegistration';
import RoomList from './pages/student/RoomList';
import MyContracts from './pages/student/MyContracts';
import MyInvoices from './pages/student/MyInvoices';
import PayInvoice from './pages/student/PayInvoice';
import MyViolations from './pages/student/MyViolations';
import ViewRules from './pages/student/ViewRules';
import SubmitIncident from './pages/student/SubmitIncident';

// Placeholder cho Dashboard của Admin
const AdminDashboard = () => <h1 className="text-2xl font-black uppercase text-slate-800">Dashboard Tổng Quan</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
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
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;