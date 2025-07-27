import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import CreateService from './pages/CreateService'
import MyBookings from './pages/MyBookings'
import AIHealth from './pages/AIHealth'
import IoTMonitor from './pages/IoTMonitor'
import ARTraining from './pages/ARTraining'
import NeuroSync from './pages/NeuroSync'
import NetworkPage from './pages/NetworkPage'
import SocialFeed from './pages/SocialFeed'
import SearchPage from './pages/SearchPage'
import Dashboard from './pages/Dashboard'
import ProfessionalProfile from './pages/ProfessionalProfile'
import BookingPage from './pages/BookingPage'
import ProfessionalVerification from './pages/ProfessionalVerification';
import HomeCarBooking from './pages/HomeCarBooking';
import PhysiotherapyBooking from './pages/PhysiotherapyBooking';
import NegotiationSystem from './pages/NegotiationSystem';
import NegotiationChat from './pages/NegotiationChat';
import StrikePaymentSystem from './pages/StrikePaymentSystem';
import InsuranceProtectionSystem from './pages/InsuranceProtectionSystem';
import SimpleNegotiation from './pages/SimpleNegotiation';
import IntelligentTriage from './pages/IntelligentTriage';
import ProfessionalChat from './pages/ProfessionalChat';
import CustomPlan from './pages/CustomPlan';
import NegotiationVersions from './pages/NegotiationVersions';
import EscrowPaymentSystem from './pages/EscrowPaymentSystem';
import ServiceReviewSystem from './pages/ServiceReviewSystem';
import AdvancedExtrasSystem from './pages/AdvancedExtrasSystem';
// Novas funcionalidades avançadas
import IntelligentMatching from './pages/IntelligentMatching';
import ServiceFeed from './pages/ServiceFeed';
import ProfileVerification from './pages/ProfileVerification';
import PerformanceDashboard from './pages/PerformanceDashboard';
import RewardsSystem from './pages/RewardsSystem';
// Funcionalidades Uber adaptadas para Fway
import ServiceRequest from './pages/ServiceRequest';
import ProfessionalMap from './pages/ProfessionalMap';
import RatingAndHistory from './pages/RatingAndHistory';
import PaymentAndPricing from './pages/PaymentAndPricing';
import ChatNotificationScheduling from './pages/ChatNotificationScheduling';

// Fway Shield - Seguro Embutido
import ShieldDashboard from './pages/ShieldDashboard';
import RiskIntelligence from './pages/RiskIntelligence';
import CoverageManager from './pages/CoverageManager';
import ClaimsCenter from './pages/ClaimsCenter';
import ShieldRewards from './pages/ShieldRewards';
// Inicializar dados mock
import './utils/initMockData';
import './index.css'

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:id" element={<ServiceDetail />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="network" element={<NetworkPage />} />
                  <Route path="social" element={<SocialFeed />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="professional/:id" element={<ProfessionalProfile />} />
                  <Route path="booking/:id" element={<BookingPage />} />
                  <Route path="homecare-booking" element={<HomeCarBooking />} />
                  <Route path="physiotherapy-booking" element={<PhysiotherapyBooking />} />
                  <Route path="verification" element={<ProfessionalVerification />} />
                  <Route path="negotiation/:serviceId?" element={<NegotiationSystem />} />
                  <Route path="negotiation-chat/:serviceId?" element={<NegotiationChat />} />
                  <Route path="strike-payment/:serviceId?" element={<StrikePaymentSystem />} />
                  <Route path="insurance/:serviceId?" element={<InsuranceProtectionSystem />} />
                  <Route path="simple-negotiation" element={<SimpleNegotiation />} />
                  <Route path="intelligent-triage" element={<IntelligentTriage />} />
                  <Route path="professional-chat/:professionalId?" element={<ProfessionalChat />} />
                  <Route path="custom-plan/:professionalId?" element={<CustomPlan />} />
                  <Route path="negotiation-versions/:serviceId?" element={<NegotiationVersions />} />
                  <Route path="escrow-payment/:serviceId?" element={<EscrowPaymentSystem />} />
                  <Route path="service-review/:serviceId?" element={<ServiceReviewSystem />} />
                  <Route path="advanced-extras/:serviceId?" element={<AdvancedExtrasSystem />} />
                  {/* Novas funcionalidades avançadas */}
                  <Route path="intelligent-matching" element={<IntelligentMatching />} />
                  <Route path="service-feed" element={<ServiceFeed />} />
                  <Route path="profile-verification" element={<ProfileVerification />} />
                  <Route path="performance-dashboard" element={<PerformanceDashboard />} />
                  <Route path="rewards-system" element={<RewardsSystem />} />
                  {/* Funcionalidades Uber adaptadas para Fway */}
                  <Route path="service-request" element={<ServiceRequest />} />
                  <Route path="professional-map" element={<ProfessionalMap />} />
                  <Route path="rating-history" element={<RatingAndHistory />} />
                  <Route path="payment-pricing" element={<PaymentAndPricing />} />
                  <Route path="chat-notifications" element={<ChatNotificationScheduling />} />
                  {/* Fway Shield - Seguro Embutido */}
                  <Route path="shield-dashboard" element={<ShieldDashboard />} />
                  <Route path="risk-intelligence" element={<RiskIntelligence />} />
                  <Route path="coverage-manager" element={<CoverageManager />} />
                  <Route path="claims-center" element={<ClaimsCenter />} />
                  <Route path="shield-rewards" element={<ShieldRewards />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="create-service" element={<CreateService />} />
                  <Route path="my-bookings" element={<MyBookings />} />
                  <Route path="ai-health" element={<AIHealth />} />
                  <Route path="iot-monitor" element={<IoTMonitor />} />
                  <Route path="ar-training" element={<ARTraining />} />
                  <Route path="neurosync" element={<NeuroSync />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

export default App

