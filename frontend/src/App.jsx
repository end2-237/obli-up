"use client"

import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "./pages/HomePage"
import ItemListingPage from "./pages/ItemListingPage"
import ItemDetailPage from "./pages/ItemDetailPage"
import ReportItemPage from "./pages/ReportItemPage"
import DashboardPage from "./pages/DashboardPage"
import ContactPage from "./pages/ContactPage"
import AuthPage from "./pages/AuthPage"
import QRStorePage from "./pages/QRStorePage"
import QRScannerPage from "./pages/QRScannerPage"
import ChatPage from "./pages/ChatPage"

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="items" element={<ItemListingPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="qr-store" element={<QRStorePage />} />
          <Route path="scan" element={<QRScannerPage />} />
          <Route
            path="report"
            element={
              <ProtectedRoute>
                <ReportItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="contact" element={<ContactPage />} />
          <Route path="auth" element={<AuthPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
