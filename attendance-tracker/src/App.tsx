import Nav from "./views/partials/Header/Nav";
import Footer from "./views/partials/Footer/Index"
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <header>
        <Nav />
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<h1>Home Page</h1>} />
        </Routes>
      </main>

      <footer>
        <Footer />
      </footer>

    </Router>
  );
}

export default App;
