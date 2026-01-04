import React, { useState, useEffect } from 'react';
import { motion, useTransform, useMotionValueEvent, useMotionValue, animate, MotionValue } from 'framer-motion';
import { Zap, Footprints, Info, Activity, Gauge } from 'lucide-react';

// --- Constants ---
// Rigid constraints: The bones must not stretch.
const THIGH_LEN = 115; 
const CALF_LEN = 110;

// --- IK Solver (Mathematical Core) ---
const solveIK = (hx: number, hy: number, ax: number, ay: number, bendDir: number = -1) => {
  const dx = ax - hx;
  const dy = ay - hy;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist >= THIGH_LEN + CALF_LEN - 0.1) {
    const ratio = THIGH_LEN / (THIGH_LEN + CALF_LEN);
    return { x: hx + dx * ratio, y: hy + dy * ratio };
  }

  const a = (THIGH_LEN * THIGH_LEN - CALF_LEN * CALF_LEN + distSq) / (2 * dist);
  const h = Math.sqrt(Math.max(0, THIGH_LEN * THIGH_LEN - a * a));

  const x2 = hx + (dx * a) / dist;
  const y2 = hy + (dy * a) / dist;

  const kx = x2 + (h * dy * -bendDir) / dist;
  const ky = y2 - (h * dx * -bendDir) / dist;

  return { x: kx, y: ky };
};

const SpringLegVisualization: React.FC = () => {
  // 0: Idle, 1: Loading (Pressed), 2: Explosive (Feedback), 3: Recovery
  const [animState, setAnimState] = useState<0 | 1 | 2 | 3>(0);
  
  // We use a MotionValue directly so we can control the animation precisely.
  const phase = useMotionValue(0);

  useEffect(() => {
    if (animState === 1) {
      // 0 -> 1: Eccentric Loading
      animate(phase, 1, { type: "spring", stiffness: 120, damping: 18 });
    } else if (animState === 2) {
      // 1 -> 2: Concentric Explosion
      animate(phase, 2, { type: "spring", stiffness: 300, damping: 20 });
      
      const timer = setTimeout(() => {
        setAnimState(3);
      }, 300);
      return () => clearTimeout(timer);
    } else if (animState === 3) {
      // 2 -> 3: Recovery / Reset
      const controls = animate(phase, 3, { duration: 0.4, ease: "circOut" });
      
      controls.then(() => {
        phase.set(0);
        setAnimState(0);
      });
    }
  }, [animState, phase]);

  const handlePressStart = (e: React.PointerEvent) => {
    e.preventDefault();
    if (animState === 0 || animState === 3) {
       setAnimState(1); 
    }
  };

  const handlePressEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    if (animState === 1) {
      setAnimState(2); 
    }
  };

  // --- Keyframes ---
  const poses = {
    0: { // Idle
      hip:   { x: 110, y: 70 },
      ankle: { x: 115, y: 270 },
      toe:   { x: 160, y: 320 },
    },
    1: { // Loading
      hip:   { x: 70, y: 190 },
      ankle: { x: 80, y: 315 },
      toe:   { x: 160, y: 320 },
    },
    2: { // Explosive
      hip:   { x: 180, y: 30 },
      ankle: { x: 160, y: 250 },
      toe:   { x: 160, y: 320 },
    },
    3: { // Recovery
      hip:   { x: 110, y: 70 },
      ankle: { x: 115, y: 270 },
      toe:   { x: 160, y: 320 },
    }
  };

  // --- Reactive Transforms ---
  const useMix = (part: 'hip' | 'ankle' | 'toe', axis: 'x' | 'y') => 
    useTransform(phase, [0, 1, 2, 3], [poses[0][part][axis], poses[1][part][axis], poses[2][part][axis], poses[3][part][axis]]);

  const hipX = useMix('hip', 'x');
  const hipY = useMix('hip', 'y');
  const ankleX = useMix('ankle', 'x');
  const ankleY = useMix('ankle', 'y');
  const toeX = useMix('toe', 'x');
  const toeY = useMix('toe', 'y');

  // --- REAL-TIME IK SOLVER ---
  const kneeX = useTransform([hipX, hipY, ankleX, ankleY], ([hx, hy, ax, ay]: any[]) => solveIK(hx, hy, ax, ay, -1).x);
  const kneeY = useTransform([hipX, hipY, ankleX, ankleY], ([hx, hy, ax, ay]: any[]) => solveIK(hx, hy, ax, ay, -1).y);

  // --- Visual Path Generation ---
  const bonePath = useTransform(
    [hipX, hipY, kneeX, kneeY, ankleX, ankleY, toeX, toeY],
    ([hx, hy, kx, ky, ax, ay, tx, ty]: any[]) => 
      `M ${hx} ${hy} L ${kx} ${ky} L ${ax} ${ay} L ${tx} ${ty}`
  );

  const calfPath = useTransform(
    [kneeX, kneeY, ankleX, ankleY, phase],
    ([kx, ky, ax, ay, p]: any[]) => {
      let bulge = 28;
      const val = p as number;
      if (val <= 1) bulge = 28 - val * 12;
      else if (val <= 2) bulge = 16 + (val - 1) * 12;
      else bulge = 28;

      const ratio = 0.55; 
      const jx = kx + (ax - kx) * ratio;
      const jy = ky + (ay - ky) * ratio;
      const mx = (kx + jx) / 2 - bulge; 
      const my = (ky + jy) / 2;
      return `M ${kx} ${ky} Q ${mx} ${my} ${jx} ${jy} L ${jx} ${jy} Z`;
    }
  );

  const tendonPath = useTransform(
    [kneeX, kneeY, ankleX, ankleY, phase],
    ([kx, ky, ax, ay, p]: any[]) => {
      let offset = 5;
      const val = p as number;
      if (val <= 1) offset = 5 + val * 5;
      else if (val <= 2) offset = 10 - (val - 1) * 5;
      else offset = 5;

      const ratio = 0.55;
      const jx = kx + (ax - kx) * ratio;
      const jy = ky + (ay - ky) * ratio;
      const cx = (jx + ax) / 2 - offset; 
      const cy = (jy + ay) / 2;
      return `M ${jx} ${jy} Q ${cx} ${cy} ${ax} ${ay}`;
    }
  );

  // Colors & Widths
  const muscleFill = useTransform(phase, [0, 1, 2, 3], [
    'rgba(204, 255, 0, 0.2)', 
    'rgba(255, 77, 77, 0.4)', 
    'rgba(204, 255, 0, 0.2)', 
    'rgba(204, 255, 0, 0.2)'  
  ]);
  
  const muscleStroke = useTransform(phase, [0, 1, 2, 3], ['#888', '#ff4d4d', '#888', '#888']);
  const tendonColor = useTransform(phase, [0, 1, 2, 3], ['#aaa', '#ff4d4d', '#ccff00', '#aaa']);
  const tendonWidth = useTransform(phase, [0, 1, 2, 3], [4, 7, 4, 4]);

  return (
    <div className="w-full bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm relative flex flex-col md:flex-row shadow-2xl">
      
      {/* 1. Visualization Area */}
      <div className="flex-1 h-[550px] relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden select-none">
        
        <PhaseMonitorHUD phase={phase} animState={animState} />

        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        <div className="relative z-10 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 300 400" className="overflow-visible">
            {/* Floor */}
            <line x1="20" y1="320" x2="280" y2="320" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />

            {/* Calf Muscle */}
            <motion.path
              d={calfPath}
              fill={muscleFill}
              stroke={muscleStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Achilles Tendon */}
            <motion.path
              d={tendonPath}
              stroke={tendonColor}
              strokeWidth={tendonWidth}
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Bones */}
            <motion.path
              d={bonePath}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="pointer-events-none"
            />

            {/* Joint Nodes & HUD */}
            <JointHUD id="hip" x={hipX} y={hipY} label="髋部 HIP" targetX={260} targetY={60} align="start" activePhase={phase} />
            <JointHUD id="knee" x={kneeX} y={kneeY} label="膝盖 KNEE" targetX={260} targetY={160} align="start" activePhase={phase} />
            <JointHUD id="ankle" x={ankleX} y={ankleY} label="踝关节 ANKLE" targetX={30} targetY={280} align="end" activePhase={phase} />
            <JointHUD id="toe" x={toeX} y={toeY} label="脚趾 TOE" targetX={220} targetY={360} align="start" activePhase={phase} />
            
            {/* Dynamic Muscle Labels */}
            <DynamicHUD 
                label="腓肠肌 CALF" 
                targetX={30} targetY={120} align="end" 
                p1x={kneeX} p1y={kneeY} p2x={ankleX} p2y={ankleY} ratio={0.3} 
                activePhase={phase} 
            />
            <DynamicHUD 
                label="跟腱 ACHILLES" 
                targetX={30} targetY={200} align="end" 
                p1x={kneeX} p1y={kneeY} p2x={ankleX} p2y={ankleY} ratio={0.75} 
                activePhase={phase} 
                isHighlight
            />

          </svg>
        </div>
      </div>

      {/* 2. Control Panel */}
      <div className="w-full md:w-96 p-8 flex flex-col justify-between bg-gray-900">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 rounded-2xl border border-white/5">
              <Activity className="text-neon-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">IK Solver</h3>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Cycle_Engine_v7</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-black/50 p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-neon-400" />
                <h4 className="text-white text-[10px] font-black uppercase tracking-widest">使用说明</h4>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                长按下方按钮进行“蓄力”，松开进行“爆发”。
                <br/><br/>
                动力学流：<span className="text-white font-bold">静止 → 离心(蓄力) → 向心(爆发) → 复位</span>。
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
               <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                  <span>Current Phase</span>
                  <PhaseText phase={phase} />
               </div>
               <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                  <span>Tension Load</span>
                  <PhaseValue phase={phase} />
               </div>
            </div>
          </div>
        </div>

        <button
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          className={`
            w-full py-7 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all duration-300
            flex flex-col items-center justify-center gap-1 select-none touch-none
            ${animState === 1 
              ? 'bg-red-600 text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] scale-95' 
              : 'bg-neon-400 text-black hover:shadow-neon-strong hover:-translate-y-1'}
          `}
        >
          <div className="flex items-center gap-3">
            {animState === 1 ? <Zap size={20} className="animate-pulse"/> : <Footprints size={20} />}
            <span>{animState === 1 ? '蓄力中...' : '长按测试'}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const PhaseMonitorHUD = ({ phase, animState }: { phase: MotionValue<number>, animState: number }) => {
  const [colorClass, setColorClass] = useState("text-gray-500");
  const [stateText, setStateText] = useState("ISOMETRIC // 静止");
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    switch(animState) {
      case 0:
        setStateText("ISOMETRIC // 静止");
        setColorClass("text-gray-500");
        break;
      case 1:
        setStateText("ECCENTRIC // 离心蓄力");
        setColorClass("text-red-500");
        break;
      case 2:
        setStateText("CONCENTRIC // 向心爆发");
        setColorClass("text-neon-400");
        break;
      case 3:
        setStateText("RECOVERY // 复位");
        setColorClass("text-blue-400");
        break;
    }
  }, [animState]);

  useMotionValueEvent(phase, "change", (v) => {
    let w = 0;
    if (v <= 1) w = v * 100;
    else if (v <= 2) w = 100;
    else w = Math.max(0, 100 - (v - 2) * 100);
    setBarWidth(Math.max(0, Math.min(100, w)));
  });

  return (
    <div className="absolute top-6 left-6 z-20 pointer-events-none select-none">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={14} className={colorClass} />
          <span className={`text-[10px] font-mono font-bold tracking-widest ${colorClass} opacity-80`}>
             PHASE MONITOR
          </span>
        </div>
        
        <h2 className={`text-4xl font-black italic tracking-tighter ${colorClass} transition-colors duration-200`}>
           {stateText.split(' // ')[0]}
        </h2>
        <span className={`text-xs font-bold tracking-widest uppercase ${colorClass} opacity-60 pl-1`}>
           {stateText.split(' // ')[1]}
        </span>

        <div className="mt-3 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
           <div 
             className={`h-full transition-all duration-75 ease-linear ${colorClass.replace('text-', 'bg-')}`} 
             style={{ width: `${barWidth}%` }}
           />
        </div>
      </div>
    </div>
  )
}

const PhaseText = ({ phase }: { phase: MotionValue<number> }) => {
  const t = useTransform(phase, 
    [0, 0.9, 1.1, 2.5, 3], 
    ["IDLE", "MAX LOAD", "FIRING", "RECOVERY", "RESET"]
  );
  return <motion.span className="text-white font-bold">{t}</motion.span>
}

const PhaseValue = ({ phase }: { phase: MotionValue<number> }) => {
  const v = useTransform(phase, (val) => {
    if(val <= 1) return `${(val * 100).toFixed(0)}%`;
    if(val <= 2) return `100%`;
    return `${Math.max(0, (3 - val) * 100).toFixed(0)}%`;
  });
  return <motion.span className="text-neon-400 font-mono">{v}</motion.span>
}

// --- Sub-component: Joint HUD ---
const JointHUD = ({ id, x, y, label, targetX, targetY, align, activePhase }: any) => {
    const color = useTransform(activePhase, [0, 1, 2], ['#ccff00', '#ff4d4d', '#ccff00']);
    const boxStroke = useTransform(activePhase, [0, 1, 2], ['rgba(255,255,255,0.1)', '#ff4d4d', 'rgba(255,255,255,0.1)']);
    const boxWidth = 110;
    const boxX = align === 'end' ? targetX - boxWidth : align === 'middle' ? targetX - (boxWidth/2) : targetX;
    
    const lineD = useTransform([x, y], ([cx, cy]: any[]) => `M ${cx} ${cy} L ${targetX} ${targetY}`);

    return (
        <g>
            <motion.path d={lineD} stroke={color} strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity={0.5} />
            <motion.rect x={boxX} y={targetY - 12} width={boxWidth} height="24" fill="rgba(0,0,0,0.9)" stroke={boxStroke} rx="4" />
            <motion.text 
                x={targetX + (align === 'start' ? 8 : align === 'end' ? -8 : 0)} 
                y={targetY} 
                textAnchor={align} 
                dominantBaseline="middle" 
                fill={color} 
                className="text-[10px] font-mono font-bold italic tracking-tighter"
            >
                {label}
            </motion.text>
            <motion.circle cx={x} cy={y} r="5" fill="#000" stroke={color} strokeWidth="2" />
        </g>
    )
}

// --- Sub-component: Dynamic Muscle HUD ---
const DynamicHUD = ({ label, targetX, targetY, align, p1x, p1y, p2x, p2y, ratio, activePhase, isHighlight }: any) => {
    const sourceX = useTransform([p1x, p2x], ([x1, x2]: any[]) => (x1 as number) + ((x2 as number) - (x1 as number)) * ratio);
    const sourceY = useTransform([p1y, p2y], ([y1, y2]: any[]) => (y1 as number) + ((y2 as number) - (y1 as number)) * ratio);
    
    const color = useTransform(activePhase, [0, 1, 2], [isHighlight ? '#aaa' : '#ccff00', '#ff4d4d', '#ccff00']);
    const boxStroke = useTransform(activePhase, [0, 1, 2], ['rgba(255,255,255,0.1)', '#ff4d4d', 'rgba(255,255,255,0.1)']);
    const boxWidth = 110;
    const boxX = align === 'end' ? targetX - boxWidth : align === 'middle' ? targetX - (boxWidth/2) : targetX;
    
    const lineD = useTransform([sourceX, sourceY], ([sx, sy]: any[]) => `M ${sx} ${sy} L ${targetX} ${targetY}`);

    return (
        <g>
            <motion.path d={lineD} stroke={color} strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity={0.5} />
            <motion.rect x={boxX} y={targetY - 12} width={boxWidth} height="24" fill="rgba(0,0,0,0.9)" stroke={boxStroke} rx="4" />
            <motion.text 
                x={targetX + (align === 'start' ? 8 : align === 'end' ? -8 : 0)} 
                y={targetY} 
                textAnchor={align} 
                dominantBaseline="middle" 
                fill={color} 
                className="text-[10px] font-mono font-bold italic tracking-tighter"
            >
                {label}
            </motion.text>
        </g>
    )
}

export default SpringLegVisualization;