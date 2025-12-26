import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiCpu, FiShield, FiCheckCircle, FiArrowRight, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiMaximize, FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

// --- IMAGE SETUP ---
import dashboardImage1 from '../assets/dashboard-left.png';
import dashboardImage2 from '../assets/dashboard-right.png';
import algomed_ai from '../assets/algomed-ai.png';
import find_doctors from '../assets/find-doctors.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');

  const heroSlides = [
    { src: dashboardImage1, label: "Real-time Transcription" },
    { src: dashboardImage2, label: "AI Diagnostic Suggestions" }
  ];

  const featureSlides = [
    { src: algomed_ai, label: "Algomed - AI Chat" },
    { src: find_doctors, label: "Find Doctors" }
  ];

  const ProductScreenshotPlaceholder = ({ autoSlide = true, slides = [] }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      if (!autoSlide) return;
      const slideInterval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(slideInterval);
    }, [current, autoSlide]);

    const prevSlide = () => {
      setCurrent(current === 0 ? slides.length - 1 : current - 1);
    };

    const nextSlide = () => {
      setCurrent(current === slides.length - 1 ? 0 : current + 1);
    };

    if (!slides || slides.length === 0) return <div className="bg-gray-200 w-full h-full"></div>;

    return (
      <div className="relative overflow-hidden group w-full h-full">
        
        <div 
          className="flex transition-transform ease-out duration-700 h-full" 
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full h-full relative bg-slate-50">
              <img 
                src={slide.src} 
                alt={slide.label} 
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <FiChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 h-2 rounded-full cursor-pointer shadow-sm ${
                current === i ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        body {
          font-family: 'Inter', sans-serif !important;
        }
        .algo-app-container {
          zoom: 0.8;
        }
        @media (min-width: 768px) {
          .algo-app-container {
            zoom: 0.9;
          }
        }
        
        h1, h2, h3, h4, h5, h6, .brand-font, button {
          font-family: 'Inter', sans-serif !important;
        }
        @supports (-moz-appearance:none) {
          .algo-app-container {
            zoom: 1 !important;
            transform: scale(0.8);
            transform-origin: top center;
            width: 125%;
            height: 125%;
            overflow-x: hidden;
          }
          @media (min-width: 768px) {
            .algo-app-container {
              transform: scale(0.9);
              width: 111.11%;
              height: 111.11%;
            }
          }
        }
      `}</style>

      <div className="algo-app-container min-h-screen bg-white text-slate-900">
        
        {/* --- Navbar --- */}
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-500/20 shadow-lg">
                  <FiActivity className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 brand-font">AlgoMed</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Testimonials</a>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button onClick={handleLogin} className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors">Log in</button>
                <button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">Get Started</button>
              </div>
              <div className="md:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                  {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-xl absolute w-full">
              <a href="#features" className="block text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <hr className="border-slate-100" />
              <button onClick={handleLogin} className="block w-full text-left text-slate-600 font-bold py-2">Log in</button>
              <button onClick={handleSignup} className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg text-center">Get Started</button>
            </div>
          )}
        </nav>

        {/* --- Hero Section --- */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-3xl opacity-50 -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm">
              <BsStars className="w-3 h-3" /> New: AI Soap Notes 2.0
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
              The AI-Assisted <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Second Brain</span> for Modern Healthcare.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed font-normal">
              AlgoMed empowers doctors with real-time diagnostic support, automated clinical notes, and patient insights—so you can focus on care, not paperwork.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 px-4 sm:px-0">
              <button onClick={handleSignup} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-base md:text-lg font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto">
                Start Free Trial <FiArrowRight />
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base md:text-lg font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all w-full sm:w-auto">
                View Demo
              </button>
            </div>

            <div className="w-full max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20"></div>
                <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-video">
                  <ProductScreenshotPlaceholder slides={heroSlides} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Partners / Trust --- */}
        <section className="py-10 border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Trusted by forward-thinking clinics & providers</p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-60 brand-font">
              <span className="text-2xl font-bold text-slate-800">CLINIC<span className="font-light">OS</span></span>
              <span className="text-2xl font-bold text-slate-800">Medi<span className="text-blue-600">Care</span>+</span>
              <span className="text-2xl font-bold text-slate-800">Health<span className="italic">Sync</span></span>
              <span className="text-2xl font-bold text-slate-800">DOC<span className="text-cyan-600">AI</span></span>
            </div>
          </div>
        </section>

        {/* --- Features Grid --- */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Focus on patients. Let AI handle the rest.</h2>
              <p className="text-lg text-slate-600">Our advanced algorithms analyze patient data in real-time to provide actionable insights and automate administrative burdens.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FiCpu className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Clinical Assistant</h3>
                <p className="text-slate-600 leading-relaxed">Instantly generate differential diagnoses and treatment suggestions based on patient symptoms and history.</p>
              </div>
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <FiActivity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Automated SOAP Notes</h3>
                <p className="text-slate-600 leading-relaxed">Turn consultations into structured documentation automatically. Save up to 2 hours of charting daily.</p>
              </div>
              <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FiShield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
                <p className="text-slate-600 leading-relaxed">HIPAA-compliant infrastructure with end-to-end encryption ensures patient data remains private and secure.</p>
              </div>
            </div>

            <div className="mt-24 max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-4">
                    <FiMaximize className="w-3 h-3" /> Detailed View
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Experience the Clinical Interface</h3>
                <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
                  See how AlgoMed integrates seamlessly into your consultation workflow, offering real-time assistance without disrupting the patient connection.
                </p>
              </div>

              <div className="relative rounded-3xl shadow-2xl bg-white overflow-hidden aspect-video transform transition-all hover:scale-[1.005]">
                <ProductScreenshotPlaceholder autoSlide={true} slides={featureSlides} />
              </div>
            </div>

          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Designed for the modern medical workflow.</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Connect & Consult</h4>
                      <p className="text-slate-400">Launch a secure video consultation. AlgoMed listens in the background (with consent) to transcribe.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Real-time Analysis</h4>
                      <p className="text-slate-400">The AI highlights critical information and suggests potential conditions as the patient speaks.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">One-Click Documentation</h4>
                      <p className="text-slate-400">Review the generated notes and prescriptions, sign off, and push to your records instantly.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Representation */}
              <div className="bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                 <div className="bg-slate-900 rounded-xl p-8 h-96 flex flex-col justify-center items-center text-center">
                    <BsStars className="text-cyan-400 w-12 h-12 mb-4 animate-pulse" />
                    <p className="text-slate-300 font-mono text-sm mb-2">Analyzing Symptoms...</p>
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    </div>
                    <div className="mt-8 text-left w-full bg-slate-800/50 p-4 rounded border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                          <FiCheckCircle className="text-green-400" />
                          <span className="text-sm font-bold text-slate-200">Insight Detected</span>
                      </div>
                      <p className="text-xs text-slate-400">Patient reports persistent dry cough and low-grade fever. AI suggests considering: Viral URI, Seasonal Allergies.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Ready to upgrade your practice?</h2>
            <p className="text-xl text-slate-600 mb-10">Join thousands of healthcare professionals using AlgoMed to deliver better care, faster.</p>
            <button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105">
              Get Started for Free
            </button>
            <p className="mt-4 text-sm text-slate-400 font-medium">No credit card required • HIPAA Compliant</p>
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
                      <FiActivity size={14} />
                    </div>
                    <span className="text-lg font-bold text-slate-900 brand-font">AlgoMed</span>
                </div>
                <p className="text-sm text-slate-500">Transforming healthcare delivery through artificial intelligence.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-blue-600">Features</a></li>
                  <li><a href="#" className="hover:text-blue-600">Security</a></li>
                  <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                  <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-600">HIPAA</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">© 2025 AlgoMed Inc. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110">
                  <FiTwitter size={16} />
                </a>
                <a href="#" className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110">
                  <FiLinkedin size={16} />
                </a>
                <a href="#" className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110">
                  <FiGithub size={16} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;