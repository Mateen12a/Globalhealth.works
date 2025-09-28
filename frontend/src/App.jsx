
// src/App.jsx
import Navbar from "./components/Navbar";
import Hero from "./components/landing/Hero";
import Categories from "./components/landing/Categories";
import HowItWorks from "./components/landing/HowItWorks";
import Testimonials from "./components/landing/Testimonials";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";

function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
