/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { Sun, Star, Trophy, AlertCircle, RefreshCcw, Heart, Zap, Volume2, VolumeX, X } from 'lucide-react';

// --- Types ---
type GameState = 'START' | 'TUTORIAL' | 'TUTORIAL_INFO' | 'WARNING' | 'COUNTDOWN' | 'LEVEL1' | 'LEVEL2' | 'LEVEL3' | 'LEVEL4' | 'LEVEL7' | 'LEVEL8' | 'LEVEL_GRADIENT' | 'LEVEL_MEMORY' | 'LEVEL_MIXING' | 'LEVEL_SHADOW' | 'FINAL' | 'SPECIAL' | 'MASTER' | 'GAMEOVER' | 'CLEAR' | 'TIMEUP' | 'TRANSITION' | 'RESULT' | 'REVIEW';

const TRUE_YELLOW = '#ffd900';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '★かんたん',
  2: '★★ふつう',
  3: '★★★むずかしい',
  5: '★★★★★たつじん'
};

// --- Helper Components ---

const FormattedText = ({ text, className }: { text: string, className?: string }) => {
  const lines = text.split('。').filter(s => s.length > 0).map(s => s + '。');
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <p key={i} className="mb-1">{line}</p>
      ))}
    </div>
  );
};

const DifficultyStars = ({ difficulty }: { difficulty: number }) => {
  const label = DIFFICULTY_LABELS[difficulty] || '★';
  return (
    <div className="flex gap-2 items-center bg-black/20 px-4 py-1 rounded-full border border-white/10">
      <span className="text-xs font-black text-yellow-500 tracking-widest uppercase">{label}</span>
    </div>
  );
};

const LongPressButton = ({ onComplete, text }: { onComplete: () => void, text: string }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(0);

  const startPress = () => {
    setPressing(true);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(100, (elapsed / 3000) * 100);
      setProgress(p);
      if (p >= 100) {
        stopPress();
        onComplete();
      }
    }, 16);
  };

  const stopPress = () => {
    setPressing(false);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <button
      onMouseDown={startPress}
      onMouseUp={stopPress}
      onMouseLeave={stopPress}
      onTouchStart={startPress}
      onTouchEnd={stopPress}
      className="relative overflow-hidden bg-stone-800 text-yellow-500 px-12 py-8 rounded-[2rem] font-black text-2xl sm:text-3xl border-4 border-stone-700 active:scale-95 transition-transform min-w-[280px]"
    >
      <div 
        className="absolute bottom-0 left-0 h-full bg-yellow-500/20 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 block">{text}</span>
      <span className="relative z-10 block text-sm opacity-50 mt-2">(3秒長押し)</span>
    </button>
  );
};

const TutorialInfoScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "基本操作",
      desc: "表示される黄色のボタンを体験し、3秒間保持すると次に進みます。",
      action: "黄色のボタンを体験",
      icon: "🟡"
    },
    {
      title: "本物を見抜く",
      desc: "疑似問題をタップして、正しい黄色を選ぶ感覚を掴みます。",
      action: "正しい黄色を選択",
      icon: "🎯"
    },
    {
      title: "制限時間",
      desc: "5分以内にできるだけ多くのポイントを獲得しましょう。",
      action: "ゲームスタート",
      icon: "⏱"
    }
  ];

  useEffect(() => {
    if (!completed) return;
    if (progress >= 100) {
      const next = step + 1;
      setCompleted(false);
      setProgress(0);
      if (next < steps.length) {
        setStep(next);
      } else {
        onComplete();
      }
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 10));
    }, 300);
    return () => clearInterval(interval);
  }, [completed, progress, step, steps.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center text-center p-6 space-y-6 w-full max-w-2xl mx-auto h-full"
    >
      <div className="bg-stone-900 border-4 border-yellow-500 p-6 sm:p-10 rounded-[3rem] shadow-2xl w-full space-y-5">
        <h3 className="text-2xl sm:text-4xl font-black text-yellow-500">{steps[step].title}</h3>
        <div className="w-24 h-24 rounded-full bg-yellow-500 text-black text-4xl flex items-center justify-center mx-auto">{steps[step].icon}</div>
        <p className="text-stone-300 font-bold text-base sm:text-xl leading-relaxed break-words">{steps[step].desc}</p>

        <button
          onClick={() => {
            if (!completed) setCompleted(true);
          }}
          disabled={completed}
          className={`w-full bg-yellow-500 text-stone-950 py-3 rounded-full font-black text-sm sm:text-xl hover:scale-105 transition-transform shadow-lg ${completed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {completed ? '完了まで待機...' : steps[step].action}
        </button>

        <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-xs sm:text-sm text-stone-400">完了操作後、3秒のタイムバーで次に進みます。</p>
      </div>
    </motion.div>
  );
};

const WarningScreen = ({ onComplete }: { onComplete: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center justify-center text-center p-4 space-y-8 w-full max-w-2xl mx-auto h-full"
  >
    <div className="relative w-full overflow-hidden rounded-[3rem] border-4 border-yellow-400/50 bg-gradient-to-br from-amber-500/20 via-rose-600/20 to-violet-900/30 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,0,0.15),transparent_30%)] animate-pulse" />
      <div className="relative z-10 p-8 sm:p-12">
        <AlertCircle className="w-18 h-18 sm:w-24 sm:h-24 text-red-200 mx-auto mb-4 animate-pulse" />
        <h3 className="text-3xl sm:text-5xl font-black text-white mb-6">⚠️ 警告 / WARNING ⚠️</h3>
        <div className="space-y-4 text-white font-bold text-base sm:text-xl leading-relaxed">
          <FormattedText text="このゲームは目が非常にダメージを受ける可能性があります。体に異変があれば直ちに中断してください。" />
          <p className="text-sm sm:text-lg opacity-90 italic">開発者は改善に取り組んでいます。ゆっくり深呼吸してから進んでください。</p>
        </div>
      </div>
    </div>
    <LongPressButton onComplete={onComplete} text="理解して進む" />
  </motion.div>
);

const TransitionScreen = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.2 }}
    className="flex flex-col items-center justify-center space-y-4"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <Sun className="w-20 h-20 text-yellow-500" />
    </motion.div>
    <p className="text-yellow-500 font-black text-2xl animate-pulse tracking-widest">NEXT LEVEL...</p>
  </motion.div>
);

const ResultScreen = ({ isCorrect, reason, points, onComplete }: { isCorrect: boolean, reason?: string, points: number, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      className="flex flex-col items-center justify-center space-y-8 text-center p-4"
    >
      {isCorrect ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
          </motion.div>
          <h2 className="text-4xl sm:text-6xl font-black text-yellow-400 italic tracking-tighter">正解！！<br />HAPPY!!</h2>
        </>
      ) : (
        <>
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            <AlertCircle className="w-24 h-24 sm:w-32 sm:h-32 text-red-500" />
          </motion.div>
          <h2 className="text-4xl sm:text-6xl font-black text-red-500 italic tracking-tighter">不正解...</h2>
          {reason && <FormattedText text={reason} className="text-lg sm:text-2xl font-bold text-stone-400 max-w-md" />}
        </>
      )}
      <div className="text-yellow-300 font-black text-base sm:text-2xl">この問題で獲得したポイント: {points}</div>
      <div className="w-48 h-2 bg-stone-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
          className="h-full bg-yellow-500"
        />
      </div>
    </motion.div>
  );
};

const Level_Gradient = ({ onAnswer, difficulty }: any) => {
  const targetX = useMemo(() => Math.random() * 80 + 10, []);
  
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-2xl font-black text-yellow-500 text-center">グラデーションの中から<br />「真実の黄色」をタップせよ</h2>
      <div className="relative w-full h-48 rounded-3xl overflow-hidden border-4 border-stone-800 shadow-2xl">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to right, #FFD700, #FFFF00 ${targetX}%, #FDFD96)` 
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const dist = Math.abs(x - targetX);
            const score = Math.max(0, 1000 - Math.floor(dist * 100));
            onAnswer(dist < 10, score, 'グラデーション', `${Math.round(x)}%`, `${Math.round(targetX)}%`);
          }}
        />
      </div>
    </div>
  );
};

const Level_Memory = ({ onAnswer, difficulty }: any) => {
  const [stage, setStage] = useState<'MEMORIZE' | 'PICK'>('MEMORIZE');
  const colors = useMemo(() => {
    const list = ['#FFD700', '#FDFD96', '#EED202', '#FFFF00'].sort(() => Math.random() - 0.5);
    return list;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setStage('PICK'), 2000 - (difficulty * 300));
    return () => clearTimeout(timer);
  }, [difficulty]);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-2xl font-black text-yellow-500 text-center">
        {stage === 'MEMORIZE' ? '「真実の黄色」の位置を覚えろ！' : '「真実の黄色」はどこだった？'}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {colors.map((color, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => stage === 'PICK' && onAnswer(color === '#FFFF00', false, '記憶識別', color, '#FFFF00')}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-stone-800 shadow-xl"
            style={{ backgroundColor: stage === 'MEMORIZE' ? color : '#292524' }}
          />
        ))}
      </div>
    </div>
  );
};

const Level_Mixing = ({ onAnswer, difficulty }: any) => {
  const [blue, setBlue] = useState(128);
  
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-2xl font-black text-yellow-500 text-center">青成分を調整して<br />「真実の黄色」を作り出せ</h2>
      <div 
        className="w-48 h-48 rounded-full border-8 border-stone-800 shadow-2xl transition-colors duration-200"
        style={{ backgroundColor: `rgb(255, 255, ${blue})` }}
      />
      <div className="w-full max-w-xs space-y-4">
        <input 
          type="range" min="0" max="255" value={blue} 
          onChange={(e) => setBlue(Number(e.target.value))}
          className="w-full h-4 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
        <button
          onClick={() => {
            const dist = Math.abs(blue - 0);
            const score = Math.max(0, 1000 - Math.floor(dist * 4));
            onAnswer(blue <= 25, score, '青成分調整', `Blue: ${blue}`, 'Blue: 0');
          }}
          className="w-full bg-yellow-500 text-stone-950 font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform"
        >
          これで決定
        </button>
      </div>
    </div>
  );
};

const Level_Shadow = ({ onAnswer, difficulty }: any) => {
  const shadows = useMemo(() => {
    const list = [
      'rgba(255, 255, 0, 0.5)',
      'rgba(255, 200, 0, 0.5)',
      'rgba(200, 255, 0, 0.5)',
      'rgba(255, 255, 100, 0.5)'
    ].sort(() => Math.random() - 0.5);
    return list;
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-2xl font-black text-yellow-500 text-center">影の輝きから<br />「真実の黄色」を見抜け</h2>
      <div className="grid grid-cols-2 gap-8">
        {shadows.map((shadow, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAnswer(shadow === 'rgba(255, 255, 0, 0.5)', false, '影の識別', shadow, 'rgba(255, 255, 0, 0.5)')}
            className="w-20 h-20 rounded-full bg-[#FFFF00]"
            style={{ boxShadow: `0 0 40px ${shadow}` }}
          />
        ))}
      </div>
    </div>
  );
};

const MasterLevel = ({ onAnswer }: { onAnswer: (isCorrect: boolean, score: number | boolean, levelName: string, player: string, correctAnswer: string) => void }) => {
  const [targetColor] = useState('#FFFF00');
  const options = useMemo(() => {
    const list = [];
    for (let i = 0; i < 99; i++) {
      const r = 255;
      const g = 255;
      const b = Math.floor(Math.random() * 5) + 1; // Very close to 0
      list.push(`rgb(${r},${g},${b})`);
    }
    list.push('#FFFF00');
    return list.sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="bg-red-600 text-white px-4 py-1 rounded-full font-black animate-pulse">たつじんモード</div>
      <h2 className="text-xl font-black text-yellow-500 text-center">100個の黄色から<br />唯一の「真実」を瞬時に選べ</h2>
      <div className="grid grid-cols-10 gap-1 p-2 bg-stone-950 rounded-xl border-2 border-red-600/50">
        {options.map((color, i) => (
          <button
            key={i}
            onClick={() => onAnswer(color === '#FFFF00', color === '#FFFF00' ? 1000 : 0, '達人識別', color, '#FFFF00')}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm hover:scale-125 transition-transform"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

const CountdownScreen = ({ count }: { count: number }) => (
  <motion.div
    key={count}
    initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    exit={{ scale: 2, opacity: 0, rotate: 20 }}
    transition={{ type: "spring", damping: 12 }}
    className="flex items-center justify-center"
  >
    <span className="text-[8rem] sm:text-[12rem] font-black text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">
      {count > 0 ? count : "GO!"}
    </span>
  </motion.div>
);

const CustomCursor = ({ isMobile }: { isMobile: boolean }) => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 18, stiffness: 1400, mass: 0.35 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isPointer, setIsPointer] = useState(false);
  const [isYellow, setIsYellow] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
      
      const bgColor = window.getComputedStyle(target).backgroundColor;
      // Simple check for yellow-ish colors
      setIsYellow(bgColor.includes('rgb(255, 255, 0)') || bgColor.includes('rgb(250, 204, 21)'));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, isMobile]);

  if (isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div 
        animate={{ 
          scale: isPointer ? 1.5 : 1,
          borderColor: isYellow ? '#000000' : '#EAB308',
          backgroundColor: isYellow ? 'rgba(0,0,0,0.2)' : 'rgba(234,179,8,0.2)'
        }}
        className="w-full h-full rounded-full border-2 backdrop-blur-[1px] flex items-center justify-center"
      >
        <div className={`w-1 h-1 rounded-full ${isYellow ? 'bg-black' : 'bg-yellow-500'}`} />
      </motion.div>
    </motion.div>
  );
};

const StartBackground = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {isMobile ? (
        [...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ x: Math.random() * 100 + "%", y: -20, opacity: 0 }}
            animate={{ x: Math.random() * 100 + "%", y: 120, opacity: [0, 0.8, 0] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: "linear", delay: -i * 0.2 }}
            className="absolute"
          >
            <Star className="w-4 h-4 text-yellow-300/80" />
          </motion.div>
        ))
      ) : (
        [...Array(24)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ y: [null, Math.random() * 20 - 10 + "%"], x: [null, Math.random() * 20 - 10 + "%"], opacity: [0, 0.25, 0] }}
            transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#5C3A14] border border-[#B88E4B]"
              style={{ boxShadow: '0 0 20px rgba(250,204,21,0.2)' }}
            >
              <div className="w-full h-full bg-yellow-300 mix-blend-screen opacity-60" />
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

// --- Level Components ---

const Level5 = () => null; // Removed
const Level6 = () => null; // Removed

const Level7 = ({ onAnswer, difficulty }: any) => {
  const gridSize = 4 + Math.floor(difficulty / 2);
  const [correctIdx] = useState(Math.floor(Math.random() * (gridSize * gridSize)));
  
  const baseColor = "#FACC15"; // rgb(250, 204, 21)
  const diff = 80 - (difficulty * 10); // Even more difference for visibility
  const targetColor = `rgb(250, 204, ${21 + diff})`;

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-yellow-500 font-bold">わずかに違う黄色を見つけろ</h2>
      <div 
        className="grid gap-2 p-4 bg-stone-800 rounded-2xl w-full max-w-md aspect-square"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {[...Array(gridSize * gridSize)].map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAnswer(i === correctIdx, 0, '色彩識別', i === correctIdx ? '正解' : '不正解', '真実の黄色')}
            className="aspect-square rounded-lg shadow-md"
            style={{ backgroundColor: i === correctIdx ? targetColor : baseColor }}
          />
        ))}
      </div>
    </div>
  );
};

const Level8 = ({ onAnswer, difficulty, isDeveloperMode }: any) => {
  const words = useMemo(() => {
    const distractors = ["YELOW", "YELLOV", "YELL0W", "YELOWW", "YELLO", "YELOW"];
    const list = Array(12).fill("").map(() => distractors[Math.floor(Math.random() * distractors.length)]);
    list[Math.floor(Math.random() * list.length)] = "YELLOW";
    return list;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-yellow-500 font-bold">本物の「YELLOW」を探せ</h2>
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-4">
        {words.map((w, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, backgroundColor: "#292524" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer(w === "YELLOW", 0, '単語識別', w, 'YELLOW')}
            className={`bg-stone-800 text-yellow-500/80 p-3 rounded-xl font-mono text-sm font-black border ${isDeveloperMode && w === 'YELLOW' ? 'border-red-500' : 'border-stone-700'}`}
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
const Level1 = ({ onAnswer, difficulty, isDeveloperMode }: any) => {
  const options = useMemo(() => [
    '#FFFF00', // 正解
    '#FDFD96', // パステル
    '#FFD700', // ゴールド
    '#EED202', // セーフティ
  ].sort(() => Math.random() - 0.5), []);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 bg-stone-800/50 p-4 rounded-2xl border border-stone-700">
          <DifficultyStars difficulty={difficulty} />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-yellow-500 text-center leading-tight">
          4つの黄色から<br />「真実」を選び抜け
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {options.map((color, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer(color === '#FFFF00', false, '4択識別', color, '#FFFF00')}
            className={`w-32 h-32 sm:w-48 sm:h-48 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-4 ${isDeveloperMode && color === '#FFFF00' ? 'border-red-500' : 'border-stone-800'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

const Level2 = ({ onAnswer, difficulty }: any) => {
  const [items, setItems] = useState<{ id: number; x: number; y: number; color: string; isTrue: boolean }[]>([]);
  const [caught, setCaught] = useState(0);

  const yellowVariations = [
    { color: '#FFFF00', isTrue: true },
    { color: '#FFFF00', isTrue: true }, // Increase true yellow ratio
    { color: '#FFCC00', isTrue: false },
    { color: '#CCFF00', isTrue: false },
    { color: '#FFFF99', isTrue: false },
    { color: '#B8860B', isTrue: false },
    { color: '#FFD700', isTrue: false },
    { color: '#999900', isTrue: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = yellowVariations[Math.floor(Math.random() * yellowVariations.length)];
      setItems(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          y: -10,
          ...variation
        },
      ]);
    }, Math.max(150, 400 - difficulty * 50)); // Faster spawn
    return () => clearInterval(interval);
  }, [difficulty]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setItems(prev => prev.map(item => ({ ...item, y: item.y + (0.8 + difficulty * 0.2) })).filter(item => item.y < 110));
    }, 30);
    return () => clearInterval(moveInterval);
  }, [difficulty]);

  const handleItemClick = (id: number, isTrue: boolean) => {
    if (isTrue) {
      setCaught(c => {
        const next = c + 1;
        if (next >= 10) onAnswer(true, false, '黄色集め', '10個', '10個');
        return next;
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      onAnswer(false, false, '黄色集め', '偽物を選択', '真実のみ');
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full h-full max-h-[60vh]">
      <div className="flex justify-between items-center px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <div className="relative flex-1 bg-stone-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-4 border-stone-800 shadow-inner min-h-[300px]">
        <div className="absolute top-4 left-4 text-yellow-500 font-bold z-10 bg-stone-950/90 px-4 sm:px-6 py-1 sm:py-2 rounded-full border border-stone-800 text-xs sm:text-base">
          真実の黄色を10個集めろ: {caught}/10
        </div>
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, top: `${item.y}%`, left: `${item.x}%` }}
              exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.2 } }}
              onClick={() => handleItemClick(item.id, item.isTrue)}
              className="absolute cursor-pointer p-2"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-white/20"
                style={{ backgroundColor: item.color }}
              >
                <Sun className="text-white/30 w-6 h-6 sm:w-8 sm:h-8" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Level3 = ({ onAnswer, difficulty }: any) => {
  const questions = [
    { q: '「真実の黄色」を16進数のカラーコードで表すと？', a: '#FFFF00', o: ['#FFFF00', '#FFCC00', '#FFFF99'] },
    { q: 'このゲームで、黄色と共に追い求める究極の感情は？', a: 'ハッピー', o: ['ラッキー', 'ハッピー', 'スマイル'] },
    { q: '黄色い花で、常に太陽の方を向いて咲くのは？', a: 'ひまわり', o: ['たんぽぽ', 'ひまわり', '菜の花'] },
  ];
  const [qIdx, setQIdx] = useState(0);

  const handleChoice = (ans: string) => {
    if (ans === questions[qIdx].a) {
      if (qIdx + 1 < questions.length) {
        setQIdx(qIdx + 1);
      } else {
        onAnswer(true, false, '黄色クイズ', '全問正解', '全問正解');
      }
    } else {
      onAnswer(false, false, '黄色クイズ', ans, questions[qIdx].a);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <FormattedText text={`Q: ${questions[qIdx].q}`} className="text-lg sm:text-2xl font-bold text-stone-100 text-center leading-relaxed px-4" />
      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-xs">
        {questions[qIdx].o.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, backgroundColor: "#EAB308" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice(opt)}
            className="bg-yellow-500 text-stone-950 font-black py-3 sm:py-4 px-6 rounded-2xl transition-all shadow-xl text-sm sm:text-base"
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const Level4 = ({ onAnswer, difficulty, isMobile }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const targetCount = 5 + difficulty;

  useEffect(() => {
    const spawn = setInterval(() => {
      const fakeChance = Math.random() < 0.3;
      setItems(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          y: -10,
          isFake: fakeChance,
          speed: (isMobile ? 1.6 : 0.8) + difficulty * 0.2
        }];
        return next.slice(-18);
      });
    }, isMobile ? 300 : 350);
    return () => clearInterval(spawn);
  }, [difficulty, isMobile]);

  useEffect(() => {
    const move = setInterval(() => {
      setItems(prev => prev.map(item => ({ ...item, y: item.y + item.speed })).filter(item => item.y < 115));
    }, 30);
    return () => clearInterval(move);
  }, []);

  const [count, setCount] = useState(0);

  const handleItemClick = (item: any) => {
    if (item.isFake) {
      onAnswer(false, 0, '動体視力', '偽物に触れた', '本物の黄色');
      return;
    }
    setCount(c => {
      const next = c + 1;
      if (next >= targetCount) {
        onAnswer(true, 0, '動体視力', '捕獲完了', '本物の黄色');
      }
      return next;
    });
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full max-h-[70vh]">
      <div className="flex justify-between items-center px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <div className="relative flex-1 bg-stone-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-4 border-stone-800 shadow-inner min-h-[300px]">
        <div className="absolute top-4 left-4 text-stone-400 font-bold z-10 bg-stone-950/80 px-3 py-1 rounded-full text-xs sm:text-base">
          逃げる黄色を捕まえろ: {count}/{targetCount}
        </div>
        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ top: `${item.y}%`, left: `${item.x}%`, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute rounded-full border-2 ${item.isFake ? 'border-red-500 bg-amber-300' : 'border-yellow-200 bg-yellow-500'} shadow-lg`} 
              style={{ transform: 'translate(-50%, -50%)', width: item.isFake ? 30 : 42, height: item.isFake ? 30 : 42, zIndex: item.isFake ? 30 : 20 }}
              onClick={() => handleItemClick(item)}
            >
              {!item.isFake && <Sun className="w-4 h-4 text-white" />}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FinalLevel = ({ onAnswer, difficulty }: any) => {
  const colors = useMemo(() => {
    const grid = [];
    for (let i = 0; i < 25; i++) {
      const r = 255;
      const g = 255;
      const b = Math.floor(Math.random() * 100);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      grid.push(hex);
    }
    grid[Math.floor(Math.random() * 25)] = '#FFFF00';
    return grid;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex justify-between items-center w-full px-4">
        <DifficultyStars difficulty={difficulty} />
      </div>
      <h2 className="text-yellow-500 font-black text-xl">究極の選択。真実の黄色はどれだ。</h2>
      <div className="grid grid-cols-5 gap-2 p-4 bg-stone-800 rounded-3xl">
        {colors.map((c, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAnswer(c === '#FFFF00', false, '究極識別', c, '#FFFF00')}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
};

const SpecialLevel = ({ onAnswer, difficulty, isDeveloperMode }: any) => {
  const [isReal, setIsReal] = useState(Math.random() > 0.5);
  const correctText = isReal ? '本物' : '偽物';

  return (
    <div className="flex flex-col items-center gap-6 w-full py-8 sm:py-12">
      <div className="bg-yellow-500 text-stone-950 px-6 py-2 rounded-full font-black animate-pulse">SPECIAL</div>
      <h2 className="text-3xl sm:text-5xl font-black text-yellow-500 text-center">この黄色は本物ですか？</h2>
      <div className="w-48 h-48 rounded-full border-4 border-yellow-300 bg-yellow-200/80 flex items-center justify-center text-5xl font-black text-yellow-800 shadow-2xl">?</div>
      <div className="text-stone-300 text-center max-w-md">この丸の中の黄色は{correctText}です。正しいものを選んでください。</div>
      <div className="flex flex-wrap justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAnswer(isReal, isReal ? 1000 : 0, 'スペシャル', '本物', (isReal ? '本物' : '偽物'))}
          className={`px-8 py-3 rounded-full font-black text-lg ${isDeveloperMode && isReal ? 'border-4 border-red-500' : 'bg-yellow-500 text-stone-950'} transition-all`}
        >
          本物
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAnswer(!isReal, !isReal ? 1000 : 0, 'スペシャル', '偽物', (isReal ? '本物' : '偽物'))}
          className={`px-8 py-3 rounded-full font-black text-lg ${isDeveloperMode && !isReal ? 'border-4 border-red-500' : 'bg-stone-800 text-yellow-300'} transition-all`}
        >
          偽物
        </motion.button>
      </div>
    </div>
  );
};

const FinalResultScreen = ({ score, onReview, onExit }: { score: number, onReview: () => void, onExit: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-8 bg-stone-900 p-12 rounded-[3rem] border-4 border-yellow-500/30 w-full max-w-2xl shadow-2xl"
  >
    <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
    <h2 className="text-5xl font-black text-yellow-500">GAME CLEAR!</h2>
    <div className="text-6xl font-black text-white bg-yellow-500/10 py-8 rounded-3xl border border-yellow-500/20">
      SCORE: {score}
    </div>
    <div className="flex flex-col gap-4">
      <button 
        onClick={onReview}
        className="bg-yellow-500 text-stone-950 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform"
      >
        結果を詳しく見る
      </button>
      <button 
        onClick={onExit}
        className="bg-stone-800 text-yellow-500 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform"
      >
        タイトルに戻る
      </button>
    </div>
  </motion.div>
);

const ReviewScreen = ({ history, onBack }: { history: any[], onBack: () => void }) => {
  const getRating = (item: any) => {
    if (item.isCorrect) return '★★★★★';
    if (item.score > 500) return '★★★☆☆';
    return '★☆☆☆☆';
  };

  const getComment = (item: any) => {
    if (item.isCorrect) return '完璧な真実の黄色です！素晴らしい眼力ですね。';
    if (item.score > 0) return '惜しい！真実まであと一歩のところでした。';
    return 'まだまだ修行が足りないようです。真実の輝きを求めて。';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-4xl bg-stone-900 rounded-[3rem] border-4 border-stone-800 overflow-hidden flex flex-col h-[80vh]"
    >
      <div className="p-8 border-b border-stone-800 flex justify-between items-center shrink-0">
        <h2 className="text-3xl font-black text-yellow-500">プレイの振り返り</h2>
        <button onClick={onBack} className="text-stone-400 hover:text-white transition-colors">
          <RefreshCcw className="w-8 h-8" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {history.map((item, i) => (
          <div key={i} className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-yellow-500/50 text-xs font-black uppercase tracking-widest">Level {i + 1}: {item.level}</span>
                <h3 className="text-xl font-black text-white">{getRating(item)}</h3>
              </div>
              <div className="text-right">
                <div className="text-yellow-500 font-black text-lg">+{item.score} pts</div>
                <div className="text-stone-500 text-xs">{item.time.toFixed(1)}s</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-stone-900 p-3 rounded-xl">
                <div className="text-stone-500 mb-1">あなたの回答</div>
                <div className="text-white font-bold">{item.playerAnswer}</div>
              </div>
              <div className="bg-stone-900 p-3 rounded-xl">
                <div className="text-stone-500 mb-1">正解</div>
                <div className="text-yellow-500 font-bold">{item.correctAnswer}</div>
              </div>
            </div>
            <p className="text-stone-400 text-sm italic leading-relaxed">
              「{getComment(item)}」
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AdminWindow = ({ onClose, onEnableDeveloperMode }: { onClose: () => void; onEnableDeveloperMode: () => void }) => {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [showProblems, setShowProblems] = useState(false);

  const handleLogin = () => {
    if (password === 'fEDfeDJL3UJY') {
      setIsAuth(true);
      onEnableDeveloperMode();
    } else {
      alert('パスワードが違います。');
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed top-20 left-20 w-96 bg-stone-900 border-2 border-stone-700 rounded-xl shadow-2xl z-[1000] overflow-hidden"
    >
      <div className="bg-stone-800 p-2 flex justify-between items-center cursor-move">
        <div className="flex items-center gap-2 px-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-stone-400 text-xs font-bold ml-2">管理者パネル</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-stone-700 rounded">
          <X className="w-4 h-4 text-stone-400" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {!isAuth ? (
          <div className="space-y-4">
            <h3 className="text-yellow-500 font-black">管理者認証</h3>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-stone-950 border border-stone-800 p-2 rounded text-white"
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-yellow-500 text-stone-950 font-black py-2 rounded"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-green-500 font-black">認証済み</h3>
            <button 
              onClick={() => setShowProblems(!showProblems)}
              className="w-full bg-stone-800 text-white py-2 rounded hover:bg-stone-700 transition-colors"
            >
              出題される問題の一覧
            </button>
            {showProblems && (
              <div className="text-xs text-stone-400 space-y-1 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded">
                <p>・LEVEL1: 4択識別</p>
                <p>・LEVEL2: 黄色集め</p>
                <p>・LEVEL3: 黄色クイズ</p>
                <p>・LEVEL4: 動体視力</p>
                <p>・LEVEL7: 色彩識別</p>
                <p>・LEVEL8: 単語識別</p>
                <p>・LEVEL_GRADIENT: グラデーション</p>
                <p>・LEVEL_MEMORY: 記憶識別</p>
                <p>・LEVEL_MIXING: 青成分調整</p>
                <p>・LEVEL_SHADOW: 影の識別</p>
                <p>・SPECIAL: スペシャル</p>
                <p>・FINAL: 究極識別</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const VersionInfoWindow = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 bg-stone-950 z-[2000] flex flex-col p-6 sm:p-12 overflow-y-auto"
  >
    <div className="max-w-4xl mx-auto w-full space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl sm:text-6xl font-black text-yellow-500">UPDATE LOG</h2>
        <button 
          onClick={onClose}
          className="bg-stone-800 text-white p-4 rounded-full hover:bg-stone-700 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="space-y-12">
        <section className="space-y-6 bg-stone-900 p-8 rounded-[3rem] border-2 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 text-stone-950 px-4 py-1 rounded-full font-black">NEW</div>
            <h3 className="text-3xl font-black text-white">Ver 1.1.2</h3>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈修正内容〉</h4>
            <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
              <li>スタート画面のボタンを押しやすく、押した時に押し込みアニメーションを追加しました。</li>
              <li>スコア表示はゲーム開始後のみ表示されるように変更しました。</li>
              <li>管理者モードログイン後、管理者ボタンに赤い枠を表示するようにしました。</li>
              <li>警告画面にアニメーションと強調テキストを追加しました。</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900 p-8 rounded-[3rem] border-2 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <h3 className="text-3xl font-black text-white">Ver 1.1.1</h3>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈修正内容〉</h4>
            <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
              <li>BGMが流れない問題を解消しました。</li>
              <li>スタート画面のアニメーションとテキストを改善しました。</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900 p-8 rounded-[3rem] border-2 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <h3 className="text-3xl font-black text-white">Ver 1.1.0</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈システムの追加内容〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>「真実の黄色」を #ffd900 に統一しました。</li>
                <li>BGMを追加しました。</li>
                <li>公開方法を変更しました。<span className="text-red-400 font-black">公開方法を変更</span></li>
                <li>スタート画面のバージョン表示を 1.1.0 に更新しました。</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈ゲーム内容の変更について〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>正解/不正解時のポイント表示をより明確にしました。</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈その他〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>UIの表示安定化を継続しました。</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900 p-8 rounded-[3rem] border-2 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 text-stone-950 px-4 py-1 rounded-full font-black">NEW</div>
            <h3 className="text-3xl font-black text-white">Ver 1.0.3</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈システムの変更について〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>画面の自動調整を改善し、各端末で最大表示できるよう調整しました。</li>
                <li>オリジナルポインターの追従速度を向上しました。</li>
                <li>操作完了後に3秒のタイムバーが進行し次に移動するようにしました。</li>
                <li>ゲーム時間を5分に変更しました。</li>
                <li>BGM再生を確実にするためオーディオ制御を整理しました。</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈ゲーム内容の変更について〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>問題の継続プレイで黄系を当てる指示にステップ型説明を追加しました。</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black text-yellow-500 mb-3">〈その他〉</h4>
              <ul className="text-lg text-stone-300 space-y-3 list-disc list-inside font-bold">
                <li>細かなUI調整と表示安定化を行いました。</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900/50 p-8 rounded-[3rem] border-2 border-stone-800">
          <h3 className="text-2xl font-black text-stone-400">Ver 1.0.2</h3>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈システムの変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>説明画面をインタラクティブに改善し、１操作で次へ進めるようにしました。</li>
              <li>スマホ版の文字サイズ自動調整を強化しました。</li>
              <li>PCカーソルが黄色に触れたとき黒に視覚的に変化するようにしました。</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈ゲーム内容の変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>インタラクティブ説明の表示を改善し、見やすさを向上しました。</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900/50 p-8 rounded-[3rem] border-2 border-stone-800">
          <h3 className="text-2xl font-black text-stone-400">Ver 1.0.1</h3>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈システムの変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>遊び方説明画面を追加し、操作が分かりやすくなりました。</li>
              <li>PC版とスマホ版で操作感を最適化し、UIを統一しました。</li>
              <li>画面サイズが各端末で自動調節されるよう修正しました。</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈ゲーム内容の変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>不正解時のコメントの改行を修正しました。</li>
              <li>BGMが再生されない不具合を修正しました。</li>
              <li>スマホ版で音量バーを非表示にしました。</li>
              <li>スタートボタンのアニメーションを軽量化しました。</li>
              <li>「黄色集め」で正解の黄色が出現しやすくなるよう調整しました。</li>
              <li>クイズの内容をゲームのテーマに沿ったものに変更しました。</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6 bg-stone-900/50 p-8 rounded-[3rem] border-2 border-stone-800">
          <h3 className="text-2xl font-black text-stone-400">Ver 1.0.0</h3>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈システムの変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>ゲームの基本画面とレベル構造を実装しました。</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-black text-yellow-500 mb-3">〈ゲーム内容の変更について〉</h4>
            <ul className="text-base text-stone-500 space-y-2 list-disc list-inside">
              <li>黄色を探すスコアアタックを実装しました。</li>
            </ul>
          </div>
        </section>
      </div>

    </div>
  </motion.div>
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [levelTimeLeft, setLevelTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [levelStartTime, setLevelStartTime] = useState(0);
  const [lastLevel, setLastLevel] = useState<GameState | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean, reason?: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [levelPool, setLevelPool] = useState<GameState[]>([]);
  const [volume, setVolume] = useState(50);
  const [highScore, setHighScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isTutorial, setIsTutorial] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('yellow_happy_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('yellow_happy_high_score', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const playingStates: GameState[] = ['COUNTDOWN', 'LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL7', 'LEVEL8', 'LEVEL_GRADIENT', 'LEVEL_MEMORY', 'LEVEL_MIXING', 'LEVEL_SHADOW', 'SPECIAL', 'MASTER', 'FINAL'];
    if (playingStates.includes(gameState) && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked until user gesture
      });
    }
  }, [gameState]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pickNextLevel = useCallback(() => {
    setGameState('TRANSITION');
    setResult(null);
    
    setTimeout(() => {
      const isMasterTime = timeLeft <= 60 && timeLeft > 0;
      
      if (isMasterTime) {
        setGameState('MASTER');
        setDifficulty(5);
        setMessage('たつじんの領域へようこそ。');
        setLastLevel('MASTER');
        setLevelStartTime(Date.now());
        setLevelTimeLeft(60); 
        return;
      }

      let currentPool = [...levelPool];
      if (currentPool.length === 0) {
        const allLevels: GameState[] = [
          'LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL7', 'LEVEL8', 
          'LEVEL_GRADIENT', 'LEVEL_MEMORY', 'LEVEL_MIXING', 'LEVEL_SHADOW', 
          'SPECIAL', 'FINAL'
        ];
        currentPool = allLevels.sort(() => Math.random() - 0.5);
      }

      const nextLevel = currentPool.pop()!;
      setLevelPool(currentPool);
      setLastLevel(nextLevel);
      setGameState(nextLevel);
      setLevelStartTime(Date.now());
      setLevelTimeLeft(30);

      switch (nextLevel) {
        case 'LEVEL1':
          setDifficulty(1);
          setMessage('真実の黄色を選べ。');
          break;
        case 'LEVEL2':
          setDifficulty(1);
          setMessage('真実の黄色を10個集めろ。');
          break;
        case 'LEVEL3':
          setDifficulty(2);
          setMessage('黄色に関する知識を問う。');
          break;
        case 'LEVEL4':
          setDifficulty(2);
          setMessage('動く黄色を捕まえろ。');
          break;
        case 'LEVEL7':
          setDifficulty(3);
          setMessage('わずかに違う黄色を見つけろ。');
          break;
        case 'LEVEL8':
          setDifficulty(2);
          setMessage('本物の「YELLOW」を探せ。');
          break;
        case 'LEVEL_GRADIENT':
          setDifficulty(2);
          setMessage('グラデーションから真実の黄色を。');
          break;
        case 'LEVEL_MEMORY':
          setDifficulty(3);
          setMessage('真実の黄色の位置を覚えろ。');
          break;
        case 'LEVEL_MIXING':
          setDifficulty(3);
          setMessage('青成分を抜いて真実の黄色に。');
          break;
        case 'LEVEL_SHADOW':
          setDifficulty(3);
          setMessage('影の中に潜む真実の黄色を。');
          break;
        case 'SPECIAL':
          setDifficulty(4);
          setMessage('暗闇の中に潜む真実の黄色を。');
          break;
        case 'FINAL':
          setDifficulty(4);
          setMessage('究極の選択。真実の黄色はどれだ。');
          break;
      }
    }, 1000);
  }, [timeLeft, levelPool]);

  const handleAnswer = useCallback((
    isCorrect: boolean, 
    customScore: number | boolean = false, 
    levelName: string = '', 
    playerAnswer: string = '', 
    correctAnswer: string = ''
  ) => {
    const timeSpent = (Date.now() - levelStartTime) / 1000;
    let pointsAwarded = 0;
    if (typeof customScore === 'number') {
      pointsAwarded = customScore;
    } else if (isCorrect) {
      if (timeSpent <= 0.5) {
        pointsAwarded = 1000;
      } else {
        pointsAwarded = Math.max(100, 1000 - Math.floor((timeSpent - 0.5) * 100));
      }
    }

    let multiplier = difficulty;
    if (gameState === 'FINAL') multiplier *= 2;
    if (gameState === 'SPECIAL') multiplier *= 2;
    if (gameState === 'MASTER') multiplier *= 5;
    
    const finalPoints = Math.max(0, Math.round(pointsAwarded * multiplier));
    if (finalPoints > 0) setScore(s => s + finalPoints);

    // Add to history
    const newHistoryItem = {
      level: levelName || gameState,
      playerAnswer: playerAnswer || (isCorrect ? '正解' : '不正解'),
      correctAnswer: correctAnswer || '真実の黄色',
      isCorrect,
      score: finalPoints,
      time: timeSpent
    };
    setHistory(prev => [...prev, newHistoryItem]);

    if (isCorrect || typeof customScore === 'number') {
      setResult({ isCorrect: true, points: finalPoints });
      setGameState('RESULT');
    } else {
      if (gameState === 'MASTER') {
        setResult({ isCorrect: false, points: finalPoints, reason: "たつじんならば、真実を見抜くまで終われない。" });
        setTimeout(() => {
          setGameState('MASTER');
          setResult(null);
          setLevelStartTime(Date.now());
        }, 2000);
      } else {
        setResult({ isCorrect: false, points: finalPoints, reason: "真実の黄色は、もっと純粋なはずです。もっとハッピーなはずです。" });
        setGameState('RESULT');
      }
    }
  }, [levelStartTime, difficulty, gameState]);

  // --- Game Logic ---

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        pickNextLevel();
      }
    }
  }, [gameState, countdown, pickNextLevel]);

  useEffect(() => {
    let timer: number;
    const activeStates = ['LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL7', 'LEVEL8', 'LEVEL_GRADIENT', 'LEVEL_MEMORY', 'LEVEL_MIXING', 'LEVEL_SHADOW', 'SPECIAL', 'MASTER', 'FINAL'];
    
    if (activeStates.includes(gameState) && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setGameState('TIMEUP');
            return 0;
          }
          if (prev > 300 && next <= 300) {
            setGameState('WARNING');
          }
          return next;
        });

        setLevelTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            handleAnswer(false, false, false, "時間切れです。真実を追うにはスピードも必要です。");
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, handleAnswer]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(300);
    setGameState('WARNING');
    
    const allLevels: GameState[] = [
      'LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL7', 'LEVEL8', 
      'LEVEL_GRADIENT', 'LEVEL_MEMORY', 'LEVEL_MIXING', 'LEVEL_SHADOW', 
      'SPECIAL', 'FINAL'
    ];
    setLevelPool(allLevels.sort(() => Math.random() - 0.5));

    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = false;
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked until user gesture.
      });
    }
  };

  const resetGame = () => {
    setGameState('START');
    setScore(0);
    setTimeLeft(300);
    setMessage('');
    setLastLevel(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-screen font-sans transition-colors duration-500 ${gameState === 'WARNING' ? 'bg-emerald-900' : 'bg-stone-950'} text-stone-100 overflow-hidden flex flex-col select-none ${gameState === 'START' || isMobile ? '' : 'cursor-none'}`}>
      {/* Header */}
      <header className="p-3 sm:p-6 flex justify-between items-center border-b border-stone-800 bg-stone-950/80 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <Sun className="text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-xl font-black tracking-tighter uppercase text-yellow-500">Yellow Happy Jam Jam</h1>
            {isDeveloperMode && <span className="text-xs text-red-400 font-black">開発者モード</span>}
          </div>
        </div>

        {gameState !== 'START' && !isMobile && (
          <div className="flex items-center gap-2 bg-stone-900 px-4 py-1 rounded-full border border-stone-800">
            {volume > 0 ? <Volume2 className="w-4 h-4 text-yellow-500" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
            {gameState !== 'START' && (
              <div className="bg-stone-900 text-yellow-500 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-black flex items-center gap-1 sm:gap-2 border border-stone-800 shadow-lg">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                SCORE: {score}
              </div>
            )}
            {(gameState !== 'START' && gameState !== 'WARNING' && gameState !== 'COUNTDOWN' && gameState !== 'RESULT') && (
              <div className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-black border-2 shadow-lg ${timeLeft < 60 ? 'border-red-500 text-red-500 animate-pulse' : 'border-stone-700 text-stone-400'}`}>
                TIME: {formatTime(timeLeft)}
              </div>
            )}
            {isDeveloperMode && (
              <div className="bg-red-600 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-black border border-red-400">
                開発者モード
              </div>
            )}
          </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col justify-center items-center p-4 sm:p-8 relative">
        <CustomCursor isMobile={isMobile} />
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-4 sm:space-y-8 w-full max-w-4xl relative z-10 flex flex-col items-center justify-center h-full"
            >
              <StartBackground isMobile={isMobile} />
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                  className="absolute -inset-10 sm:-inset-20 border-[8px] sm:border-[14px] border-yellow-500/20 rounded-full blur-2xl"
                />
                <motion.h2 
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(250,204,21,0.3)",
                      "0 0 30px rgba(250,204,21,0.6)",
                      "0 0 10px rgba(250,204,21,0.3)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-4xl sm:text-8xl font-black leading-tight text-[#FACC15] italic tracking-tighter"
                >
                  YELLOW HAPPY<br />JAM JAM
                </motion.h2>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <motion.p 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="text-xs sm:text-xl font-black text-yellow-300 px-4 tracking-[0.1em] sm:tracking-[0.2em]"
                >
                  黄色のことしか頭にない、選ばれし者のための聖域
                </motion.p>
              </div>

              <div className="flex flex-col items-center gap-4 sm:gap-8 pt-4">
                <motion.button
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setGameState('TUTORIAL')}
                  className="group relative inline-flex items-center justify-center px-6 sm:px-20 py-4 sm:py-5 font-black text-lg sm:text-4xl transition-all duration-200 rounded-full focus:outline-none bg-yellow-500 text-stone-950 border-2 border-yellow-700 hover:border-yellow-300 hover:bg-yellow-400 active:scale-95 shadow-[0_15px_40px_rgba(234,179,8,0.4)]"
                >
                  黄色の世界へ
                </motion.button>

                <p className="text-stone-500 text-[10px] sm:text-base font-black tracking-widest animate-pulse">
                  - 5分間のスコアアタック -
                </p>
                <p className="text-stone-500 text-[10px] sm:text-base font-black tracking-widest animate-pulse">
                  作成者：jinn45_zundamochi
                </p>
                
                {highScore > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-1 rounded-full"
                  >
                    <p className="text-yellow-500 font-black text-[10px] sm:text-sm">
                      BEST RECORD: {highScore}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-center gap-2 px-4 pb-4">
                <div className="text-yellow-300 text-xs sm:text-sm font-black tracking-widest bg-black/30 px-3 py-1 rounded-full border border-yellow-500/40">
                  Ver 1.1.2
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setShowVersionInfo(true)}
                    className="bg-yellow-500 text-stone-950 px-3 py-1 rounded-full font-black text-[10px] sm:text-xs border-2 border-yellow-400 hover:bg-yellow-400 transition-all"
                  >
                    更新履歴
                  </button>
                  <button
                    onClick={() => setShowAdmin(true)}
                    className={`${isDeveloperMode ? 'ring-2 ring-red-500 bg-red-700 text-white border-red-400' : 'bg-yellow-500 text-stone-950'} px-3 py-1 rounded-full font-black text-[10px] sm:text-xs border-2 border-yellow-400 hover:bg-yellow-400 transition-all`}
                  >
                    管理者用
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'TUTORIAL' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8 bg-stone-900 p-12 rounded-[3rem] border-4 border-stone-800 w-full max-w-2xl"
            >
              <h2 className="text-3xl font-black text-yellow-500">問題等の説明を聞きますか？</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={() => setGameState('TUTORIAL_INFO')}
                  className="bg-yellow-500 text-stone-950 px-8 py-3 rounded-full font-black text-base sm:text-xl hover:scale-105 transition-transform whitespace-nowrap min-w-[120px]"
                >
                  はい
                </button>
                <button 
                  onClick={() => setGameState('WARNING')}
                  className="bg-stone-800 text-yellow-500 px-8 py-3 rounded-full font-black text-base sm:text-xl hover:scale-105 transition-transform whitespace-nowrap min-w-[120px]"
                >
                  いいえ
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'TUTORIAL_INFO' && <TutorialInfoScreen onComplete={() => setGameState('WARNING')} />}

          {gameState === 'WARNING' && <WarningScreen onComplete={() => setGameState('COUNTDOWN')} />}
          {gameState === 'COUNTDOWN' && <CountdownScreen count={countdown} />}
          {gameState === 'TRANSITION' && <TransitionScreen />}
                  {gameState === 'RESULT' && result && (
            <ResultScreen 
              isCorrect={result.isCorrect} 
              reason={result.reason} 
              points={result.points ?? 0}
              onComplete={pickNextLevel} 
            />
          )}

          {(gameState === 'LEVEL1' || gameState === 'LEVEL2' || gameState === 'LEVEL3' || gameState === 'LEVEL4' || gameState === 'LEVEL7' || gameState === 'LEVEL8' || gameState === 'LEVEL_GRADIENT' || gameState === 'LEVEL_MEMORY' || gameState === 'LEVEL_MIXING' || gameState === 'LEVEL_SHADOW' || gameState === 'FINAL' || gameState === 'SPECIAL' || gameState === 'MASTER') && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-stone-900 p-4 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-4 border-stone-800 w-full max-w-6xl overflow-y-auto max-h-[90vh] relative"
            >
              <div className="absolute top-4 right-10 flex items-center gap-2">
                <div className={`text-xl font-black ${levelTimeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                  {levelTimeLeft}s
                </div>
              </div>

              <div className="mb-4 sm:mb-8 text-center">
                <p className="text-yellow-500 font-black text-sm sm:text-xl tracking-tight">{message}</p>
              </div>

              {gameState === 'LEVEL1' && <Level1 onAnswer={handleAnswer} difficulty={difficulty} isDeveloperMode={isDeveloperMode} />}
              {gameState === 'LEVEL2' && <Level2 onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL3' && <Level3 onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL4' && <Level4 onAnswer={handleAnswer} difficulty={difficulty} isMobile={isMobile} />}
              {gameState === 'LEVEL7' && <Level7 onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL8' && <Level8 onAnswer={handleAnswer} difficulty={difficulty} isDeveloperMode={isDeveloperMode} />}
              {gameState === 'LEVEL_GRADIENT' && <Level_Gradient onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL_MEMORY' && <Level_Memory onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL_MIXING' && <Level_Mixing onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'LEVEL_SHADOW' && <Level_Shadow onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'FINAL' && <FinalLevel onAnswer={handleAnswer} difficulty={difficulty} />}
              {gameState === 'SPECIAL' && <SpecialLevel onAnswer={handleAnswer} difficulty={difficulty} isDeveloperMode={isDeveloperMode} />}
              {gameState === 'MASTER' && <MasterLevel onAnswer={handleAnswer} />}
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 sm:space-y-8 bg-stone-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-4 border-red-900/30 w-full max-w-lg"
            >
              <AlertCircle className="w-12 h-12 sm:w-24 sm:h-24 text-red-500 mx-auto" />
              <h2 className="text-3xl sm:text-5xl font-black text-red-500">GAME OVER</h2>
              <p className="text-stone-300 text-base sm:text-xl font-bold">{message}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="flex items-center gap-2 sm:gap-3 mx-auto bg-yellow-500 text-stone-950 px-6 sm:px-10 py-3 sm:py-5 rounded-full font-black text-sm sm:text-lg transition-all shadow-xl"
              >
                <RefreshCcw className="w-4 h-4 sm:w-6 sm:h-6" />
                もう一度挑戦する
              </motion.button>
            </motion.div>
          )}

          {(gameState === 'CLEAR' || gameState === 'TIMEUP') && (
            <FinalResultScreen 
              score={score} 
              onReview={() => setGameState('REVIEW')} 
              onExit={resetGame} 
            />
          )}

          {gameState === 'REVIEW' && (
            <ReviewScreen 
              history={history} 
              onBack={() => setGameState('CLEAR')} 
            />
          )}
        </AnimatePresence>
      </main>

      {showAdmin && <AdminWindow onClose={() => setShowAdmin(false)} onEnableDeveloperMode={() => setIsDeveloperMode(true)} />}
      {showVersionInfo && <VersionInfoWindow onClose={() => setShowVersionInfo(false)} />}

      {/* Footer */}
      <footer className="p-2 text-center text-[8px] sm:text-[10px] font-mono text-stone-700 tracking-widest shrink-0">
        © 2026 YELLOW HAPPY JAM JAM PROJECT
      </footer>
      <audio 
        ref={audioRef}
        src="/bgm.mp3"
        loop 
        preload="auto"
      />
    </div>
  );
}
