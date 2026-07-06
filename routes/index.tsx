import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ValentinesCalculator,
});

type Op = "+" | "-" | "×" | "÷";

const KEYS: { label: string; type: "num" | "op" | "fn" | "eq"; value?: string }[] = [
  { label: "AC", type: "fn" },
  { label: "±", type: "fn" },
  { label: "%", type: "fn" },
  { label: "÷", type: "op" },
  { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" }, { label: "×", type: "op" },
  { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" }, { label: "-", type: "op" },
  { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" }, { label: "+", type: "op" },
  { label: "0", type: "num" }, { label: ".", type: "num" }, { label: "♥", type: "fn" }, { label: "=", type: "eq" },
];

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 10,
        size: 14 + Math.random() * 30,
        opacity: 0.25 + Math.random() * 0.45,
        drift: (Math.random() - 0.5) * 120,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: "110vh", x: 0, rotate: -20, opacity: 0 }}
          animate={{
            y: "-20vh",
            x: [0, h.drift, -h.drift, 0],
            rotate: [-20, 20, -10, 15],
            opacity: [0, h.opacity, h.opacity, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ left: `${h.left}%`, position: "absolute" }}
        >
          <Heart
            className="text-love fill-love"
            style={{ width: h.size, height: h.size, filter: "drop-shadow(0 4px 12px oklch(0.62 0.26 15 / 0.4))" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function BurstHearts({ trigger }: { trigger: number }) {
  if (!trigger) return null;
  return (
    <AnimatePresence>
      <div key={trigger} className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const dist = 120 + Math.random() * 80;
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                opacity: 0,
                scale: 1.4,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute"
            >
              <Heart className="w-6 h-6 text-love fill-love" />
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}

function ValentinesCalculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [burst, setBurst] = useState(0);

  const compute = (a: number, b: number, o: Op): number => {
    switch (o) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
    }
  };

  const format = (n: number) => {
    if (!isFinite(n)) return "∞";
    const s = Number(n.toPrecision(12)).toString();
    return s.length > 12 ? Number(n).toExponential(6) : s;
  };

  const handle = (k: (typeof KEYS)[number]) => {
    const { label, type } = k;

    if (type === "num") {
      if (label === ".") {
        if (waiting) { setDisplay("0."); setWaiting(false); return; }
        if (!display.includes(".")) setDisplay(display + ".");
        return;
      }
      if (waiting || display === "0") { setDisplay(label); setWaiting(false); }
      else setDisplay(display + label);
      return;
    }

    if (type === "fn") {
      if (label === "AC") { setDisplay("0"); setPrev(null); setOp(null); setWaiting(false); return; }
      if (label === "±") { setDisplay(format(-parseFloat(display))); return; }
      if (label === "%") { setDisplay(format(parseFloat(display) / 100)); return; }
      if (label === "♥") { setBurst(Date.now()); return; }
    }

    if (type === "op") {
      const current = parseFloat(display);
      if (prev !== null && op && !waiting) {
        const result = compute(prev, current, op);
        setDisplay(format(result));
        setPrev(result);
      } else {
        setPrev(current);
      }
      setOp(label as Op);
      setWaiting(true);
      return;
    }

    if (type === "eq") {
      if (prev !== null && op) {
        const result = compute(prev, parseFloat(display), op);
        setDisplay(format(result));
        setPrev(null); setOp(null); setWaiting(true);
        setBurst(Date.now());
      }
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-2"
          >
            <Heart className="w-10 h-10 text-love fill-love mx-auto drop-shadow-lg" />
          </motion.div>
          <h1 className="font-display text-4xl font-black text-gradient-love leading-tight">
            Valentine's<br />Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 italic">math, with a little love ♥</p>
        </div>

        <motion.div
          whileHover={{ y: -4 }}
          className="relative rounded-3xl bg-card/80 backdrop-blur-xl border border-love/20 shadow-love p-5"
        >
          <BurstHearts trigger={burst} />

          {/* Display */}
          <div className="relative rounded-2xl bg-gradient-love p-5 mb-4 overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-20">
              <Heart className="w-24 h-24 text-white fill-white" />
            </div>
            <div className="text-right text-white/70 text-xs h-4 font-medium">
              {prev !== null ? `${format(prev)} ${op ?? ""}` : "\u00A0"}
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={display}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-right font-display font-black text-white text-5xl truncate"
              >
                {display}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Keys */}
          <div className="grid grid-cols-4 gap-3">
            {KEYS.map((k, i) => {
              const isOp = k.type === "op";
              const isEq = k.type === "eq";
              const isFn = k.type === "fn";
              const isHeart = k.label === "♥";
              return (
                <motion.button
                  key={k.label + i}
                  onClick={() => handle(k)}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={[
                    "h-14 rounded-2xl font-semibold text-lg shadow-key select-none",
                    "flex items-center justify-center transition-colors",
                    isEq && "bg-gradient-love text-white",
                    isOp && "bg-accent text-accent-foreground",
                    isFn && !isHeart && "bg-blush text-love-deep",
                    isHeart && "bg-love text-white",
                    k.type === "num" && "bg-white text-foreground hover:bg-blush",
                  ].filter(Boolean).join(" ")}
                >
                  {isHeart ? <Heart className="w-5 h-5 fill-white" /> : k.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Tap ♥ to send a burst of love
        </p>
      </motion.div>
    </main>
  );
}
