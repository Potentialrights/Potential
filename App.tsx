import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import { GAME_DURATION, GRID_SIZE, MOLE_UP_MAX_TIME, MOLE_UP_MIN_TIME } from './constants';
import Hole from './components/Hole';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [ducks, setDucks] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setDucks(new Array(GRID_SIZE).fill(false));
    setGameState(GameState.PLAYING);
  }, []);

  const whackDuck = useCallback((index: number) => {
    if (!ducks[index]) return;

    setScore(prev => prev + 10);
    setDucks(prevDucks => {
      const newDucks = [...prevDucks];
      newDucks[index] = false;
      return newDucks;
    });
  }, [ducks]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            setGameState(GameState.GAME_OVER);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
      // Ensure all ducks are down when not playing
      setDucks(new Array(GRID_SIZE).fill(false));
      return;
    }

    const popUpDuck = () => {
      const availableDucks = ducks
        .map((isUp, index) => (isUp ? -1 : index))
        .filter(index => index !== -1);
      
      if (availableDucks.length === 0) {
        duckTimeoutRef.current = setTimeout(popUpDuck, MOLE_UP_MIN_TIME);
        return;
      }

      const randomIndex = availableDucks[Math.floor(Math.random() * availableDucks.length)];

      setDucks(prevDucks => {
        const newDucks = [...prevDucks];
        newDucks[randomIndex] = true;
        return newDucks;
      });

      const timeUp = Math.random() * (MOLE_UP_MAX_TIME - MOLE_UP_MIN_TIME) + MOLE_UP_MIN_TIME;
      setTimeout(() => {
        setDucks(prevDucks => {
          const newDucks = [...prevDucks];
          if (newDucks[randomIndex]) { // Check if it hasn't been whacked
            newDucks[randomIndex] = false;
          }
          return newDucks;
        });
      }, timeUp);

      const nextPopUpTime = Math.random() * 800 + 400;
      duckTimeoutRef.current = setTimeout(popUpDuck, nextPopUpTime);
    };
    
    duckTimeoutRef.current = setTimeout(popUpDuck, 750);

    return () => {
      if (duckTimeoutRef.current) {
        clearTimeout(duckTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);
  

  const renderScreen = () => {
    switch (gameState) {
      case GameState.READY:
        return <StartScreen onStart={startGame} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} onRestart={startGame} />;
      case GameState.PLAYING:
      default:
        return (
          <>
            <div className="w-full max-w-lg bg-yellow-900/50 text-white p-4 rounded-lg shadow-xl mb-6 flex justify-between items-center text-xl md:text-2xl font-bold">
              <div className="bg-white text-yellow-900 px-4 py-1 rounded">Score: {score}</div>
              <div className="bg-white text-yellow-900 px-4 py-1 rounded">Time: {timeLeft}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8 p-4 bg-yellow-800/60 rounded-xl shadow-inner">
              {ducks.map((isUp, index) => (
                <Hole key={index} isDuckUp={isUp} onWhack={() => whackDuck(index)} />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4" style={{backgroundImage: "url('https://picsum.photos/seed/ducks/1080/1920')"}}>
        <div className="bg-black/30 absolute inset-0"></div>
        <main className="relative z-10 flex flex-col items-center justify-center text-center">
            {renderScreen()}
        </main>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="bg-green-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-white flex flex-col items-center">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-2" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>Gemini Duck Smack</h1>
    <p className="text-lg mb-6">Tap the ducks as they pop up!</p>
    <button
      onClick={onStart}
      className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold py-4 px-12 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200"
    >
      Start Game
    </button>
  </div>
);

const GameOverScreen: React.FC<{ score: number; onRestart: () => void }> = ({ score, onRestart }) => (
  <div className="bg-green-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-white flex flex-col items-center">
    <h2 className="text-5xl md:text-7xl font-extrabold mb-2">Game Over!</h2>
    <p className="text-3xl mb-6">Your Score: <span className="text-yellow-400 font-bold">{score}</span></p>
    <button
      onClick={onRestart}
      className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold py-4 px-12 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200"
    >
      Play Again
    </button>
  </div>
);


export default App;