import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/home';
import SetupPage from './pages/setup';
import Authenticate from './pages/login/Authenticate';
import { AccessTokenWrapper } from '@calimero-is-near/calimero-p2p-sdk';
import { getNodeUrl } from './utils/node';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/dashboard/Dashboard';
import ChatPage from './pages/chatGroup/ChatPage';
import Documents from './pages/documents/Document';
import Clients from './pages/clients/Clients';
export default function App() {
  return (
    <ThemeProvider>
      <AccessTokenWrapper getNodeUrl={getNodeUrl}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SetupPage />} />
            <Route path="/auth" element={<Authenticate />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<div>404</div>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/chat-group/:groupID"
              element={<ChatPage />}
            />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:docID" element={<Documents />} />
            <Route path="/clients" element={<Clients/>} />
          </Routes>
        </BrowserRouter>
      </AccessTokenWrapper>
    </ThemeProvider>
  );
}
