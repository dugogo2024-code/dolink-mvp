"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MatchingForm from "@/components/MatchingForm";

const Background = dynamic(() => import("@/components/Background"), { ssr: false });

export default function Home() {
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showTitleCursor, setShowTitleCursor] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBgLoaded) {
      const delayTimer = setTimeout(() => {
        let current = 0;
        const target = 777;
        const duration = 3500;
        const frameRate = 30;
        const increment = target / (duration / frameRate);

        timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setTotalAssets(target);
            clearInterval(timer);
          } else {
            setTotalAssets(Math.floor(current));
          }
        }, frameRate);
      }, 1200);

      return () => {
        clearTimeout(delayTimer);
        if (timer) clearInterval(timer);
      };
    }
  }, [isBgLoaded]);

  useEffect(() => {
    if (isBgLoaded) {
      setShowTitleCursor(true);
      let currentText = "";
      let currentIndex = 0;
      const fullText = "ASSETS.\nINTELLIGENT.\nCONNECTED.";
      const typingSpeed = 130;

      const typeChar = () => {
        if (currentIndex < fullText.length) {
          currentText += fullText[currentIndex];
          setDisplayedText(currentText);
          currentIndex++;
          setTimeout(typeChar, typingSpeed);
        } else {
          setTimeout(() => setShowTitleCursor(false), 600);
        }
      };

      setTimeout(typeChar, 1000);
    }
  }, [isBgLoaded]);

  return (
    <div className={`relative min-h-screen`}>
      <Background isLoaded={isBgLoaded} setIsLoaded={setIsBgLoaded} />

      <div className={`relative z-10 flex flex-col min-h-screen transition-opacity duration-1000 ${isBgLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <header className="w-full fixed top-0 z-40 glass-panel border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 sm:py-5 flex justify-between items-center">
            <div className="font-bold text-lg sm:text-xl tracking-tight">
              link-assets.ai<span className="animate-blink ml-0.5">_</span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center px-6 pt-24 pb-12 sm:pt-32">
          <div className="max-w-4xl text-center space-y-8 sm:space-y-10 mb-12 sm:mb-20">
            <div className="inline-block px-3 py-1 sm:px-4 sm:py-1 border border-white/20 bg-black/40 text-[12px] sm:text-[15px] tracking-[0.2em] sm:tracking-[0.3em] uppercase">
              &gt; Let's Make Money... OK
            </div>

            <h1 className="text-4xl sm:text-7xl font-bold tracking-tighter leading-tight sm:leading-none relative">
              <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
                ASSETS.<br />INTELLIGENT.<br />CONNECTED.
              </span>
              <span className="absolute inset-0">
                {displayedText.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
                {showTitleCursor && <span className="animate-blink text-white ml-0.5">_</span>}
              </span>
            </h1>

            <p className="text-xs sm:text-base text-gray-400 max-w-sm sm:max-w-xl mx-auto leading-relaxed px-4">
              심연의 우주 속에서 지능형 자산망이 실시간으로 연결합니다.<br className="hidden sm:block" /> M&A 매칭 플랫폼 'DO link' MVP
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 relative z-50">
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-12 sm:px-24 py-4 sm:py-5 bg-white text-black text-lg sm:text-xl font-extrabold uppercase hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-sm"
              >
                DO link
              </button>
            </div>
          </div>

          {/* Stats Section - Now in normal flow for better mobile compatibility */}
          <div className="w-full max-w-6xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-auto sm:mb-12">
            {[
              { l: 'Total_Assets', v: `+${totalAssets}` },
              { l: 'Buy_Side', v: '10' },
              { l: 'Sell_Side', v: '5' },
              { l: 'UPTIME', v: '99.99%' }
            ].map((s, i) => (
              <div key={i} className="glass-panel p-3 sm:p-4 border-l-2 border-l-white">
                <div className="text-[12px] sm:text-[15px] text-gray-500 mb-1">{s.l}</div>
                <div className="text-lg sm:text-xl font-bold">{s.v}</div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <MatchingForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
