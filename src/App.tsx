/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'katex/dist/katex.min.css';
import {
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  Copy,
  Info,
  Moon,
  RotateCcw,
  Sun,
  Triangle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

// --- Types ---

type Side = 'a' | 'b' | 'c';
type TrigFunction = 'sin' | 'cos' | 'tan';

interface CalculationStep {
  text: string;
  math?: string;
}

// --- Components ---

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-sm bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-center"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TriangleVisualizer = ({ a, b, c, angleA }: { a: number; b: number; c: number; angleA?: number }) => {
  // Scale factor to fit in 200x200
  const maxSide = Math.max(a, b, isNaN(c) ? 0 : c) || 1;
  const scale = 150 / maxSide;

  const width = b * scale;
  const height = a * scale;

  // Padding
  const pad = 25;

  const pathData = `M ${pad} ${200 - pad} L ${pad + width} ${200 - pad} L ${pad} ${200 - pad - height} Z`;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 h-full min-h-[300px]">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Visualización</h3>
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-xl">
        {/* Triangle */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500 dark:text-blue-400"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            d: pathData,
            pathLength: 1,
            opacity: 1
          }}
          transition={{
            d: { type: "spring", stiffness: 100, damping: 20 },
            pathLength: { duration: 1.5, ease: "easeInOut" },
            opacity: { duration: 0.5 }
          }}
        />

        {/* Right angle square */}
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          x={pad}
          y={200 - pad - 15}
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-400"
        />

        {/* Labels with animation */}
        <motion.text
          animate={{ x: pad + width / 2, y: 200 - pad + 18 }}
          textAnchor="middle"
          className="text-[10px] fill-slate-500 font-mono"
        >
          b = {b.toFixed(1)}
        </motion.text>
        <motion.text
          animate={{ x: pad - 18, y: 200 - pad - height / 2 }}
          textAnchor="middle"
          transform={`rotate(-90, ${pad - 18}, ${200 - pad - height / 2})`}
          className="text-[10px] fill-slate-500 font-mono"
        >
          a = {a.toFixed(1)}
        </motion.text>
        <motion.text
          animate={{ x: pad + width / 2 + 10, y: 200 - pad - height / 2 - 10 }}
          textAnchor="middle"
          className="text-[10px] fill-slate-500 font-mono"
        >
          c = {c.toFixed(1)}
        </motion.text>

        {angleA !== undefined && (
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x={pad + width - 25}
            y={200 - pad - 5}
            className="text-[10px] fill-blue-600 font-bold"
          >
            α = {angleA.toFixed(1)}°
          </motion.text>
        )}
      </svg>
      <div className="mt-6 grid grid-cols-3 gap-4 w-full text-center">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Cateto a</p>
          <p className="font-mono font-bold text-slate-700 dark:text-slate-200">{a.toFixed(2)}</p>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Cateto b</p>
          <p className="font-mono font-bold text-slate-700 dark:text-slate-200">{b.toFixed(2)}</p>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Hipotenusa c</p>
          <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{c.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'pythagoras' | 'trig'>('pythagoras');
  const [darkMode, setDarkMode] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pythagoras State
  const [pythA, setPythA] = useState<string>('');
  const [pythB, setPythB] = useState<string>('');
  const [pythC, setPythC] = useState<string>('');
  const [pythResult, setPythResult] = useState<{ val: number; steps: CalculationStep[] } | null>(null);

  // Trig State
  const [trigAngle, setTrigAngle] = useState<string>('');
  const [trigSideType, setTrigSideType] = useState<Side>('c');
  const [trigSideVal, setTrigSideVal] = useState<string>('');
  const [trigResult, setTrigResult] = useState<{
    a: number; b: number; c: number;
    sin: number; cos: number; tan: number;
    steps: CalculationStep[]
  } | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCopy = () => {
    const text = activeTab === 'pythagoras'
      ? pythResult?.steps.map(s => `${s.text} ${s.math || ''}`).join('\n')
      : trigResult?.steps.map(s => `${s.text} ${s.math || ''}`).join('\n');

    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculatePythagoras = () => {
    const a = parseFloat(pythA);
    const b = parseFloat(pythB);
    const c = parseFloat(pythC);

    const steps: CalculationStep[] = [];
    let result = 0;

    if (!isNaN(a) && !isNaN(b)) {
      // Find c
      result = Math.sqrt(a * a + b * b);
      steps.push({ text: "Identificamos los catetos:", math: `a = ${a}, b = ${b}` });
      steps.push({ text: "Usamos la fórmula:", math: "c = \\sqrt{a^2 + b^2}" });
      steps.push({ text: "Sustituimos valores:", math: `c = \\sqrt{${a}^2 + ${b}^2}` });
      steps.push({ text: "Calculamos cuadrados:", math: `c = \\sqrt{${(a * a).toFixed(2)} + ${(b * b).toFixed(2)}}` });
      steps.push({ text: "Sumamos:", math: `c = \\sqrt{${(a * a + b * b).toFixed(2)}}` });
      steps.push({ text: "Resultado final:", math: `c \\approx ${result.toFixed(4)}` });
      setPythResult({ val: result, steps });
    } else if (!isNaN(a) && !isNaN(c)) {
      // Find b
      if (c <= a) return alert("La hipotenusa debe ser mayor que el cateto.");
      result = Math.sqrt(c * c - a * a);
      steps.push({ text: "Identificamos los lados:", math: `a = ${a}, c = ${c}` });
      steps.push({ text: "Despejamos b de la fórmula:", math: "b = \\sqrt{c^2 - a^2}" });
      steps.push({ text: "Sustituimos valores:", math: `b = \\sqrt{${c}^2 - ${a}^2}` });
      steps.push({ text: "Resultado final:", math: `b \\approx ${result.toFixed(4)}` });
      setPythResult({ val: result, steps });
    } else if (!isNaN(b) && !isNaN(c)) {
      // Find a
      if (c <= b) return alert("La hipotenusa debe ser mayor que el cateto.");
      result = Math.sqrt(c * c - b * b);
      steps.push({ text: "Identificamos los lados:", math: `b = ${b}, c = ${c}` });
      steps.push({ text: "Despejamos a de la fórmula:", math: "a = \\sqrt{c^2 - b^2}" });
      steps.push({ text: "Sustituimos valores:", math: `a = \\sqrt{${c}^2 - ${b}^2}` });
      steps.push({ text: "Resultado final:", math: `a \\approx ${result.toFixed(4)}` });
      setPythResult({ val: result, steps });
    }
  };

  const calculateTrig = () => {
    const angleDeg = parseFloat(trigAngle);
    const sideVal = parseFloat(trigSideVal);

    if (isNaN(angleDeg) || isNaN(sideVal)) return;
    if (angleDeg <= 0 || angleDeg >= 90) return alert("El ángulo debe estar entre 0° y 90°.");

    const angleRad = (angleDeg * Math.PI) / 180;
    const steps: CalculationStep[] = [];
    let a = 0, b = 0, c = 0;

    if (trigSideType === 'c') {
      c = sideVal;
      a = c * Math.sin(angleRad);
      b = c * Math.cos(angleRad);
      steps.push({ text: "Dado Hipotenusa (c) y ángulo (α):", math: `c = ${c}, \\alpha = ${angleDeg}^\\circ` });
      steps.push({ text: "Calculamos cateto opuesto (a):", math: `a = c \\cdot \\sin(\\alpha) = ${c} \\cdot \\sin(${angleDeg}^\\circ) \\approx ${a.toFixed(4)}` });
      steps.push({ text: "Calculamos cateto adyacente (b):", math: `b = c \\cdot \\cos(\\alpha) = ${c} \\cdot \\cos(${angleDeg}^\\circ) \\approx ${b.toFixed(4)}` });
    } else if (trigSideType === 'a') {
      a = sideVal;
      c = a / Math.sin(angleRad);
      b = a / Math.tan(angleRad);
      steps.push({ text: "Dado Cateto Opuesto (a) y ángulo (α):", math: `a = ${a}, \\alpha = ${angleDeg}^\\circ` });
      steps.push({ text: "Calculamos hipotenusa (c):", math: `c = a / \\sin(\\alpha) = ${a} / \\sin(${angleDeg}^\\circ) \\approx ${c.toFixed(4)}` });
      steps.push({ text: "Calculamos cateto adyacente (b):", math: `b = a / \\tan(\\alpha) = ${a} / \\tan(${angleDeg}^\\circ) \\approx ${b.toFixed(4)}` });
    } else {
      b = sideVal;
      c = b / Math.cos(angleRad);
      a = b * Math.tan(angleRad);
      steps.push({ text: "Dado Cateto Adyacente (b) y ángulo (α):", math: `b = ${b}, \\alpha = ${angleDeg}^\\circ` });
      steps.push({ text: "Calculamos hipotenusa (c):", math: `c = b / \\cos(\\alpha) = ${b} / \\cos(${angleDeg}^\\circ) \\approx ${c.toFixed(4)}` });
      steps.push({ text: "Calculamos cateto opuesto (a):", math: `a = b \\cdot \\tan(\\alpha) = ${b} \\cdot \\tan(${angleDeg}^\\circ) \\approx ${a.toFixed(4)}` });
    }

    setTrigResult({
      a, b, c,
      sin: Math.sin(angleRad),
      cos: Math.cos(angleRad),
      tan: Math.tan(angleRad),
      steps
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Triangle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GeoMaster</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReview(true)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Tabs --- */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('pythagoras')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'pythagoras' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Calculator className="w-4 h-4" />
            Pitágoras
          </button>
          <button
            onClick={() => setActiveTab('trig')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'trig' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <RotateCcw className="w-4 h-4" />
            Trigonometría
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Input Section --- */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                {activeTab === 'pythagoras' ? 'Calculadora de Pitágoras' : 'Razones Trigonométricas'}
                <Tooltip text={activeTab === 'pythagoras' ? "Ingresa 2 valores para hallar el tercero." : "Ingresa un ángulo y un lado."}>
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </Tooltip>
              </h2>

              {activeTab === 'pythagoras' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Cateto a</label>
                    <input
                      type="number"
                      value={pythA}
                      onChange={(e) => setPythA(e.target.value)}
                      placeholder="Valor de a"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Cateto b</label>
                    <input
                      type="number"
                      value={pythB}
                      onChange={(e) => setPythB(e.target.value)}
                      placeholder="Valor de b"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Hipotenusa c</label>
                    <input
                      type="number"
                      value={pythC}
                      onChange={(e) => setPythC(e.target.value)}
                      placeholder="Valor de c"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={calculatePythagoras}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                  >
                    Calcular
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Ángulo α (Grados)</label>
                    <input
                      type="number"
                      value={trigAngle}
                      onChange={(e) => setTrigAngle(e.target.value)}
                      placeholder="Ej: 30"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Lado conocido</label>
                      <select
                        value={trigSideType}
                        onChange={(e) => setTrigSideType(e.target.value as Side)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                      >
                        <option value="c">Hipotenusa (c)</option>
                        <option value="a">Cateto Opuesto (a)</option>
                        <option value="b">Cateto Adyacente (b)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Valor</label>
                      <input
                        type="number"
                        value={trigSideVal}
                        onChange={(e) => setTrigSideVal(e.target.value)}
                        placeholder="Valor"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={calculateTrig}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group"
                  >
                    Calcular
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* --- Results Summary --- */}
            {(pythResult || trigResult) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-600 dark:bg-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">Resultado</h3>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {activeTab === 'pythagoras' ? (
                  <div className="text-3xl font-mono font-bold">
                    {pythResult?.val.toFixed(4)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Seno (sin α)</span>
                      <span className="font-mono font-bold">{trigResult?.sin.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Coseno (cos α)</span>
                      <span className="font-mono font-bold">{trigResult?.cos.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Tangente (tan α)</span>
                      <span className="font-mono font-bold">{trigResult?.tan.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* --- Visualization & Steps --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TriangleVisualizer
                a={activeTab === 'pythagoras' ? (parseFloat(pythA) || 0) : (trigResult?.a || 0)}
                b={activeTab === 'pythagoras' ? (parseFloat(pythB) || 0) : (trigResult?.b || 0)}
                c={activeTab === 'pythagoras' ? (pythResult?.val || parseFloat(pythC) || 0) : (trigResult?.c || 0)}
                angleA={activeTab === 'trig' ? parseFloat(trigAngle) : undefined}
              />

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Procedimiento Paso a Paso</h3>
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  {(activeTab === 'pythagoras' ? pythResult?.steps : trigResult?.steps)?.map((step, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 pb-2"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{step.text}</p>
                      {step.math && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl inline-block">
                          <InlineMath math={step.math} />
                        </div>
                      )}
                    </motion.div>
                  )) || (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-8">
                        <Calculator className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Ingresa los datos y presiona calcular para ver el procedimiento detallado.</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Review Modal --- */}
      <AnimatePresence>
        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReview(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Repaso de Geometría
                </h2>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-3">1. El Triángulo Rectángulo</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Es aquel que tiene un ángulo de 90° (ángulo recto). Sus lados tienen nombres especiales:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">Catetos</span>
                        Los dos lados que forman el ángulo recto.
                      </li>
                      <li className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <span className="font-bold text-blue-600 block mb-1">Hipotenusa</span>
                        El lado más largo, opuesto al ángulo recto.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-3">2. Teorema de Pitágoras</h3>
                    <div className="bg-slate-900 text-white p-6 rounded-2xl mb-4">
                      <BlockMath math="a^2 + b^2 = c^2" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">"En todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos."</p>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-3">3. Razones Trigonométricas (SOH-CAH-TOA)</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Mnemotecnia para recordar las fórmulas básicas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="font-black text-2xl text-blue-600 block mb-2">SOH</span>
                        <InlineMath math="\sin(\alpha) = \frac{Opuesto}{Hipotenusa}" />
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="font-black text-2xl text-indigo-600 block mb-2">CAH</span>
                        <InlineMath math="\cos(\alpha) = \frac{Adyacente}{Hipotenusa}" />
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="font-black text-2xl text-purple-600 block mb-2">TOA</span>
                        <InlineMath math="\tan(\alpha) = \frac{Opuesto}{Adyacente}" />
                      </div>
                    </div>
                  </section>
                </div>

                <button
                  onClick={() => setShowReview(false)}
                  className="mt-8 w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
