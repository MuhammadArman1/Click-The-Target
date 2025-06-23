'use client';

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type Difficulty = "easy" | "medium" | "hard";
type LeaderboardEntry = {
  score: number;
  time: number;
  date: string;
  level: string;
};

export default function Home() {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const getTargetScore = () => {
    switch (difficulty) {
      case "easy":
        return 10;
      case "medium":
        return 20;
      case "hard":
        return 30;
    }
  };
  const targetScore = getTargetScore();

  useEffect(() => {
    if (!playing) return;

    const countdown = setInterval(() => {
      setTimer((t) => {
        if (score >= targetScore) {
          clearInterval(countdown);
          triggerCelebration();
          setResult("win");
          setPlaying(false);
          return t;
        }
        if (t === 1) {
          clearInterval(countdown);
          if (score >= targetScore) {
            triggerCelebration();
            setResult("win");
          } else {
            setResult("lose");
          }
          setPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [playing, score, targetScore]);

  useEffect(() => {
    let mover: NodeJS.Timeout;
    if (playing) {
      mover = setInterval(() => {
        setX(Math.floor(Math.random() * 80));
        setY(Math.floor(Math.random() * 80));
      }, 1000);
    }
    return () => clearInterval(mover);
  }, [playing]);

  useEffect(() => {
    if (result && score > 0 && typeof window !== "undefined") {
      const oldScores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      const newEntry = {
        score,
        time: 30 - timer,
        date: new Date().toLocaleString(),
        level: difficulty,
      };
      const updated = [newEntry, ...oldScores].slice(0, 5);
      localStorage.setItem("leaderboard", JSON.stringify(updated));
    }
  }, [result, score, timer, difficulty]);

  const handleClick = () => {
    if (!playing) return;
    setScore((s) => s + 1);
    setX(Math.floor(Math.random() * 80));
    setY(Math.floor(Math.random() * 80));
  };

  const startGame = () => {
    setScore(0);
    setTimer(30);
    setResult(null);
    setPlaying(true);
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const colors = ["#bb0000", "#ffffff", "#FFD700", "#00FF00"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center p-4 overflow-hidden">
      <h1 className="text-3xl font-bold mb-2">🎯 Click the Target</h1>

      <p className="text-sm text-gray-600 mb-4">
        Make <span className="font-semibold text-blue-600">{targetScore}</span> clicks in{" "}
        <span className="font-semibold text-blue-600">30 seconds</span> to win!
      </p>

      {!playing && result === null && (
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">Difficulty:</label>
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              className={`mx-1 px-3 py-1 rounded-full text-sm ${
                difficulty === level ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setDifficulty(level as Difficulty)}
            >
              {level}
            </button>
          ))}
        </div>
      )}

      <p className="mb-1 text-xl">⏱️ Time Left: {timer}s</p>
      <p className="mb-4 text-xl">🏆 Score: {score}</p>

      {!playing && (
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={startGame}
        >
          {result ? "Play Again" : "Start Game"}
        </button>
      )}

      {playing && (
        <div
          className="absolute w-16 h-16 bg-red-500 rounded-full cursor-pointer"
          onClick={handleClick}
          style={{
            top: `${y}%`,
            left: `${x}%`,
            position: "absolute",
            transform: "translate(-50%, -50%)",
            transition: "top 0.3s, left 0.3s",
          }}
        />
      )}

      {!playing && result === "win" && (
        <>
          <div className="text-green-600 text-xl mt-6 animate-bounce">🎉 You Win!</div>
          <p className="mt-2 text-sm text-gray-600">
            You completed the challenge in <strong>{30 - timer}</strong> seconds!
          </p>
        </>
      )}

      {!playing && result === "lose" && (
        <div className="text-red-600 text-xl mt-6">😢 You lost! Try again!</div>
      )}

      {!playing && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">🏆 Leaderboard</h2>
          <ul className="bg-white rounded-lg shadow p-4 space-y-2 text-left">
            {typeof window !== "undefined" &&
              JSON.parse(localStorage.getItem("leaderboard") || "[]").map(
                (entry: LeaderboardEntry, idx: number) => (
                  <li key={idx} className="text-sm">
                    {idx + 1}. <strong>{entry.score}</strong> clicks in{" "}
                    <strong>{entry.time}s</strong> (
                    <span className="capitalize">{entry.level}</span>) —{" "}
                    <span className="text-gray-500">{entry.date}</span>
                  </li>
                )
              )}
          </ul>
        </div>
      )}
    </div>
  );
}
