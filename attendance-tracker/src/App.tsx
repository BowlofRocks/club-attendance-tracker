import Nav from "./views/partials/Header/Nav";
import Footer from "./views/partials/Footer/Index"
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AttendanceList from "./views/attendance/Index";
import SubscriptionsList from "./views/subscriptions/Index";
import Login from "./views/login/index";
import ForgotPassword from "./views/forgot-password/index";
import ResetPassword from "./views/forgot-password/reset";
import Contact from "./views/contact/Index";

function App() {
  return (
    <Router>
      <header>
        <Nav />
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<AttendanceList />} />
          <Route path="/members" element={<SubscriptionsList />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>

      <footer>
        <Footer />
      </footer>

    </Router>
  );
}

export default App;
