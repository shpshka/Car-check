import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Drivers from './pages/Drivers.jsx';
import Inspections from './pages/Inspections.jsx';
import Problems from './pages/Problems.jsx';
import Reminders from './pages/Reminders.jsx';
import TransportDetails from './pages/TransportDetails.jsx';
import Transports from './pages/Transports.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transports" element={<Transports />} />
        <Route path="/transports/:id" element={<TransportDetails />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
