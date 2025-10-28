// import { Routes, Route, useLocation, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// import { getToken } from "firebase/messaging";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { messaging } from "./firebase";
// import FirebaseNotificationHandler from "./components/FirebaseNotificationHandler";

// // Layout
// import Sidebar from "./components/Sidebar";
// import Navbar from "./components/Navbar";

// // Auth Pages
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";

// // Admin Pages
// import Dashboard from "./pages/Dashboard";
// import AllUsers from "./pages/AllUsers";
// import AllGames from "./pages/AllGames";
// import CreateGame from "./pages/CreateGame";
// import AllMatches from "./pages/AllMatches";
// import CreateMatch from "./pages/CreateMatch";
// import AllVotes from "./pages/AllVotes";
// import Teams from "./pages/Teams";
// import Setting from "./pages/Setting";
// import DailyDuels from "./pages/DailyDuels";
// import Ads from "./pages/Ads";
// import UserSettings from "./pages/UserSettings";
// import UserKYC from "./pages/UserKYC";
// import UserTeams from "./pages/UserTeams";
// import Support from "./pages/Support";
// import PLOverview from "./pages/PLOverview";
// import AdminManagement from "./pages/AdminManagement";
// import SystemHealth from "./pages/SystemHealth";
// import AuditLogViewer from "./pages/AuditLogViewer";
// import ManualLedger from "./pages/ManualLedger";
// import DailyBets from "./pages/DailyBets";
// import ProblemCenter from "./pages/ProblemCenter";
// import NotificationCenter from "./pages/NotificationCenter";
// import Report from "./pages/Report";
// import Match from "./pages/Match";
// import Reportss from "./pages/Reportss";
// import CreateDuel from "./pages/CreateDuel";
// import ImageGallery from "./pages/ImageGallery";
// import Contestcreate from "./pages/contest-create";
// import Contestlist from "./pages/contest-list";
// import ContestDetail from "./pages/contest-details";
// import Bonus from "./pages/Bonus";
// import DuoContestForm from "./pages/DuoContestForm";
// import DeclareResult from "./pages/DeclareResult";
// import DuoContest from "./pages/DuoContest";
// import Kyc from "./pages/Kyc";
// import SquadContestForm from "./pages/SquadContestForm";
// import SquadContestsList from "./pages/SquadContestList";
// import SquadContest from "./pages/SquadContest";
// import SquadContestDeclareResult from "./pages/SquadContestDeclareResult";
// import ContestResultDeclaration from "./pages/content-Result";
// import AllWithdraw from "./pages/AllWithdraw";
// import GamesRegistration from "./pages/GamesRegistration";
// import RegistrationDetails from "./pages/RegistrationDetails";
// import AppSettings from "./pages/AppSettings";
// import Stream from "./pages/Stream";
// import Suscription from "./pages/Suscription";
// import MegaContestList from "./pages/MegaContestList";
// import MegaContestForm from "./pages/MegaContestForm";
// import MegaContest from "./pages/MegaContest";
// import ReferralSystem from "./pages/ReferralSystem";
// import Tournament from "./pages/Tournament";
// import AddTeam from "./pages/AddTeam";
// import AllTeams from "./pages/AllTeams";
// import PrizeDistribution from "./pages/PrizeDistribution";
// import WebsiteStats from "./pages/WebsiteStats";
// import Blog from "./pages/Blog";
// import BlogCreate from "./pages/BlogCreate";
// import ContactUs from "./pages/ContactUS";
// import RulesRegulations from "./pages/Rules&Regulations";
// import BlogDetailPage from "./pages/BlogDetailpage";
// import WatchEarn from "./pages/Watch&Earn";
// import PaymentGateway from "./pages/PaymentGateway";
// import AdsManagement from "./pages/AdsManagement";
// import ReferEarn from "./pages/Refer&Earn"
// import PhonePayGateway from "./pages/PhonePayGateway";
// import UserWaletLeger from "./pages/UserWaletLeger";
// import DiamondPacks from "./pages/DiamondPack";
// import BundlesManager from "./pages/BundleManager";
// import SpinRewardRules from "./pages/SpinRewardRules";
// import ExchangeRate from "./pages/ExchangeRate";
// import UserRedemptionLogs from "./pages/UserRedemptionLogs";
// import GatewayStatus from "./pages/GatewayStatus";
// import GroupManagement from "./pages/GroupManagement";
// import EmailNotificationControl from "./pages/EmailNotificationControl";
// import SubscriptionMembers from "./pages/SubscriptionMembers";
// import LiveStream from "./pages/LiveStream";
// import Invoice from './pages/generate-invoice';

// import GroupMembers from "./pages/GroupMembers";
// import ImbGatewayStatus from "./pages/ImbGatewayStatus";
// import TournamentWinnerGroups from "./pages/TournamentWinnerGroups";
// import WinnerGroupMembers from "./pages/WinnerGroupMembers";
// import AllTransactions from "./pages/AllTrasactions"; 
// import TeamsManagement from "./pages/TeamsManagement";
// import SupportSubject from "./pages/SupportSubject";

// //  ProtectedRoute component
// function ProtectedRoute({ children }) {
//   const authToken = localStorage.getItem("authToken");
//   if (!authToken) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// }

// function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const location = useLocation();
//   const authRoutes = ["/login", "/register", "/forgot-password"];
//   const isAuthPage = authRoutes.includes(location.pathname);

//   useEffect(() => {
//     const registerFcm = async () => {
//       try {
//         if (!("serviceWorker" in navigator)) return;

//         let registration = await navigator.serviceWorker.getRegistration(
//           "/firebase-messaging-sw.js"
//         );

//         if (!registration) {
//           registration = await navigator.serviceWorker.register(
//             "/firebase-messaging-sw.js",
//             { scope: "/", type: "module" }
//           );

//           await new Promise((resolve) => {
//             if (registration.active) return resolve();
//             registration.addEventListener("updatefound", () => {
//               const installingWorker = registration.installing;
//               installingWorker.addEventListener("statechange", () => {
//                 if (installingWorker.state === "activated") resolve();
//               });
//             });
//           });
//         }

//         const permission = await Notification.requestPermission();
//         if (permission !== "granted") return;

//         const currentToken = await getToken(messaging, {
//           vapidKey: "BCI-Cu-Pg0FnXdyxDeR6LHozhMO_5Ft5I5VIi7bI8ofJhOrHMffJgNbPnHczr1Rtlu9rqVKalQRkQJ5pC6qsc6c",
//           serviceWorkerRegistration: registration,
//         });

//         if (currentToken) localStorage.setItem("fcmToken", currentToken);
//       } catch (error) {
//         console.error("FCM registration error:", error);
//       }
//     };

//     registerFcm();
//   }, []);

//   if (isAuthPage) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300">
//         <FirebaseNotificationHandler />
//         <ToastContainer />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//         </Routes>
//           <ToastContainer position="top-right" autoClose={3000} theme="colored" />
//       </div>
//     );
//   }

//   return (
//     <ProtectedRoute>
//       <div className="flex h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300 w-full">
//         {isSidebarOpen && <Sidebar />}
//         <div className="flex-1 flex-col overflow-y-auto">
//           <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//           <FirebaseNotificationHandler />
//           <ToastContainer />

//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/users" element={<AllUsers />} />
//             <Route path="/teams" element={<Teams />} />
//             <Route path="/add-teams" element={<AddTeam />} />
//             <Route path="/games" element={<AllGames />} />
//             <Route path="/prize-distribution" element={<PrizeDistribution />} />
//             <Route path="/registation-details" element={<RegistrationDetails />} />
//             <Route path="/games-registation" element={<GamesRegistration />} />
//             <Route path="/games/create" element={<CreateGame />} />
//             <Route path="/games/edit/:id" element={<CreateGame />} />
//             <Route path="/matches" element={<AllMatches />} />
//             <Route path="/matches/create" element={<CreateMatch />} />
//             <Route path="/admin/duels" element={<DailyDuels />} />
//             <Route path="/admin/ads" element={<Ads />} />
//             <Route path="/voting-centre" element={<AllVotes />} />
//             <Route path="/p&l-overview" element={<PLOverview />} />
//             <Route path="/admin-management" element={<AdminManagement />} />
//             <Route path="/system-health" element={<SystemHealth />} />
//             <Route path="/audit-log" element={<AuditLogViewer />} />
//             <Route path="/manual-ledger" element={<ManualLedger />} />
//             <Route path="/user-settings" element={<UserSettings />} />
//             <Route path="/user-kyc" element={<UserKYC />} />
//             <Route path="/user-teams" element={<UserTeams />} />
//             <Route path="/all-withdraw" element={<AllWithdraw />} />
//             <Route path="/support" element={<Support />} />
//             <Route path="/admin/problemcenter" element={<ProblemCenter />} />
//             <Route path="/admin/notificationcenter" element={<NotificationCenter />} />
//             <Route path="/admin/reports" element={<Report />} />
//             <Route path="/admin/bets" element={<DailyBets />} />
//             <Route path="/admin/matches" element={<Match />} />
//             <Route path="/app-settings" element={<AppSettings />} />
//             <Route path="/settings" element={<Setting />} />
//             <Route path="/suscription" element={<Suscription />} />
//             <Route path="/bonus" element={<Bonus />} />
//             <Route path="/reportss" element={<Reportss />} />
//             <Route path="/admin/duels/createduel" element={<CreateDuel />} />
//             <Route path="/admin/images" element={<ImageGallery />} />
//             <Route path="/contest-create" element={<Contestcreate />} />
//             <Route path="/contest-list" element={<Contestlist />} />
//             <Route path="/contest-details/:id" element={<ContestDetail />} />
//             <Route path="/duo/create" element={<DuoContestForm />} />
//             <Route path="/duo/result/:id" element={<DeclareResult />} />
//             <Route path="/duoContests" element={<DuoContest />} />
//             <Route path="/kyc" element={<Kyc />} />
//             <Route path="/solo/create" element={<Contestcreate />} />
//             <Route path="/solo" element={<Contestlist />} />
//             <Route path="/solo/:id" element={<ContestDetail />} />
//             <Route path="/solo/:id/declare-result" element={<ContestResultDeclaration />} />
//             <Route path="/squad/" element={<SquadContestsList />} />
//             <Route path="/squad/create" element={<SquadContestForm />} />
//             <Route path="/squad/:id" element={<SquadContest />} />
//             <Route path="/squad/:id/declare-result" element={<SquadContestDeclareResult />} />
//             <Route path="/stream" element={<Stream />} />
//             <Route path="/mega" element={<MegaContestList />} />
//             <Route path="/mega/create" element={<MegaContestForm />} />
//             <Route path="/mega/:id" element={<MegaContest />} />
//             <Route path="/referral-system" element={<ReferralSystem />} />
//             <Route path="/tournaments" element={<Tournament />} />
//             <Route path="/all-teams" element={<AllTeams />} />
//             <Route path="/website-stats" element={<WebsiteStats />} />
//             <Route path="/contactus" element={<ContactUs />} />
//             <Route path="/blogs" element={<Blog />} />
//             <Route path="/blog/:id" element={<BlogDetailPage />} />
//             <Route path="/createblog" element={<BlogCreate />} />
//             <Route path="/createblog/edit/:id" element={<BlogCreate />} />
//             <Route path="/editblog/:id" element={<BlogCreate />} />
//             <Route path ="/rules-regulations" element={<RulesRegulations />} />
//             <Route path="/watch-earn" element={<WatchEarn />} />
//             <Route path="/payment-gateway" element={<PaymentGateway />} />
//             <Route path="/generate-invoice" element={<Invoice />} />
//             <Route path="/ads-management" element={<AdsManagement />} />
//             <Route path="/refer-earns" element={<ReferEarn />} />
//             <Route path="/phonepay-gateway" element={<PhonePayGateway />} />
//             <Route path="/user-wallet-ledger" element={<UserWaletLeger />} />
//             <Route path="/diamond-packs" element={<DiamondPacks />} />
//             <Route path="/budles-manage" element={<BundlesManager />} />
//             <Route path="/spin-reward-rules" element={<SpinRewardRules />} />
//             <Route path="/exchange-rate" element={<ExchangeRate />} />
//             <Route path="/user-redemption-logs" element={<UserRedemptionLogs />} />
//             <Route path="/gateway-status" element={<GatewayStatus />} />
//             <Route path="/group-management" element={<GroupManagement />} />
//             <Route path="/email-controls" element={<EmailNotificationControl />} />
//             <Route path="/subscription-members" element={<SubscriptionMembers />} />
//             <Route path="/live/:streamKey" element={<LiveStream />} />
     
//               <Route path="/group-members/:gameType/:groupId" element={<GroupMembers />} />
//             <Route path="/imb-gateway-status" element={<ImbGatewayStatus />} />
//             <Route path="/winner-groups" element={<TournamentWinnerGroups />} />
//             <Route path="/winner-group-members/:gameType/:groupId" element={<WinnerGroupMembers />} />
//             <Route path="/all-transactions" element={<AllTransactions />} />  
//             <Route path="/teams-management" element={<TeamsManagement />} />
//             <Route path="/support-subject" element={<SupportSubject />} />

//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// export default App;

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { messaging } from "./firebase";
import FirebaseNotificationHandler from "./components/FirebaseNotificationHandler";

// Layout
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import AllUsers from "./pages/AllUsers";
import AllGames from "./pages/AllGames";
import CreateGame from "./pages/CreateGame";
import AllMatches from "./pages/AllMatches";
import CreateMatch from "./pages/CreateMatch";
import AllVotes from "./pages/AllVotes";
import Teams from "./pages/Teams";
import Setting from "./pages/Setting";
import DailyDuels from "./pages/DailyDuels";
import Ads from "./pages/Ads";
import UserSettings from "./pages/UserSettings";
import UserKYC from "./pages/UserKYC";
import UserTeams from "./pages/UserTeams";
import Support from "./pages/Support";
import PLOverview from "./pages/PLOverview";
import AdminManagement from "./pages/AdminManagement";
import SystemHealth from "./pages/SystemHealth";
import AuditLogViewer from "./pages/AuditLogViewer";
import ManualLedger from "./pages/ManualLedger";
import DailyBets from "./pages/DailyBets";
import ProblemCenter from "./pages/ProblemCenter";
import NotificationCenter from "./pages/NotificationCenter";
import Report from "./pages/Report";
import Match from "./pages/Match";
import Reportss from "./pages/Reportss";
import CreateDuel from "./pages/CreateDuel";
import ImageGallery from "./pages/ImageGallery";
import Contestcreate from "./pages/contest-create";
import Contestlist from "./pages/contest-list";
import ContestDetail from "./pages/contest-details";
import Bonus from "./pages/Bonus";
import DuoContestForm from "./pages/DuoContestForm";
import DeclareResult from "./pages/DeclareResult";
import DuoContest from "./pages/DuoContest";
import Kyc from "./pages/Kyc";
import SquadContestForm from "./pages/SquadContestForm";
import SquadContestsList from "./pages/SquadContestList";
import SquadContest from "./pages/SquadContest";
import SquadContestDeclareResult from "./pages/SquadContestDeclareResult";
import ContestResultDeclaration from "./pages/content-Result";
import AllWithdraw from "./pages/AllWithdraw";
import GamesRegistration from "./pages/GamesRegistration";
import RegistrationDetails from "./pages/RegistrationDetails";
import AppSettings from "./pages/AppSettings";
import Stream from "./pages/Stream";
import Suscription from "./pages/Suscription";
import MegaContestList from "./pages/MegaContestList";
import MegaContestForm from "./pages/MegaContestForm";
import MegaContest from "./pages/MegaContest";
import ReferralSystem from "./pages/ReferralSystem";
import Tournament from "./pages/Tournament";
import AddTeam from "./pages/AddTeam";
import AllTeams from "./pages/AllTeams";
import PrizeDistribution from "./pages/PrizeDistribution";
import WebsiteStats from "./pages/WebsiteStats";
import Blog from "./pages/Blog";
import BlogCreate from "./pages/BlogCreate";
import ContactUs from "./pages/ContactUS";
import RulesRegulations from "./pages/Rules&Regulations";
import BlogDetailPage from "./pages/BlogDetailpage";
import WatchEarn from "./pages/Watch&Earn";
import PaymentGateway from "./pages/PaymentGateway";
import AdsManagement from "./pages/AdsManagement";
import ReferEarn from "./pages/Refer&Earn"
import PhonePayGateway from "./pages/PhonePayGateway";
import UserWaletLeger from "./pages/UserWaletLeger";
import DiamondPacks from "./pages/DiamondPack";
import BundlesManager from "./pages/BundleManager";
import SpinRewardRules from "./pages/SpinRewardRules";
import ExchangeRate from "./pages/ExchangeRate";
import UserRedemptionLogs from "./pages/UserRedemptionLogs";
import GatewayStatus from "./pages/GatewayStatus";
import GroupManagement from "./pages/GroupManagement";
import EmailNotificationControl from "./pages/EmailNotificationControl";
import SubscriptionMembers from "./pages/SubscriptionMembers";
import LiveStream from "./pages/LiveStream";
import Invoice from './pages/generate-invoice';

import GroupMembers from "./pages/GroupMembers";
import ImbGatewayStatus from "./pages/ImbGatewayStatus";
import TournamentWinnerGroups from "./pages/TournamentWinnerGroups";
import WinnerGroupMembers from "./pages/WinnerGroupMembers";
import AllTransactions from "./pages/AllTrasactions"; 
import TeamsManagement from "./pages/TeamsManagement";
import SupportSubject from "./pages/SupportSubject";

// 🔹 ProtectedRoute component
function ProtectedRoute({ children }) {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("authToken")
  );
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  // 🔹 FCM registration
  useEffect(() => {
    const registerFcm = async () => {
      try {
        if (!("serviceWorker" in navigator)) return;

        let registration = await navigator.serviceWorker.getRegistration(
          "/firebase-messaging-sw.js"
        );

        if (!registration) {
          registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            { scope: "/", type: "module" }
          );

          await new Promise((resolve) => {
            if (registration.active) return resolve();
            registration.addEventListener("updatefound", () => {
              const installingWorker = registration.installing;
              installingWorker.addEventListener("statechange", () => {
                if (installingWorker.state === "activated") resolve();
              });
            });
          });
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const currentToken = await getToken(messaging, {
          vapidKey:
            "BCI-Cu-Pg0FnXdyxDeR6LHozhMO_5Ft5I5VIi7bI8ofJhOrHMffJgNbPnHczr1Rtlu9rqVKalQRkQJ5pC6qsc6c",
          serviceWorkerRegistration: registration,
        });

        if (currentToken) localStorage.setItem("fcmToken", currentToken);
      } catch (error) {
        console.error("FCM registration error:", error);
      }
    };

    registerFcm();
  }, []);

  // 🔹 Auth pages (login/register/forgot)
  if (isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300">
        <FirebaseNotificationHandler />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    );
  }

  // 🔹 Main app layout
  return (
    // <ProtectedRoute>
    //   <div className="flex h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300 w-full">
    //     {isSidebarOpen && <Sidebar />}
    //     <div className="flex-1 flex-col overflow-y-auto">
    //       <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
    //       <FirebaseNotificationHandler />
    //       <ToastContainer position="top-right" autoClose={3000} theme="colored" />

    //       <Routes>
    //         <Route path="/" element={<Dashboard />} />
    //         <Route path="/users" element={<AllUsers />} />
    //         <Route path="/teams" element={<Teams />} />
    //         <Route path="/add-teams" element={<AddTeam />} />
    //         <Route path="/games" element={<AllGames />} />
    //         <Route path="/prize-distribution" element={<PrizeDistribution />} />
    //         <Route path="/registation-details" element={<RegistrationDetails />} />
    //         <Route path="/games-registation" element={<GamesRegistration />} />
    //         <Route path="/games/create" element={<CreateGame />} />
    //         <Route path="/games/edit/:id" element={<CreateGame />} />
    //         <Route path="/matches" element={<AllMatches />} />
    //         <Route path="/matches/create" element={<CreateMatch />} />
    //         <Route path="/admin/duels" element={<DailyDuels />} />
    //         <Route path="/admin/ads" element={<Ads />} />
    //         <Route path="/voting-centre" element={<AllVotes />} />
    //         <Route path="/p&l-overview" element={<PLOverview />} />
    //         <Route path="/admin-management" element={<AdminManagement />} />
    //         <Route path="/system-health" element={<SystemHealth />} />
    //         <Route path="/audit-log" element={<AuditLogViewer />} />
    //         <Route path="/manual-ledger" element={<ManualLedger />} />
    //         <Route path="/user-settings" element={<UserSettings />} />
    //         <Route path="/user-kyc" element={<UserKYC />} />
    //         <Route path="/user-teams" element={<UserTeams />} />
    //         <Route path="/all-withdraw" element={<AllWithdraw />} />
    //         <Route path="/support" element={<Support />} />
    //         <Route path="/admin/problemcenter" element={<ProblemCenter />} />
    //         <Route path="/admin/notificationcenter" element={<NotificationCenter />} />
    //         <Route path="/admin/reports" element={<Report />} />
    //         <Route path="/admin/bets" element={<DailyBets />} />
    //         <Route path="/admin/matches" element={<Match />} />
    //         <Route path="/app-settings" element={<AppSettings />} />
    //         <Route path="/settings" element={<Setting />} />
    //         <Route path="/suscription" element={<Suscription />} />
    //         <Route path="/bonus" element={<Bonus />} />
    //         <Route path="/reportss" element={<Reportss />} />
    //         <Route path="/admin/duels/createduel" element={<CreateDuel />} />
    //         <Route path="/admin/images" element={<ImageGallery />} />
    //         <Route path="/contest-create" element={<Contestcreate />} />
    //         <Route path="/contest-list" element={<Contestlist />} />
    //         <Route path="/contest-details/:id" element={<ContestDetail />} />
    //         <Route path="/duo/create" element={<DuoContestForm />} />
    //         <Route path="/duo/result/:id" element={<DeclareResult />} />
    //         <Route path="/duoContests" element={<DuoContest />} />
    //         <Route path="/kyc" element={<Kyc />} />
    //         <Route path="/solo/create" element={<Contestcreate />} />
    //         <Route path="/solo" element={<Contestlist />} />
    //         <Route path="/solo/:id" element={<ContestDetail />} />
    //         <Route path="/solo/:id/declare-result" element={<ContestResultDeclaration />} />
    //         <Route path="/squad" element={<SquadContestsList />} />
    //         <Route path="/squad/create" element={<SquadContestForm />} />
    //         <Route path="/squad/:id" element={<SquadContest />} />
    //         <Route path="/squad/:id/declare-result" element={<SquadContestDeclareResult />} />
    //         <Route path="/stream" element={<Stream />} />
    //         <Route path="/mega" element={<MegaContestList />} />
    //         <Route path="/mega/create" element={<MegaContestForm />} />
    //         <Route path="/mega/:id" element={<MegaContest />} />
    //         <Route path="/referral-system" element={<ReferralSystem />} />
    //         <Route path="/tournaments" element={<Tournament />} />
    //         <Route path="/all-teams" element={<AllTeams />} />
    //         <Route path="/website-stats" element={<WebsiteStats />} />
    //         <Route path="/contactus" element={<ContactUs />} />
    //         <Route path="/blogs" element={<Blog />} />
    //         <Route path="/blog/:id" element={<BlogDetailPage />} />
    //         <Route path="/createblog" element={<BlogCreate />} />
    //         <Route path="/createblog/edit/:id" element={<BlogCreate />} />
    //         <Route path="/editblog/:id" element={<BlogCreate />} />
    //         <Route path="/rules-regulations" element={<RulesRegulations />} />
    //         <Route path="/watch-earn" element={<WatchEarn />} />
    //         <Route path="/payment-gateway" element={<PaymentGateway />} />
    //         <Route path="/generate-invoice" element={<Invoice />} />
    //         <Route path="/ads-management" element={<AdsManagement />} />
    //         <Route path="/refer-earns" element={<ReferEarn />} />
    //         <Route path="/phonepay-gateway" element={<PhonePayGateway />} />
    //         <Route path="/user-wallet-ledger" element={<UserWaletLeger />} />
    //         <Route path="/diamond-packs" element={<DiamondPacks />} />
    //         <Route path="/budles-manage" element={<BundlesManager />} />
    //         <Route path="/spin-reward-rules" element={<SpinRewardRules />} />
    //         <Route path="/exchange-rate" element={<ExchangeRate />} />
    //         <Route path="/user-redemption-logs" element={<UserRedemptionLogs />} />
    //         <Route path="/gateway-status" element={<GatewayStatus />} />
    //         <Route path="/group-management" element={<GroupManagement />} />
    //         <Route path="/email-controls" element={<EmailNotificationControl />} />
    //         <Route path="/subscription-members" element={<SubscriptionMembers />} />
    //         <Route path="/live/:streamKey" element={<LiveStream />} />
    //         <Route path="/group-members/:gameType/:groupId" element={<GroupMembers />} />
    //         <Route path="/imb-gateway-status" element={<ImbGatewayStatus />} />
    //         <Route path="/winner-groups" element={<TournamentWinnerGroups />} />
    //         <Route path="/winner-group-members/:gameType/:groupId" element={<WinnerGroupMembers />} />
    //         <Route path="/all-transactions" element={<AllTransactions />} />

    //         <Route path="*" element={<Navigate to="/" />} />
    //       </Routes>
    //     </div>
    //   </div>
    // </ProtectedRoute>

     <ProtectedRoute>
       <div className="flex h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300 w-full">
         {isSidebarOpen && <Sidebar />}
         <div className="flex-1 flex-col overflow-y-auto">
           <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
           <FirebaseNotificationHandler />
           <ToastContainer />
          <Routes>
             <Route path="/" element={<Dashboard />} />
             <Route path="/users" element={<AllUsers />} />
             <Route path="/teams" element={<Teams />} />
             <Route path="/add-teams" element={<AddTeam />} />
             <Route path="/games" element={<AllGames />} />
             <Route path="/prize-distribution" element={<PrizeDistribution />} />
             <Route path="/registation-details" element={<RegistrationDetails />} />
             <Route path="/games-registation" element={<GamesRegistration />} />
             <Route path="/games/create" element={<CreateGame />} />
             <Route path="/games/edit/:id" element={<CreateGame />} />
             <Route path="/matches" element={<AllMatches />} />
             <Route path="/matches/create" element={<CreateMatch />} />
            <Route path="/admin/duels" element={<DailyDuels />} />
             <Route path="/admin/ads" element={<Ads />} />
             <Route path="/voting-centre" element={<AllVotes />} />
             <Route path="/p&l-overview" element={<PLOverview />} />
             <Route path="/admin-management" element={<AdminManagement />} />
             <Route path="/system-health" element={<SystemHealth />} />
             <Route path="/audit-log" element={<AuditLogViewer />} />
             <Route path="/manual-ledger" element={<ManualLedger />} />
             <Route path="/user-settings" element={<UserSettings />} />
             <Route path="/user-kyc" element={<UserKYC />} />
             <Route path="/user-teams" element={<UserTeams />} />
             <Route path="/all-withdraw" element={<AllWithdraw />} />
             <Route path="/support" element={<Support />} />
             <Route path="/admin/problemcenter" element={<ProblemCenter />} />
             <Route path="/admin/notificationcenter" element={<NotificationCenter />} />
             <Route path="/admin/reports" element={<Report />} />
            <Route path="/admin/bets" element={<DailyBets />} />
             <Route path="/admin/matches" element={<Match />} />
             <Route path="/app-settings" element={<AppSettings />} />
             <Route path="/settings" element={<Setting />} />
             <Route path="/suscription" element={<Suscription />} />
             <Route path="/bonus" element={<Bonus />} />
             <Route path="/reportss" element={<Reportss />} />
             <Route path="/admin/duels/createduel" element={<CreateDuel />} />
             <Route path="/admin/images" element={<ImageGallery />} />
             <Route path="/contest-create" element={<Contestcreate />} />
             <Route path="/contest-list" element={<Contestlist />} />
             <Route path="/contest-details/:id" element={<ContestDetail />} />
             <Route path="/duo/create" element={<DuoContestForm />} />
             <Route path="/duo/result/:id" element={<DeclareResult />} />
             <Route path="/duoContests" element={<DuoContest />} />
             <Route path="/kyc" element={<Kyc />} />
             <Route path="/solo/create" element={<Contestcreate />} />
             <Route path="/solo" element={<Contestlist />} />
             <Route path="/solo/:id" element={<ContestDetail />} />
             <Route path="/solo/:id/declare-result" element={<ContestResultDeclaration />} />
             <Route path="/squad/" element={<SquadContestsList />} />
             <Route path="/squad/create" element={<SquadContestForm />} />
             <Route path="/squad/:id" element={<SquadContest />} />
             <Route path="/squad/:id/declare-result" element={<SquadContestDeclareResult />} />
             <Route path="/stream" element={<Stream />} />
             <Route path="/mega" element={<MegaContestList />} />
             <Route path="/mega/create" element={<MegaContestForm />} />
             <Route path="/mega/:id" element={<MegaContest />} />
             <Route path="/referral-system" element={<ReferralSystem />} />
             <Route path="/tournaments" element={<Tournament />} />
         <Route path="/all-teams" element={<AllTeams />} />
             <Route path="/website-stats" element={<WebsiteStats />} />
             <Route path="/contactus" element={<ContactUs />} />
             <Route path="/blogs" element={<Blog />} />
             <Route path="/blog/:id" element={<BlogDetailPage />} />
             <Route path="/createblog" element={<BlogCreate />} />
             <Route path="/createblog/edit/:id" element={<BlogCreate />} />
             <Route path="/editblog/:id" element={<BlogCreate />} />
             <Route path ="/rules-regulations" element={<RulesRegulations />} />
             <Route path="/watch-earn" element={<WatchEarn />} />
             <Route path="/payment-gateway" element={<PaymentGateway />} />
             <Route path="/generate-invoice" element={<Invoice />} />
             <Route path="/ads-management" element={<AdsManagement />} />
             <Route path="/refer-earns" element={<ReferEarn />} />
             <Route path="/phonepay-gateway" element={<PhonePayGateway />} />
             <Route path="/user-wallet-ledger" element={<UserWaletLeger />} />
             <Route path="/diamond-packs" element={<DiamondPacks />} />
             <Route path="/budles-manage" element={<BundlesManager />} />
             <Route path="/spin-reward-rules" element={<SpinRewardRules />} />
             <Route path="/exchange-rate" element={<ExchangeRate />} />
             <Route path="/user-redemption-logs" element={<UserRedemptionLogs />} />
             <Route path="/gateway-status" element={<GatewayStatus />} />
             <Route path="/group-management" element={<GroupManagement />} />
             <Route path="/email-controls" element={<EmailNotificationControl />} />
             <Route path="/subscription-members" element={<SubscriptionMembers />} />
             <Route path="/live/:streamKey" element={<LiveStream />} />
     
               <Route path="/group-members/:gameType/:groupId" element={<GroupMembers />} />
            <Route path="/imb-gateway-status" element={<ImbGatewayStatus />} />
             <Route path="/winner-groups" element={<TournamentWinnerGroups />} />
             <Route path="/winner-group-members/:gameType/:groupId" element={<WinnerGroupMembers />} />
             <Route path="/all-transactions" element={<AllTransactions />} />  
             <Route path="/teams-management" element={<TeamsManagement />} />
             <Route path="/support-subject" element={<SupportSubject />} />
             <Route path="*" element={<Navigate to="/" />} />
          </Routes>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
         </div>
       </div>
     </ProtectedRoute>
  );
}

export default App;

