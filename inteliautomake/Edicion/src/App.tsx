import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  Menu,
  X,
  MessageSquare,
  Calendar,
  Maximize2,
  ArrowLeft,
  MessageCircle,
  Linkedin,
  Mail,
  Instagram,
  Youtube,
  CalendarDays,
  Play,
  Pause
} from 'lucide-react';
import { services } from './data/services';
import { projects } from './data/projects';

// Lazy load components
const ChatBot = lazy(() => import('./components/ChatBot').then(module => ({ default: module.ChatBot })));
const ContactForm = lazy(() => import('./components/ContactForm').then(module => ({ default: module.ContactForm })));
const ImageCarousel = lazy(() => import('./components/ImageCarousel').then(module => ({ default: module.ImageCarousel })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse bg-white/10 rounded-lg p-4">Cargando...</div>
  </div>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [expandedCard, setExpandedCard] = useState<{
    type: 'service' | 'project';
    index: number;
  } | null>(null);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Button animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsButtonVisible(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Rest of your existing code...

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Elements */}
      <div className="animated-bg"></div>
      <div className="tech-grid"></div>
      <div className="gradient-overlay"></div>

      {/* Your existing header code... */}

      <main className="relative pt-24">
        <section id="inicio" className="min-h-[90vh] relative overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/videos/IA1.mp4" type="video/mp4" />
            </video>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
            {/* Video Controls */}
            <button
              onClick={toggleVideo}
              className="absolute bottom-4 right-4 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            >
              {isVideoPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-6 relative z-10 h-[90vh] flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Automatización Inteligente para tu Negocio
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Transformamos tu empresa con soluciones de IA y automatización personalizadas.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Empezar Ahora
                </button>
                <a 
                  href="https://calendly.com/sermuri/primer-encuentro"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Agendar Consulta
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of your existing sections... */}
      </main>

      {/* Rest of your existing code... */}
    </div>
  );
}

export default App;