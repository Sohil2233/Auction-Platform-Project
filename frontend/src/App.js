import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalStyle, AppContainer } from './styles/GlobalStyles';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Listings from './components/Listings';
import AddListing from './components/AddListing';
import EditListing from './components/EditListing';
import Auction from './components/Auction';
import Notifications from './components/Notifications';
import UserProfile from './components/UserProfile';
import TransactionManagement from './components/TransactionManagement';
import FeedbackPage from './components/FeedbackPage'; // ✅ ADD THIS

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <GlobalStyle />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/add-listing" element={<AddListing />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/auction/:id" element={<Auction />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/transactions" element={<TransactionManagement />} />
              <Route path="/feedback/:transactionId" element={<FeedbackPage />} /> {/* ✅ ADD THIS */}
            </Routes>
          </Layout>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;