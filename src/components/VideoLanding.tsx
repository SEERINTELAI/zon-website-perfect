import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './layout/Navbar';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import heroVideo from '../assets/hero-video.mov';
import logoTransparent from '../assets/logo-transparent.png';

const VideoLanding: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicMuted, setIsMusicMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();

  // Check if this is a return visit and show content immediately
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlReturnVisit = urlParams.get('return');
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    
    console.log('🔍 URL return param:', urlReturnVisit);
    console.log('🔍 Has visited:', hasVisited);
    console.log('🔍 Current URL:', window.location.href);
    
    // Simple return visit detection - if URL has ?return=true
    if (urlReturnVisit === 'true') {
      console.log('🎯 RETURN VISIT DETECTED via URL - Starting video at last 4 seconds');
      setIsReturnVisit(true);
      setShowNavigation(true);
      setIsVideoLoaded(true);
      setShowContent(false); // Don't show content immediately
      
      // Clean up URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('return');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // First visit - normal behavior
      console.log('🆕 FIRST VISIT - Normal video behavior');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile - show navigation immediately, let video control text fade
        setShowNavigation(true);
        setIsVideoLoaded(true);
      } else {
        // Desktop - normal behavior with 3-second fallback
        const fallback = setTimeout(() => {
          setShowContent(true);
          setShowNavigation(true);
          setIsVideoLoaded(true);
        }, 3000);
        
        return () => clearTimeout(fallback);
      }
    }
    
    // Mark that we've visited home
    sessionStorage.setItem('hasVisitedHome', 'true');
  }, []);

  // Video handling with return visit support
  useEffect(() => {
    const video = videoRef.current;
    console.log('Video ref:', video, 'isReturnVisit:', isReturnVisit);
    
    if (video) {
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded, duration:', video.duration);
        
        // If this is a return visit, start video at last 4 seconds
        if (isReturnVisit) {
          const duration = video.duration;
          const startTime = Math.max(0, duration - 4);
          console.log('🎬 Setting video to start at:', startTime, 'seconds');
          video.currentTime = startTime;
          // Make sure video plays from the start time
          video.play().catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Return visit video play failed:', error);
            }
          });
        }
      };

      const handleLoadedData = () => {
        console.log('Video loaded successfully');
        setIsVideoLoaded(true);
        video.play().catch((error) => {
          console.log('Video play failed:', error);
          // If autoplay fails, show content anyway
          setShowContent(true);
          setShowNavigation(true);
        });
      };

      const handleTimeUpdate = () => {
        const duration = video.duration;
        const currentTime = video.currentTime;

        if (isReturnVisit) {
          // For return visits, show content when we reach the last 2 seconds
          const lastTwoSeconds = duration - 2;
          if (currentTime >= lastTwoSeconds && !showContent) {
            setShowContent(true);
          }
        } else {
          // For first visits, show content at 35% of video
          if (currentTime >= duration * 0.35 && !showContent && !showNavigation) {
            setShowContent(true);
            setShowNavigation(true);
          }
        }
      };

      const handleVideoEnd = () => {
        setHasVideoEnded(true);
        setShowContent(true);
        setShowNavigation(true);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleVideoEnd);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [showContent, showNavigation, isReturnVisit]);

  // No aggressive video control needed - let it play from 75%

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Black background fallback */}
      <div className="absolute inset-0 bg-black" />
      {/* Video Background */}
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay={true}
        muted
        playsInline
        preload="auto"
        controls={false}
        loop={false}
        onError={(e) => {
          console.error('Video error:', e);
          setIsVideoLoaded(true);
          setShowContent(true);
          setShowNavigation(true);
        }}
        className="absolute inset-0 w-full h-full object-cover z-10"
      />
      
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      {/* Navigation Menu */}
      {showNavigation && (
        <div className={`transition-all ${isReplaying ? 'duration-0' : 'duration-[3000ms]'} ease-in-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}>
          <Navbar />
        </div>
      )}
      {/* Content Overlay - CENTERED POSITIONING */}
      <div className="relative z-20 min-h-screen px-6 text-center text-white flex items-center justify-center">
        {/* Main Content - MOBILE OPTIMIZED */}
        <div className={`transition-all ${isReplaying ? 'duration-0' : 'duration-[3000ms]'} ease-in-out ${
          showContent 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}>
          
          {/* Tagline - CENTERED */}
          <h1 className="font-bold leading-tight tracking-wider uppercase text-center mb-8" style={{
            fontSize: 'clamp(0.875rem, 2.2vw, 1.75rem)',
            color: '#FFC06B',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.53), 1px 1px 2px rgba(0, 0, 0, 0.53), 0px 0px 1px rgba(0, 0, 0, 0.53)',
            lineHeight: '1.2',
            wordSpacing: '0.1em'
          }}>
            ZON builds AI that makes AI better
          </h1>

          {/* Logo - CENTERED */}
          <div className="flex justify-center mb-8">
            <img
              src={logoTransparent}
              alt="ZON"
              className="w-auto"
              style={{
                height: 'clamp(8rem, 15vw, 12rem)',
                maxHeight: '50vh'
              }}
            />
          </div>

          {/* Description - CENTERED */}
          <p className="text-white max-w-4xl mx-auto leading-relaxed text-center whitespace-pre-line" style={{
            fontSize: 'clamp(0.875rem, 2.2vw, 1.5rem)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.53), 1px 1px 2px rgba(0, 0, 0, 0.53), 0px 0px 1px rgba(0, 0, 0, 0.53)',
            lineHeight: '1.6',
            padding: '0 1rem'
          }}>
            Revolutionary AI technology that transforms how businesses{'\n'}operate, optimize, and scale.
          </p>

        </div>


        {/* Logo reveal removed - using single logo in content */}

        {/* Video replay prompt when video has ended */}
        {hasVideoEnded && (
          <div className="absolute top-20 left-6">
            <button 
              onClick={() => {
                // Set replaying state FIRST for instant transition
                setIsReplaying(true);
                
                // Fade out content immediately - no delay
                setShowContent(false);
                setShowNavigation(false);
                setHasVideoEnded(false);
                
                // Reset video and play
                const video = videoRef.current;
                if (video) {
                  video.currentTime = 0;
                  video.play();
                  
                  // Wait for video to reach the timing point, then fade back in
                  const checkTiming = () => {
                    const duration = video.duration;
                    const currentTime = video.currentTime;
                    
                    if (currentTime >= duration * 0.35) {
                      setIsReplaying(false); // Reset replaying state first
                      setShowContent(true); // Show content with proper transition
                      setShowNavigation(true); // Show navigation at the same time
                    } else if (currentTime < duration * 0.35) {
                      // Keep checking until we reach the timing point
                      requestAnimationFrame(checkTiming);
                    }
                  };
                  
                  // Start checking timing after a brief delay
                  setTimeout(checkTiming, 100);
                }
              }}
              className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 animate-pulse-glow animate-gentle-bounce text-sm md:text-base"
            >
              ▶ Replay Video
            </button>
          </div>
        )}

        {/* Music Player - Positioned under replay button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 mt-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 border-2 border-white/40 shadow-lg">
              {/* Play/Pause Button */}
              <button
                onClick={() => window.toggleMusic && window.toggleMusic()}
                className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-black/20"
                aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
              >
                {isMusicPlaying ? (
                  <Pause className="w-6 h-6 text-black" />
                ) : (
                  <Play className="w-6 h-6 text-black ml-1" />
                )}
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.toggleMute && window.toggleMute()}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={isMusicMuted ? 'Unmute' : 'Mute'}
                >
                  {isMusicMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={(e) => window.handleVolumeChange && window.handleVolumeChange(e)}
                  className="w-20 h-2 bg-black/30 rounded-lg appearance-none cursor-pointer slider border border-white/30"
                  style={{
                    background: `linear-gradient(to right, #FFFFFF 0%, #FFFFFF ${musicVolume * 100}%, #1F2937 ${musicVolume * 100}%, #1F2937 100%)`,
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            
            <p className="text-white/90 text-sm font-medium">
              {isMusicPlaying ? 'Music playing' : 'Click to play background music'}
            </p>
          </div>
        </div>
      </div>
      {/* Loading State */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4" />
          <p className="text-white text-lg">Loading video...</p>
        </div>
      )}

      {/* Music Player Functions */}
      {(() => {
        // Define functions in component scope
        window.toggleMusic = () => {
          if (audioRef.current) {
            if (isMusicPlaying) {
              audioRef.current.pause();
              setIsMusicPlaying(false);
            } else {
              if (isMusicMuted) {
                audioRef.current.muted = false;
                setIsMusicMuted(false);
              }
              audioRef.current.play();
              setIsMusicPlaying(true);
            }
          }
        };

        window.handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newVolume = parseFloat(e.target.value);
          setMusicVolume(newVolume);
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
          }
        };

        window.toggleMute = () => {
          if (audioRef.current) {
            audioRef.current.muted = !isMusicMuted;
            setIsMusicMuted(!isMusicMuted);
          }
        };

        return null;
      })()}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        muted
        preload="auto"
        volume={musicVolume}
      >
        <source src="/audio/sample-music.wav" type="audio/wav" />
        <source src="/audio/sample-music.mp3" type="audio/mpeg" />
        <source src="/audio/sample-music.ogg" type="audio/ogg" />
        Your browser doesn't support audio playback.
      </audio>
      
    </div>
  );
};

export default VideoLanding;