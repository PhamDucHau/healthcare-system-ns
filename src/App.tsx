import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Home from "./pages/Home.tsx";
import Index from "./pages/Index.tsx";
import Labs from "./pages/Labs.tsx";
import Appointments from "./pages/Appointments.tsx";
import BookAppointment from "./pages/BookAppointment.tsx";
import PreConsultation from "./pages/PreConsultation.tsx";
import Support from "./pages/Support.tsx";
import Messages from "./pages/Messages.tsx";
import Login, { AdminLogin, DoctorLogin, PatientLogin } from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import About from "./pages/About.tsx";
import Admin from "./pages/Admin.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminSectionPlaceholder from "./pages/admin/AdminSectionPlaceholder.tsx";
import AdminUsersContent from "./components/admin/AdminUsersContent.tsx";
import AdminRolesContent from "./components/admin/AdminRolesContent.tsx";
import MasterDataContent from "./components/admin/MasterDataContent.tsx";
import AdminAppointmentsContent from "./components/admin/AdminAppointmentsContent.tsx";
import PatientRecordsManagement from "./components/patient-records/PatientRecordsManagement.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "./hooks/use-auth.tsx";
import { OnboardingFormProvider } from "./hooks/useOnboardingForm";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import OnboardingLayout from "./components/onboarding/OnboardingLayout";
import OnboardingFormPage from "./pages/OnboardingFormPage.tsx";
import ProviderPortal from "./pages/ProviderPortal";
import ProviderDashboard from "./components/provider/ProviderDashboard";
import ProviderPatientsPage from "./pages/provider/ProviderPatientsPage";
import ProviderSectionPlaceholder from "./pages/provider/ProviderSectionPlaceholder";
import ProviderAppointmentsPage from "./pages/provider/ProviderAppointmentsPage";
import { DoctorNotificationsProvider } from "./hooks/DoctorNotificationsContext";
import QuestionLibraryPage from "./pages/admin/clinical-logic/QuestionLibraryPage.tsx";
import QuestionnaireBuilderPage from "./pages/admin/clinical-logic/QuestionnaireBuilderPage.tsx";
import ExaminationPage from "./pages/provider/ExaminationPage.tsx";
import ClinicalTasksContent from "./components/provider/ClinicalTasksContent.tsx";

const queryClient = new QueryClient();

function RedirectClinicalLogicQuestionnaire() {
  const { id } = useParams();
  return <Navigate to={`/admin/question-library/${id}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labs"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Labs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/book"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:appointmentId/pre-consultation"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <PreConsultation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Support />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            {/* legacy aliases */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/provider-portal"
              element={
                <ProtectedRoute requiredPortal="doctor">
                  <DoctorNotificationsProvider>
                    <ProviderPortal />
                  </DoctorNotificationsProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route
                path="patient-records"
                element={<PatientRecordsManagement portal="doctor" />}
              />
              <Route path="patients" element={<ProviderPatientsPage />} />
              <Route path="appointments" element={<ProviderAppointmentsPage />} />
              <Route path="examination/:appointmentId" element={<ExaminationPage />} />
              <Route path="tasks" element={<ClinicalTasksContent portal="doctor" />} />
              <Route path="analytics" element={<ProviderSectionPlaceholder title="Analytics" />} />
            </Route>
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requiredPortal="patient">
                  <OnboardingFormProvider>
                    <OnboardingLayout />
                  </OnboardingFormProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<OnboardingFormPage />} />
              <Route path="profile" element={<Navigate to="/onboarding" replace />} />
              <Route path="personal" element={<Navigate to="/onboarding" replace />} />
              <Route path="insurance" element={<Navigate to="/onboarding" replace />} />
              <Route path="review" element={<Navigate to="/onboarding" replace />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredPortal="admin">
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route
                path="patient-records"
                element={<PatientRecordsManagement portal="admin" />}
              />
              <Route path="appointments" element={<AdminAppointmentsContent />} />
              <Route path="master-data" element={<MasterDataContent />} />
              <Route path="users" element={<AdminUsersContent />} />
              <Route path="roles" element={<AdminRolesContent />} />
              <Route path="tasks" element={<ClinicalTasksContent portal="admin" />} />
              <Route path="logs" element={<AdminSectionPlaceholder title="System Logs" />} />
              <Route path="settings" element={<AdminSectionPlaceholder title="Settings" />} />
              <Route path="question-library" element={<QuestionLibraryPage />} />
              <Route path="question-library/new" element={<QuestionnaireBuilderPage />} />
              <Route path="question-library/:id" element={<QuestionnaireBuilderPage />} />
            </Route>
            <Route path="/admin/clinical-logic" element={<Navigate to="/admin/question-library" replace />} />
            <Route path="/admin/clinical-logic/question-library" element={<Navigate to="/admin/question-library" replace />} />
            <Route path="/admin/clinical-logic/question-library/new" element={<Navigate to="/admin/question-library/new" replace />} />
            <Route path="/admin/clinical-logic/question-library/:id" element={<RedirectClinicalLogicQuestionnaire />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
