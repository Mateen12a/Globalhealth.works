import Navbar from "./components/Navbar";
import Hero from "./components/landing/Hero";
import Partners from "./components/landing/Partners";
import HowItWorks from "./components/landing/HowItWorks";
import FocusAreas from "./components/landing/FocusAreas";
import Features from "./components/landing/Features";
import Stats from "./components/landing/Stats";
import Testimonials from "./components/landing/Testimonials";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <HowItWorks />
        <FocusAreas />
        <Features />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
