'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Chess piece types for the animation
const chessPieces = [
  // White pieces (bottom row)
  { type: 'rook', color: 'white', finalPos: { row: 7, col: 0 } },
  { type: 'knight', color: 'white', finalPos: { row: 7, col: 1 } },
  { type: 'bishop', color: 'white', finalPos: { row: 7, col: 2 } },
  { type: 'queen', color: 'white', finalPos: { row: 7, col: 3 } },
  { type: 'king', color: 'white', finalPos: { row: 7, col: 4 } },
  { type: 'bishop', color: 'white', finalPos: { row: 7, col: 5 } },
  { type: 'knight', color: 'white', finalPos: { row: 7, col: 6 } },
  { type: 'rook', color: 'white', finalPos: { row: 7, col: 7 } },
  // White pawns
  ...Array(8).fill(null).map((_, i) => ({ type: 'pawn', color: 'white', finalPos: { row: 6, col: i } })),
  // Black pawns
  ...Array(8).fill(null).map((_, i) => ({ type: 'pawn', color: 'black', finalPos: { row: 1, col: i } })),
  // Black pieces (top row)
  { type: 'rook', color: 'black', finalPos: { row: 0, col: 0 } },
  { type: 'knight', color: 'black', finalPos: { row: 0, col: 1 } },
  { type: 'bishop', color: 'black', finalPos: { row: 0, col: 2 } },
  { type: 'queen', color: 'black', finalPos: { row: 0, col: 3 } },
  { type: 'king', color: 'black', finalPos: { row: 0, col: 4 } },
  { type: 'bishop', color: 'black', finalPos: { row: 0, col: 5 } },
  { type: 'knight', color: 'black', finalPos: { row: 0, col: 6 } },
  { type: 'rook', color: 'black', finalPos: { row: 0, col: 7 } },
];

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [boardPosition, setBoardPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateBoardPosition = () => {
      if (boardRef.current) {
        const boardGrid = boardRef.current.querySelector('.chess-board');
        if (boardGrid) {
          const rect = boardGrid.getBoundingClientRect();
          const scrollTop = window.scrollY;
          setBoardPosition({
            top: rect.top + scrollTop,
            left: rect.left,
            width: rect.width,
          });
        }
      }
    };

    updateBoardPosition();
    window.addEventListener('resize', updateBoardPosition);
    
    return () => window.removeEventListener('resize', updateBoardPosition);
  }, [mounted]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      // Animation completes when we scroll about 1 screen height (not 1.2)
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate random initial positions for pieces (spread across the viewport)
  const getInitialPosition = (index: number) => {
    const seed = index * 137.5; // Golden angle for distribution
    const angle = seed * 0.1;
    const radius = 350 + (index % 6) * 100; // Increased radius for wider spread
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotation: (seed * 57.3) % 360,
    };
  };

  const renderPiece = (type: string, color: string) => {
    const fillColor = color === 'white' ? '#ffffff' : '#000000';
    const strokeColor = color === 'white' ? '#000000' : '#ffffff';
    const strokeWidth = color === 'white' ? '1.5' : '1.5';
    
    switch (type) {
      case 'king':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,11.63 L 22.5,6" />
              <path d="M 20,8 L 25,8" />
              <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
              <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37 z" />
              <path d="M 12.5,30 C 18,27 27,27 32.5,30" fill="none" />
              <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" />
              <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" />
            </g>
          </svg>
        );
      
      case 'queen':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2.75" />
              <circle cx="14" cy="9" r="2.75" />
              <circle cx="22.5" cy="8" r="2.75" />
              <circle cx="31" cy="9" r="2.75" />
              <circle cx="39" cy="12" r="2.75" />
              <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 30,24.5 15,24.5 9,26 z" />
              <path d="M 11.5,30 C 15,29 30,29 33.5,30" fill="none" />
              <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none" />
            </g>
          </svg>
        );
      
      case 'rook':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
              <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
              <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
              <path d="M 11,14 L 34,14" fill="none" />
            </g>
          </svg>
        );
      
      case 'bishop':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
              <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
              <path d="M 25,8 A 2.5,2.5 0 1 1 20,8 A 2.5,2.5 0 1 1 25,8 z" />
              <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" fill="none" strokeLinecap="butt" />
            </g>
          </svg>
        );
      
      case 'knight':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
              <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
              <path d="M 9.5,25.5 A 0.5,0.5 0 1 1 8.5,25.5 A 0.5,0.5 0 1 1 9.5,25.5 z" fill={strokeColor} stroke="none" />
              <path d="M 15,15.5 A 0.5,1.5 0 1 1 14,15.5 A 0.5,1.5 0 1 1 15,15.5 z" fill={strokeColor} stroke="none" transform="rotate(30 14.5 15.5)" />
            </g>
          </svg>
        );
      
      case 'pawn':
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,9 C 19.5,9 17,11.5 17,14.5 C 17,17 18,19 18,19 C 18,19 16,20 16,23 C 16,26 17,27 17,27 L 28,27 C 28,27 29,26 29,23 C 29,20 27,19 27,19 C 27,19 28,17 28,14.5 C 28,11.5 25.5,9 22.5,9 z" />
              <path d="M 16,27 L 16,32 C 16,32 15,33 15,36 C 15,39 16,39.5 16,39.5 L 29,39.5 C 29,39.5 30,39 30,36 C 30,33 29,32 29,32 L 29,27 L 16,27 z" />
              <path d="M 16,30 L 29,30 M 16,33.5 L 29,33.5" fill="none" />
            </g>
          </svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">♔</div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Smart Chess Academy</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">How It Works</a>
              <Link href="/auth/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-900/20">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 bg-slate-900/5 text-slate-700 rounded-full text-sm font-semibold tracking-wide">
              WHERE STRATEGY MEETS SIMPLICITY
            </span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600">
              Master Chess,
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500">
              Together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-light">
            The elegant platform connecting chess coaches and students.
            <br />Create, assign, and track progress—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/auth/signup" className="group px-12 py-5 bg-slate-900 text-white rounded-full text-lg font-semibold hover:bg-slate-800 transition-all transform hover:scale-105 shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/40">
              Start Free Trial
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <button className="px-12 py-5 bg-white text-slate-900 rounded-full text-lg font-semibold border-2 border-slate-900 hover:bg-slate-50 transition-all shadow-lg">
              Watch Demo
            </button>
          </div>
          
          <div className="mt-20 flex flex-col items-center gap-3">
            <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Scroll to see the magic</p>
            <div className="w-6 h-10 border-2 border-slate-400 rounded-full p-1 animate-bounce">
              <div className="w-1.5 h-3 bg-slate-400 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center py-20 relative" ref={boardRef}>
        {mounted && (
          <div 
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ 
              zIndex: scrollProgress > 0.5 ? 40 : 5,
            }}
          >
            {chessPieces.map((piece, index) => {
              const initial = getInitialPosition(index);
              
              // Calculate square size based on actual board width
              const squareSize = boardPosition.width / 8;
              
              // Calculate final position based on actual board location
              const boardCenterX = 0;
              const boardCenterY = 100; // Offset to align with the board visually (moved down to account for title)
              const finalX = (piece.finalPos.col - 3.5) * squareSize + boardCenterX;
              const finalY = (piece.finalPos.row - 3.5) * squareSize + boardCenterY;
              
              // At the start (scrollProgress = 0), pieces are at initial positions + offset to first section
              // At scrollProgress = 1, pieces are at final board positions
              const startOffsetY = typeof window !== 'undefined' ? -window.innerHeight * 0.5 : -400;
              
              const currentX = initial.x + (finalX - initial.x) * scrollProgress;
              const currentY = initial.y + startOffsetY + ((finalY - initial.y - startOffsetY) * scrollProgress);
              const currentRotation = initial.rotation * (1 - scrollProgress);
              const currentOpacity = 0.3 + scrollProgress * 0.7; // Start more transparent
              const currentScale = 1.2 + scrollProgress * (-0.2); // Start bigger (1.2), end at 1.0
              
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    width: `${squareSize * 0.9}px`,
                    height: `${squareSize * 0.9}px`,
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${currentRotation}deg) scale(${currentScale})`,
                    opacity: currentOpacity,
                    transition: 'transform 0.1s ease-out, opacity 0.3s ease-out',
                  }}
                >
                  {renderPiece(piece.type, piece.color)}
                </div>
              );
            })}
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6">
          <div 
            className="transition-all duration-1000"
            style={{
              opacity: scrollProgress,
              transform: `translateY(${(1 - scrollProgress) * 50}px)`,
            }}
          >
            <div className="text-center mb-12">
              <span className="px-4 py-2 bg-slate-900/5 text-slate-700 rounded-full text-sm font-semibold tracking-wide inline-block mb-4">
                WATCH THE PIECES ALIGN
              </span>
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Everything Falls
                <br />Into Place
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
                Just like these chess pieces, your coaching workflow becomes perfectly organized.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-8 md:p-12 mb-16 relative border border-slate-200/50" style={{ zIndex: 1 }}>
              <div className="chess-board grid grid-cols-8 gap-0 w-full max-w-2xl mx-auto aspect-square border-4 border-slate-900 rounded-2xl overflow-hidden relative shadow-xl">
                {Array(64).fill(null).map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLight = (row + col) % 2 === 0;
                  
                  return (
                    <div
                      key={i}
                      className={`${isLight ? 'bg-amber-100' : 'bg-amber-800'} flex items-center justify-center relative`}
                      style={{
                        opacity: Math.max(0.3, scrollProgress),
                        transition: `opacity 300ms ease-out ${i * 5}ms`,
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Board coordinates */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 text-slate-400 text-xs font-semibold tracking-wider">
                <span>A—H</span>
                <span>1—8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(148,163,184,0.05),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <span className="px-4 py-2 bg-slate-900/5 text-slate-700 rounded-full text-sm font-semibold tracking-wide inline-block mb-6">
              POWERFUL FEATURES
            </span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Built for Chess Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Everything you need to coach effectively and learn efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Content Library',
                description: 'Create and organize chess lessons with our intuitive builder. Add positions, annotations, and variations effortlessly.',
              },
              {
                icon: '🎯',
                title: 'Smart Assignments',
                description: 'Assign personalized training to students and track their completion in real-time. Never lose track of progress.',
              },
              {
                icon: '💬',
                title: 'Real-time Messaging',
                description: 'Communicate instantly with students. Discuss games, provide feedback, and stay connected throughout their journey.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200/50 hover:border-slate-900 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold tracking-wide inline-block mb-6">
              HOW IT WORKS
            </span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple. Powerful. Effective.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Get started in minutes and transform your chess coaching experience.
            </p>
          </div>
          
          <div className="space-y-8">
            {[
              { step: '01', title: 'Create Your Account', description: 'Sign up as a coach or player in seconds. Choose your role and set up your profile.' },
              { step: '02', title: 'Build Your Content', description: 'Create engaging lessons with our intuitive editor. Add chess positions, annotations, and training materials.' },
              { step: '03', title: 'Connect & Assign', description: 'Share invite links with students or coaches. Assign content and start tracking progress immediately.' },
              { step: '04', title: 'Track & Improve', description: 'Monitor progress with detailed analytics. Provide feedback and watch skills improve over time.' },
            ].map((item, index) => (
              <div key={index} className="group flex flex-col md:flex-row items-start gap-8 hover:translate-x-4 transition-transform duration-300">
                <div className="text-7xl md:text-8xl font-bold text-white/10 md:w-40 flex-shrink-0 group-hover:text-white/20 transition-colors">
                  {item.step}
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(148,163,184,0.1),transparent_70%)]"></div>
        
        <div className="max-w-5xl mx-auto text-center px-6 relative">
          <div className="inline-block mb-8">
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/5 rounded-full">
              <span className="text-2xl">♔</span>
              <span className="text-sm font-semibold text-slate-700 tracking-wide">JOIN THOUSANDS OF CHESS ENTHUSIASTS</span>
            </div>
          </div>
          <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight">
            Ready to Elevate
            <br />Your Chess Journey?
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Join coaches and students using Smart Chess Academy to achieve their goals.
            <br />Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
            <Link href="/auth/signup" className="group px-14 py-6 bg-slate-900 text-white rounded-full text-xl font-semibold hover:bg-slate-800 transition-all transform hover:scale-105 shadow-2xl shadow-slate-900/30">
              Get Started Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/auth/login" className="px-14 py-6 bg-white text-slate-900 rounded-full text-xl font-semibold border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all shadow-lg">
              Sign In
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            ✓ Free 14-day trial &nbsp;&nbsp;•&nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp;•&nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">♔</div>
              <span className="text-2xl font-bold">Smart Chess Academy</span>
            </div>
            <div className="flex gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a>
              <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">© 2025 Smart Chess Academy. Elevate your game, together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
