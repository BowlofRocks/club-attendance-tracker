import Nav from "./views/partials/Header/Nav";
import Footer from "./views/partials/Footer/Index"
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AttendanceList from "./views/attendance/Index";


function App() {
  return (
    <Router>
      <header>
        <Nav />
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<AttendanceList />} />
        </Routes>
      </main>

      <footer>
        <Footer />
      </footer>

    </Router>
  );
}

export default App;
