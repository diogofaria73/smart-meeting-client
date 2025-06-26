import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MeetingProvider } from '@/contexts/MeetingContext';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import NewMeeting from '@/pages/NewMeeting';
import Meetings from '@/pages/Meetings';
import MeetingDetail from '@/pages/MeetingDetail';

function App() {
  return (
    <ThemeProvider>
      <MeetingProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-meeting" element={<NewMeeting />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/meeting/:id" element={<MeetingDetail />} />
            </Routes>
          </Layout>
        </Router>
      </MeetingProvider>
    </ThemeProvider>
  );
}

export default App;
