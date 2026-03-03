"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Input, Textarea } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type CafeGuest = {
  id: string;
  name: string;
  building: string;
  drink: string;
  createdAt: string;
};

type DrinkOption = {
  key: string;
  label: string;
  emoji: string;
};

const STORAGE_KEY = "night-cafe-posts";

const DRINKS: DrinkOption[] = [
  { key: "matcha", label: "matcha latte", emoji: "🍵" },
  { key: "earl_grey", label: "earl grey", emoji: "🫖" },
  { key: "americano", label: "americano", emoji: "☕" },
  { key: "hot_chocolate", label: "hot chocolate", emoji: "🍫" },
  { key: "chamomile", label: "chamomile tea", emoji: "🌼" },
  { key: "sparkling", label: "sparkling water", emoji: "💧" },
];

const WORK_EXAMPLES = [
  "ex: rewriting my about page tonight",
  "ex: designing a better signup flow",
  "ex: shipping the first version of my app",
  "ex: polishing a deck for tomorrow",
  "ex: sketching ideas for a new product",
  "ex: fixing bugs before launch day",
];

function trimWorkText(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.split(" ").filter(Boolean);
  if (words.length <= 7) return clean;
  return `${words.slice(0, 7).join(" ")}...`;
}

function randomIndex(length: number, previous = -1) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (next === previous) {
    next = (next + 1) % length;
  }
  return next;
}

export default function Home() {
  const [scene, setScene] = useState<"outside" | "inside">("outside");
  const [doorPhase, setDoorPhase] = useState<"idle" | "opening" | "closing">("idle");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isApproachingDoor, setIsApproachingDoor] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const [guests, setGuests] = useState<CafeGuest[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [selectedDrinkKey, setSelectedDrinkKey] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeOrbSlot, setActiveOrbSlot] = useState<number | null>(null);
  const [pinnedOrbSlot, setPinnedOrbSlot] = useState<number | null>(null);
  const [snapshotOffset, setSnapshotOffset] = useState(0);
  const [orbOffset, setOrbOffset] = useState(0);
  const [typedA, setTypedA] = useState(0);
  const [typedB, setTypedB] = useState(0);
  const [typedC, setTypedC] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [workPlaceholder, setWorkPlaceholder] = useState(WORK_EXAMPLES[0]);

  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setGuests(saved ? JSON.parse(saved) : []);
      } catch {
        setGuests([]);
      }
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  }, [guests, hasHydrated]);

  useEffect(() => {
    const nowTimer = window.setTimeout(() => setNow(new Date()), 0);
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => {
      window.clearTimeout(nowTimer);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      setSnapshotOffset(Math.floor(Math.random() * 1000));
      setOrbOffset(Math.floor(Math.random() * 1000));
      setWorkPlaceholder((prev) => {
        const prevIndex = WORK_EXAMPLES.indexOf(prev);
        return WORK_EXAMPLES[randomIndex(WORK_EXAMPLES.length, prevIndex)];
      });
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  const localTime = useMemo(
    () => {
      if (!now) return "--:--";
      return new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "2-digit",
      }).format(now);
    },
    [now],
  );

  const selectedDrink = useMemo(() => {
    return DRINKS.find((drink) => drink.key === selectedDrinkKey) ?? null;
  }, [selectedDrinkKey]);
  const nightWorks = useMemo(() => {
    if (guests.length === 0) return [];
    const ordered = Array.from({ length: guests.length }, (_, i) => guests[(i + snapshotOffset) % guests.length]);
    return ordered.slice(0, 3).map((guest) => trimWorkText(guest.building));
  }, [guests, snapshotOffset]);
  const orbGuests = useMemo(() => {
    if (guests.length === 0) return [];
    const ordered = Array.from({ length: guests.length }, (_, i) => guests[(i + orbOffset) % guests.length]);
    return ordered.slice(0, 6);
  }, [guests, orbOffset]);
  const hasManyGuests = guests.length >= 3;

  const refreshCafeSnapshot = () => {
    setSnapshotOffset(Math.floor(Math.random() * 1000));
    setOrbOffset(Math.floor(Math.random() * 1000));
    setWorkPlaceholder((prev) => {
      const prevIndex = WORK_EXAMPLES.indexOf(prev);
      return WORK_EXAMPLES[randomIndex(WORK_EXAMPLES.length, prevIndex)];
    });
  };

  useEffect(() => {
    const first = nightWorks[0] ?? "";
    const second = nightWorks[1] ?? "";
    const third = nightWorks[2] ?? "";

    let aTimer: number | null = null;
    let bTimer: number | null = null;
    let cTimer: number | null = null;
    let bStarter: number | null = null;
    let cStarter: number | null = null;
    const resetStarter = window.setTimeout(() => {
      setTypedA(0);
      setTypedB(0);
      setTypedC(0);

      if (first) {
        aTimer = window.setInterval(() => {
          setTypedA((prev) => {
            const next = prev + 1;
            if (next >= first.length && aTimer) window.clearInterval(aTimer);
            return Math.min(next, first.length);
          });
        }, 22);
      }

      if (second) {
        bStarter = window.setTimeout(() => {
          bTimer = window.setInterval(() => {
            setTypedB((prev) => {
              const next = prev + 1;
              if (next >= second.length && bTimer) window.clearInterval(bTimer);
              return Math.min(next, second.length);
            });
          }, 22);
        }, Math.max(220, first.length * 22 + 80));
      }

      if (third) {
        cStarter = window.setTimeout(() => {
          cTimer = window.setInterval(() => {
            setTypedC((prev) => {
              const next = prev + 1;
              if (next >= third.length && cTimer) window.clearInterval(cTimer);
              return Math.min(next, third.length);
            });
          }, 22);
        }, Math.max(420, (first.length + second.length) * 22 + 160));
      }
    }, 0);

    return () => {
      window.clearTimeout(resetStarter);
      if (aTimer) window.clearInterval(aTimer);
      if (bTimer) window.clearInterval(bTimer);
      if (cTimer) window.clearInterval(cTimer);
      if (bStarter) window.clearTimeout(bStarter);
      if (cStarter) window.clearTimeout(cStarter);
    };
  }, [nightWorks]);

  const enterCafe = () => {
    refreshCafeSnapshot();
    setDoorPhase("opening");
    setIsApproachingDoor(true);

    window.setTimeout(() => {
      setIsTransitioning(true);
    }, 1320);

    window.setTimeout(() => {
      setScene("inside");
      setShowWelcome(false);
      setDoorPhase("idle");
      setIsApproachingDoor(false);

      window.setTimeout(() => {
        setShowWelcome(true);
      }, 340);
    }, 2060);

    window.setTimeout(() => {
      setIsTransitioning(false);
    }, 2460);
  };

  const exitCafe = () => {
    setDoorPhase("closing");
    setIsTransitioning(true);

    window.setTimeout(() => {
      setScene("outside");
      setDoorPhase("idle");
    }, 1250);

    window.setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  const handleCheckIn = () => {
    setSubmitAttempted(true);
    if (!name.trim() || !selectedDrink || !building.trim()) return;

    const nextGuest: CafeGuest = {
      id: crypto.randomUUID(),
      name: name.trim(),
      building: building.trim(),
      drink: `${selectedDrink.emoji} ${selectedDrink.label}`,
      createdAt: new Date().toISOString(),
    };

    setGuests((prev) => [nextGuest, ...prev]);
    setBuilding("");
    setSubmitAttempted(false);
    setShowWelcome(false);
  };
  const missingName = submitAttempted && !name.trim();
  const missingDrink = submitAttempted && !selectedDrinkKey;
  const missingWork = submitAttempted && !building.trim();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {scene === "outside" ? (
          <motion.section
            key="outside"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_16%_14%,_#314a7f_0%,_#1a2747_40%,_#101a35_72%,_#090f21_100%)] text-white"
          >
            <div className="absolute left-8 top-8 h-14 w-14 rounded-full bg-slate-100/85 blur-[1px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(160,188,255,0.12),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(255,212,162,0.09),transparent_34%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[26vh] bg-gradient-to-t from-black/55 to-transparent" />
            <div className="pointer-events-none absolute inset-0">
              {[
                { left: "9%", top: "17%", size: "h-3 w-3", delay: 0, dur: 9.5, dx: 220, dy: -70, color: "bg-amber-200/95" },
                { left: "15%", top: "34%", size: "h-2 w-2", delay: 0.4, dur: 8.8, dx: -180, dy: 55, color: "bg-sky-100/90" },
                { left: "24%", top: "22%", size: "h-3.5 w-3.5", delay: 0.8, dur: 10.2, dx: 240, dy: 80, color: "bg-amber-100/90" },
                { left: "31%", top: "41%", size: "h-2.5 w-2.5", delay: 0.2, dur: 8.9, dx: -210, dy: -65, color: "bg-rose-100/85" },
                { left: "44%", top: "15%", size: "h-2 w-2", delay: 0.6, dur: 9.1, dx: 170, dy: 75, color: "bg-sky-100/90" },
                { left: "56%", top: "27%", size: "h-3.5 w-3.5", delay: 1.0, dur: 10.4, dx: -250, dy: 60, color: "bg-amber-200/90" },
                { left: "63%", top: "18%", size: "h-2.5 w-2.5", delay: 0.7, dur: 8.7, dx: 200, dy: -85, color: "bg-violet-100/85" },
                { left: "71%", top: "36%", size: "h-2 w-2", delay: 1.2, dur: 9.4, dx: -190, dy: -70, color: "bg-amber-100/90" },
                { left: "82%", top: "24%", size: "h-2.5 w-2.5", delay: 0.3, dur: 9.0, dx: 210, dy: 65, color: "bg-sky-100/90" },
                { left: "89%", top: "41%", size: "h-3.5 w-3.5", delay: 1.1, dur: 10.1, dx: -240, dy: 72, color: "bg-amber-200/95" },
                { left: "18%", top: "56%", size: "h-2 w-2", delay: 0.5, dur: 8.6, dx: 160, dy: -60, color: "bg-violet-100/85" },
                { left: "39%", top: "62%", size: "h-2.5 w-2.5", delay: 1.4, dur: 9.7, dx: -220, dy: 68, color: "bg-amber-100/90" },
                { left: "68%", top: "58%", size: "h-2 w-2", delay: 0.9, dur: 9.2, dx: 180, dy: -75, color: "bg-sky-100/90" },
                { left: "86%", top: "66%", size: "h-2.5 w-2.5", delay: 1.6, dur: 8.9, dx: -170, dy: -62, color: "bg-rose-100/85" },
                // extra lower-corner particles
                { left: "6%", top: "82%", size: "h-3 w-3", delay: 0.25, dur: 9.3, dx: 210, dy: -68, color: "bg-amber-200/95" },
                { left: "11%", top: "88%", size: "h-2.5 w-2.5", delay: 1.05, dur: 8.7, dx: 180, dy: -54, color: "bg-sky-100/90" },
                { left: "18%", top: "84%", size: "h-2 w-2", delay: 1.55, dur: 9.8, dx: 150, dy: -62, color: "bg-violet-100/85" },
                { left: "82%", top: "83%", size: "h-3 w-3", delay: 0.45, dur: 9.4, dx: -210, dy: -66, color: "bg-amber-200/95" },
                { left: "89%", top: "89%", size: "h-2.5 w-2.5", delay: 1.2, dur: 8.6, dx: -175, dy: -52, color: "bg-sky-100/90" },
                { left: "95%", top: "84%", size: "h-2 w-2", delay: 1.75, dur: 9.1, dx: -145, dy: -58, color: "bg-rose-100/85" },
              ].map((particle, index) => (
                <motion.span
                  key={`landing-particle-${index}`}
                  style={{ left: particle.left, top: particle.top }}
                  animate={{
                    opacity: [0.7, 1, 0.78],
                    x: [0, particle.dx],
                    y: [0, particle.dy],
                    scale: [0.85, 1.35, 0.95],
                  }}
                  transition={{ duration: particle.dur, delay: particle.delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className={`absolute ${particle.size} ${particle.color} rounded-full blur-[2px] shadow-[0_0_22px_8px_rgba(255,230,170,0.28)]`}
                />
              ))}
            </div>

            <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-8">
              <h1 className="text-center font-[family-name:var(--font-instrument-serif)] text-5xl leading-tight sm:text-7xl">
                the night cafe
              </h1>
              <p className="mt-2 text-center font-[family-name:var(--font-space-grotesk)] text-white/82">
                a place for late-night builders
              </p>
              <p className="mt-3 text-center font-[family-name:var(--font-space-grotesk)] text-sm italic text-amber-100/90 sm:text-base">
                {guests.length === 0
                  ? "the lights are on and the first seat is waiting for you."
                  : guests.length === 1
                    ? "a cozy night is underway. join 1 other builder inside."
                    : `a cozy night is underway. join ${guests.length} others inside.`}
              </p>

              <motion.div
                animate={isApproachingDoor ? { scale: 1.1, y: 8 } : { scale: 1, y: 0 }}
                transition={{ duration: 1.05, ease: [0.22, 0.61, 0.36, 1] }}
                className="relative mt-6 h-[470px] w-[340px] sm:h-[540px] sm:w-[600px]"
              >
                <Image
                  src="/ivy-embraces-brick-stockcake.webp"
                  alt="night cafe exterior"
                  fill
                  priority
                  className="rounded-t-[3rem] object-cover brightness-60 contrast-105 saturate-75"
                />
                <div className="absolute inset-0 rounded-t-[3rem] bg-[radial-gradient(circle_at_50%_8%,rgba(123,161,255,0.18),transparent_38%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.45))]" />
                <motion.div
                  animate={{ y: [0, -1, 0] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-t-[3rem] border border-[#cf8f7e]/35 shadow-[0_0_120px_-45px_rgba(255,188,124,0.62)]"
                />
                <div className="absolute inset-x-0 bottom-0 h-11 bg-[#261517]" />
                <div className="absolute left-10 right-10 top-8 z-20 rounded-2xl border border-[#ffd2ab]/35 bg-[#34181b]/88 px-4 py-2 text-center sm:left-20 sm:right-20">
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.24em] text-[#ffe3c7] sm:text-sm">
                    THE NIGHT CAFE
                  </span>
                </div>

                {["left-14", "right-14"].map((side, idx) => (
                  <motion.div
                    key={side}
                    animate={{ opacity: [0.72, 1, 0.72] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.5 }}
                    className={`absolute top-28 h-36 w-24 ${side} rounded-t-[2rem] border border-[#f2d1b1]/30 bg-[#2f1d1d]`}
                  >
                    <div className="absolute inset-2 rounded-t-[1.5rem] bg-[radial-gradient(circle,_rgba(255,220,171,0.88)_0%,_rgba(255,198,122,0.4)_42%,transparent_75%)]" />
                    <div className="absolute inset-y-2 left-1/2 w-[2px] -translate-x-1/2 bg-[#f7ddbe]/35" />
                  </motion.div>
                ))}
                {["left-8", "right-8"].map((side, idx) => (
                  <motion.div
                    key={side}
                    animate={{ opacity: [0.45, 0.9, 0.45] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.35 }}
                    className={`absolute top-[178px] h-14 w-6 ${side}`}
                  >
                    <div className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 bg-[#ffd8ac]/60" />
                    <div className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-amber-200/55 blur-sm" />
                  </motion.div>
                ))}

                <div className="absolute bottom-11 left-1/2 h-[330px] w-[210px] -translate-x-1/2 rounded-t-[118px] border border-[#e7bb92]/35 bg-[#2a1715] sm:h-[360px] sm:w-[230px]">
                  <motion.div
                    initial={false}
                    animate={{
                      rotateY: doorPhase === "opening" ? -84 : 0,
                      x: doorPhase === "opening" ? -35 : 0,
                      filter: doorPhase === "opening" ? "brightness(1.12)" : "brightness(1)",
                    }}
                    transition={{ duration: 1.05, ease: [0.22, 0.61, 0.36, 1] }}
                    style={{ transformOrigin: "left center" }}
                    className="absolute inset-2 rounded-t-[102px] border border-[#f2c9a2]/38 bg-gradient-to-b from-[#82553a] via-[#68462f] to-[#513321] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]"
                  >
                    <div className="absolute inset-x-5 top-7 h-36 rounded-t-[74px] border border-[#f8d7b5]/30 bg-[#35221d]">
                      <div className="absolute inset-2 rounded-t-[62px] bg-[radial-gradient(circle,_rgba(255,228,183,0.8)_0%,_rgba(255,196,125,0.28)_46%,transparent_74%)]" />
                    </div>
                    <div className="absolute bottom-20 right-6 h-4 w-4 rounded-full bg-[#f2d2b0] shadow-[0_0_12px_2px_rgba(255,220,170,0.55)]" />
                  </motion.div>
                </div>

                <Button
                  color="primary"
                  size="lg"
                  onPress={enterCafe}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#324f8d] text-white"
                >
                  step into the glow
                </Button>
              </motion.div>

              <motion.div
                animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-[18%] top-[33%] h-20 w-20 rounded-full bg-amber-200/25 blur-2xl"
              />
              <motion.div
                animate={{ opacity: [0.25, 0.7, 0.25], y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                className="pointer-events-none absolute right-[20%] top-[38%] h-24 w-24 rounded-full bg-yellow-200/20 blur-2xl"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.6, 0.2], x: [0, 5, 0] }}
                transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="pointer-events-none absolute left-[30%] bottom-[24%] h-28 w-28 rounded-full bg-amber-100/15 blur-3xl"
              />

              <p className="mt-2 text-sm text-white/70">local time: {localTime}</p>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="inside"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative h-screen overflow-hidden bg-black text-white"
          >
            <div
              className={`relative h-full w-full transition-all duration-300 ${showWelcome ? "scale-[0.99] blur-sm" : "scale-100"}`}
            >
              <Image
                src="/cozy-cafe-interior.png"
                alt="cozy cafe interior"
                fill
                className="pointer-events-none object-cover opacity-90"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/30" />
              <div className="pointer-events-none absolute inset-0 z-50">
                {[
                  // barstool 1, barstool 2
                  { left: "68%", top: "73%", delay: 0.1, color: "bg-sky-200", orbitX: 5, orbitY: 3, tip: "left-1/2 top-[calc(100%+10px)] -translate-x-1/2" },
                  { left: "83%", top: "76%", delay: 0.4, color: "bg-indigo-200", orbitX: 5, orbitY: 3, tip: "right-0 top-[calc(100%+10px)]" },
                  // chair 1, chair 2
                  { left: "16%", top: "84%", delay: 0.7, color: "bg-amber-200", orbitX: 3, orbitY: 2, tip: "left-[calc(100%+10px)] top-1/2 -translate-y-1/2" },
                  { left: "50%", top: "84%", delay: 1.0, color: "bg-violet-200", orbitX: 3, orbitY: 2, tip: "left-[calc(100%+10px)] top-1/2 -translate-y-1/2" },
                  // sofa cushion 1, cushion 2
                  { left: "43%", top: "64%", delay: 1.3, color: "bg-sky-100", orbitX: 3, orbitY: 2, tip: "left-1/2 top-[calc(100%+10px)] -translate-x-1/2" },
                  { left: "53%", top: "64%", delay: 1.6, color: "bg-amber-100", orbitX: 3, orbitY: 2, tip: "left-1/2 top-[calc(100%+10px)] -translate-x-1/2" },
                ].map((dot, index) => (
                  <motion.button
                    key={`inside-attendee-dot-${index}`}
                    style={{ left: dot.left, top: dot.top }}
                    animate={{
                      opacity: [0.82, 1, 0.82],
                      x: [0, dot.orbitX, -dot.orbitX * 0.65, 0],
                      y: [0, -dot.orbitY, dot.orbitY * 0.7, 0],
                      scale: [0.95, 1.16, 0.98],
                    }}
                    transition={{ duration: 3.2 + index * 0.35, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
                    onMouseEnter={() => setActiveOrbSlot(index)}
                    onMouseLeave={() => {
                      if (pinnedOrbSlot !== index) {
                        setActiveOrbSlot((curr) => (curr === index ? null : curr));
                      }
                    }}
                    onClick={() => {
                      if (pinnedOrbSlot === index) {
                        setPinnedOrbSlot(null);
                        setActiveOrbSlot(null);
                      } else {
                        setPinnedOrbSlot(index);
                        setActiveOrbSlot(index);
                      }
                    }}
                    className={`pointer-events-auto absolute h-14 w-14 rounded-full ${dot.color} shadow-[0_0_42px_16px_rgba(255,228,170,0.92)] focus-visible:outline-none`}
                    aria-label={orbGuests[index] ? `attendee orb for ${orbGuests[index].name}` : "open seat orb"}
                    type="button"
                  >
                    <span className="absolute inset-1 rounded-full border border-white/80 bg-white/60" />
                    {(activeOrbSlot === index || pinnedOrbSlot === index) && (
                      <span
                        className={`absolute z-40 w-60 rounded-xl border border-white/30 bg-[#0f172a]/98 p-2 text-left text-sm text-white shadow-[0_12px_28px_rgba(0,0,0,0.45)] ${dot.tip}`}
                      >
                        {orbGuests[index] ? (
                          <>
                            <span className="block font-medium">{orbGuests[index].name}</span>
                            <span className="mt-1 block text-white/85">drink: {orbGuests[index].drink}</span>
                            <span className="mt-1 block text-white/85">working on: {orbGuests[index].building}</span>
                          </>
                        ) : (
                          <span className="block text-white/80">open seat tonight</span>
                        )}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Chip color="primary" variant="flat">
                    the night cafe
                  </Chip>
                  <Chip color="success" variant="flat">
                    open now
                  </Chip>
                  <Button size="sm" variant="bordered" className="border-white/40 text-white" onPress={exitCafe}>
                    exit to street
                  </Button>
                  <p className="text-sm text-white/70">local time: {localTime}</p>
                </div>

                <h2 className="mt-4 font-[family-name:var(--font-instrument-serif)] text-4xl sm:text-5xl">inside the night cafe</h2>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="pointer-events-none absolute left-1/2 top-[42%] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-6 text-center font-[family-name:var(--font-instrument-serif)] italic"
                >
                  {guests.length === 0 ? (
                    <p className="text-2xl leading-relaxed text-[#fff2be] drop-shadow-[0_4px_10px_rgba(0,0,0,0.98)] sm:text-3xl">
                      the room is quiet tonight,
                      <br />
                      waiting for the first spark.
                    </p>
                  ) : (
                    <>
                      <p className="text-4xl leading-tight text-white sm:text-6xl">
                        there are {guests.length} gathered inside tonight
                      </p>
                      <div className="mt-1 space-y-0.5 text-2xl leading-relaxed text-white sm:text-4xl">
                        <p>
                          someone is{" "}
                          <span className="rounded-md bg-black/65 px-2 py-0.5 text-[#9ea8ff]">{(nightWorks[0] ?? "").slice(0, typedA)}</span>
                        </p>
                        {nightWorks[1] ? (
                          <p>
                            someone else is{" "}
                            <span className="rounded-md bg-black/65 px-2 py-0.5 text-[#8fc8d8]">{nightWorks[1].slice(0, typedB)}</span>
                          </p>
                        ) : null}
                        {hasManyGuests ? (
                          <p>
                            another is{" "}
                            <span className="rounded-md bg-black/65 px-2 py-0.5 text-[#b19adf]">{(nightWorks[2] ?? "").slice(0, typedC)}</span>
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.98 }}
                  transition={{ duration: 0.62, ease: [0.22, 0.61, 0.36, 1] }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/38 px-4"
                >
                  <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#1a2746]/65 p-4 text-white backdrop-blur-xl">
                    <p className="text-center font-[family-name:var(--font-instrument-serif)] text-3xl">welcome to the night cafe 🌙</p>
                    <p className="mt-2 text-center text-sm text-white/80">grab a drink and tell us what you are building tonight</p>
                    <div className="mt-5 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-white">your name *</p>
                        <Input
                          aria-label="your name"
                          value={name}
                          onValueChange={setName}
                          variant="bordered"
                          classNames={{
                            input: "!text-white",
                            inputWrapper: "border-white/45 bg-white/5 data-[hover=true]:border-white/70",
                          }}
                        />
                        {missingName && <p className="text-sm text-pink-300">your name is required before joining</p>}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-white">drink choice *</p>
                        <div className="grid grid-cols-3 gap-2">
                          {DRINKS.map((item) => {
                            const isSelected = selectedDrinkKey === item.key;
                            return (
                              <Button
                                key={item.key}
                                size="sm"
                                variant={isSelected ? "solid" : "bordered"}
                                className={
                                  isSelected
                                    ? "bg-[#355da3] text-xs text-white"
                                    : missingDrink
                                      ? "border-white/40 text-xs text-white"
                                      : "border-white/40 text-xs text-white"
                                }
                                onPress={() => setSelectedDrinkKey(item.key)}
                              >
                                {item.emoji} {item.label}
                              </Button>
                            );
                          })}
                        </div>
                        {missingDrink && <p className="text-sm text-pink-300">choose a drink before joining the cafe</p>}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-white">what are you working on? *</p>
                        <Textarea
                          aria-label="what are you working on"
                          placeholder={workPlaceholder}
                          value={building}
                          onValueChange={setBuilding}
                          minRows={2}
                          variant="bordered"
                          classNames={{
                            input: "!text-white",
                            inputWrapper: "border-white/45 bg-white/5 data-[hover=true]:border-white/70",
                          }}
                        />
                        {missingWork && <p className="text-sm text-pink-300">this is required before joining the cafe</p>}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <Button color="primary" className="bg-[#335591] text-white" onPress={handleCheckIn}>
                        join cafe
                      </Button>
                      <Button variant="light" className="text-white/80" onPress={() => setShowWelcome(false)}>
                        skip for now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.58, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-none absolute inset-0 z-50 bg-black"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
