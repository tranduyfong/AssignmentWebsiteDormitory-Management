import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Infrastructure from './pages/Infrastructure';
import AdminLayout from './layouts/AdminLayout';
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

// Placeholder cho các trang khác
const Dashboard = () => <h1 className="text-2xl font-black uppercase">Dashboard Tổng Quan</h1>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
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

          {/* Thêm các route khác ở đây */}
          <Route path="*" element={<div className="p-10 font-bold">404 - Không tìm thấy trang</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;