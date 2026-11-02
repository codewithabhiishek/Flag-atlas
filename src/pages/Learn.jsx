import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Search,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  MapPin,
  Globe2,
  Compass,
  ArrowRight,
  Layers,
  GraduationCap,
  X,
  CheckCircle2,
  Check,
  Lightbulb,
  Info,
  HelpCircle,
  Eye,
  BookMarked,
} from "lucide-react";
import { COUNTRIES, byCode, shuffle, pickOptions } from "@/data/countries";
import { REGIONS } from "@/data/regions";
import { FLAG_FAMILIES, getCountryFact } from "@/data/countryFacts";
import { useProgress } from "@/lib/ProgressContext";
import { flagStatus } from "@/lib/derive";
import FlagImage from "@/components/FlagImage";
import { playUiSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const REGION_OPTIONS = [
  "All",
  ...REGIONS.filter((r) => r.id !== "Antarctica").map((r) => r.id),
];

export default function Learn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "guide";
  const initialRegion = searchParams.get("region") || "All";
  const initialFamily = searchParams.get("family") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedFamily, setSelectedFamily] = useState(initialFamily);
  const { state } = useProgress();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        return next;
      },
      { replace: true },
    );
    playUiSound("tap");
  };

  const handleRegionChange = (reg) => {
    setSelectedRegion(reg);
    setSelectedFamily("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (reg === "All") next.delete("region");
        else next.set("region", reg);
        next.delete("family");
        return next;
      },
      { replace: true },
    );
    playUiSound("click");
  };

  const handleFamilySelect = (familyId) => {
    setSelectedFamily(familyId);
    setSelectedRegion("All");
    setActiveTab("guide");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (familyId) next.set("family", familyId);
        else next.delete("family");
        next.set("tab", "guide");
        next.delete("region");
        return next;
      },
      { replace: true },
    );
    playUiSound("tap");
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-6">
      {/* ── Top Header ── */}
      <div className="atlas-card p-5 sm:p-7 border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-foreground/30 bg-muted/70 text-[11px] uppercase tracking-[0.18em] font-bold text-foreground">
              <BookOpen className="w-3.5 h-3.5 text-terra" />
              Flag Academy · Learn Through Stories & Meaning
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              How to Remember Every Flag
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Don't just memorize random shapes. Learn the{" "}
              <strong>story</strong> behind each flag, its{" "}
              <strong>symbolism</strong>, and the{" "}
              <strong>capital connection</strong> trick.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/play"
              className="inline-flex items-center gap-2 h-10 px-4 border-2 border-foreground bg-terra hover:bg-terra/90 text-white text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition-all"
            >
              <span>Test in Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-foreground/15 pt-4">
          <button
            type="button"
            onClick={() => handleTabChange("guide")}
            className={cn(
              "px-3.5 py-2 border-2 text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition-all",
              activeTab === "guide"
                ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "border-foreground/30 bg-card hover:bg-muted text-foreground",
            )}
          >
            <Lightbulb className="w-3.5 h-3.5 text-gold" />
            <span>Story & Memory Guide (Beginner)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("families")}
            className={cn(
              "px-3.5 py-2 border-2 text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition-all",
              activeTab === "families"
                ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "border-foreground/30 bg-card hover:bg-muted text-foreground",
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-terra" />
            <span>Flag Families (Patterns)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("directory")}
            className={cn(
              "px-3.5 py-2 border-2 text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition-all",
              activeTab === "directory"
                ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "border-foreground/30 bg-card hover:bg-muted text-foreground",
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Country Directory</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("flashcards")}
            className={cn(
              "px-3.5 py-2 border-2 text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition-all",
              activeTab === "flashcards"
                ? "border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "border-foreground/30 bg-card hover:bg-muted text-foreground",
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcard Quiz</span>
          </button>
        </div>
      </div>

      {/* ── Active Tab View ── */}
      {activeTab === "guide" && (
        <MemoryGuideMode
          region={selectedRegion}
          familyId={selectedFamily}
          onRegionChange={handleRegionChange}
          onClearFamily={() => setSelectedFamily("")}
          flagsProgress={state.flags}
        />
      )}

      {activeTab === "families" && (
        <FlagFamiliesMode onSelectFamily={handleFamilySelect} />
      )}

      {activeTab === "directory" && (
        <DirectoryMode
          region={selectedRegion}
          onRegionChange={handleRegionChange}
          flagsProgress={state.flags}
        />
      )}

      {activeTab === "flashcards" && (
        <ClassicFlashcards
          region={selectedRegion}
          onRegionChange={handleRegionChange}
          flagsProgress={state.flags}
        />
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STORY & MEMORY GUIDE MODE (The True Educational Experience)
// ─────────────────────────────────────────────────────────────────────────────
function MemoryGuideMode({
  region,
  familyId,
  onRegionChange,
  onClearFamily,
  flagsProgress,
}) {
  const activeFamily = useMemo(
    () => FLAG_FAMILIES.find((f) => f.id === familyId),
    [familyId],
  );

  const deck = useMemo(() => {
    if (activeFamily) {
      return activeFamily.codes.map((code) => byCode(code)).filter(Boolean);
    }
    if (region === "All") return COUNTRIES;
    return COUNTRIES.filter((c) => c.region === region);
  }, [activeFamily, region]);

  const [index, setIndex] = useState(0);
  const [testMode, setTestMode] = useState(false); // flips to active recall check
  const [learnedSet, setLearnedSet] = useState(new Set());

  // Reset index when filter changes
  useEffect(() => {
    setIndex(0);
    setTestMode(false);
  }, [region, familyId]);

  const currentCountry = deck[index] || deck[0];
  const fact = useMemo(
    () => (currentCountry ? getCountryFact(currentCountry) : null),
    [currentCountry],
  );

  const handleNext = useCallback(() => {
    setTestMode(false);
    setIndex((prev) => (prev + 1) % deck.length);
    playUiSound("advance");
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setTestMode(false);
    setIndex((prev) => (prev - 1 + deck.length) % deck.length);
    playUiSound("advance");
  }, [deck.length]);

  const handleShuffle = () => {
    setTestMode(false);
    setIndex(Math.floor(Math.random() * deck.length));
    playUiSound("click");
  };

  const toggleTest = () => {
    setTestMode((prev) => !prev);
    playUiSound("tap");
  };

  const markLearned = useCallback(() => {
    if (!currentCountry) return;
    setLearnedSet((prev) => {
      const next = new Set(prev);
      next.add(currentCountry.code);
      return next;
    });
    playUiSound("success");
    handleNext();
  }, [currentCountry, handleNext]);

  // Keyboard navigation for smooth study flow
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTest();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, toggleTest]);

  if (!currentCountry || !fact) return null;

  const status = flagStatus(flagsProgress, currentCountry.code);
  const isLearnedThisSession = learnedSet.has(currentCountry.code);
  const sessionPct = deck.length > 0 ? Math.round((learnedSet.size / deck.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Filters & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {activeFamily ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-terra flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Pattern Lesson:{" "}
              <strong>{activeFamily.title}</strong>
            </span>
            <button
              type="button"
              onClick={onClearFamily}
              className="text-[11px] underline font-bold text-muted-foreground hover:text-foreground"
            >
              (Show All)
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {REGION_OPTIONS.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => onRegionChange(reg)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase rounded border transition-colors shrink-0 min-h-[38px] sm:min-h-0",
                  region === reg
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {reg}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <span className="font-mono font-bold text-foreground">
            {index + 1} of {deck.length}
          </span>
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 border border-foreground bg-card hover:bg-muted text-foreground rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Random Country"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleTest}
            className={cn(
              "px-3 py-1.5 border border-foreground text-[11px] font-bold uppercase tracking-tight rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors min-h-[36px] flex items-center justify-center",
              testMode
                ? "bg-forest text-white"
                : "bg-card hover:bg-muted text-foreground",
            )}
          >
            {testMode ? "👁️ View Lesson" : "❓ Quick Test"}
          </button>
        </div>
      </div>

      {/* Session Progress Meter */}
      <div className="bg-card px-3.5 py-2.5 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
            Session Mastery: <strong className="text-foreground">{learnedSet.size}</strong> of {deck.length} flags memorized
          </span>
          <span className="font-mono text-foreground">{sessionPct}%</span>
        </div>
        <div className="h-2 w-full bg-muted border border-border/70 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-forest"
            initial={false}
            animate={{ width: `${sessionPct}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main Educational Dossier Card */}
      <AnimatePresence mode="wait">
        {!testMode ? (
          <motion.div
            key={`lesson-${currentCountry.code}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="atlas-card p-5 sm:p-8 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] space-y-6"
          >
            {/* Header: Flag + Country Identity */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b-2 border-foreground/15 pb-6">
              {/* High-res Flag */}
              <div className="w-48 sm:w-56 aspect-[3/2] border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden shrink-0 bg-background">
                <FlagImage
                  code={currentCountry.code}
                  className="w-full h-full object-cover"
                  fittingType="fill"
                  alt={`Flag of ${currentCountry.name}`}
                  priority
                />
              </div>

              {/* Title & Identifiers */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-terra/10 border border-terra/30 text-[11px] font-bold uppercase tracking-wider text-terra">
                    <Globe2 className="w-3 h-3" /> {currentCountry.region}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-border bg-muted font-bold text-muted-foreground uppercase">
                    Code: {currentCountry.code}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded border border-border bg-muted font-bold text-muted-foreground capitalize">
                    Game Status:{" "}
                    {status === "locked" ? "Not played yet" : status}
                  </span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {currentCountry.name}
                </h2>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border-2 border-foreground rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-foreground">
                  <MapPin className="w-4 h-4 text-terra shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Capital City:
                  </span>
                  <strong className="text-sm font-display font-bold text-foreground">
                    {currentCountry.capital}
                  </strong>
                </div>
              </div>
            </div>

            {/* Three Educational Lesson Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: The Memory Story */}
              <div className="p-4 sm:p-5 border-2 border-foreground bg-amber-500/10 rounded-xl space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>The Memory Hook</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {fact.hook}
                </p>
              </div>

              {/* Pillar 2: Flag Symbolism */}
              <div className="p-4 sm:p-5 border-2 border-foreground bg-sky-500/10 rounded-xl space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                  <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Flag Meaning & Colors</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {fact.symbolism}
                </p>
              </div>

              {/* Pillar 3: Capital Connection */}
              <div className="p-4 sm:p-5 border-2 border-foreground bg-emerald-500/10 rounded-xl space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Capital Association</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {fact.capitalHook}
                </p>
              </div>
            </div>

            {/* Bottom Lesson Footer Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-11 px-4 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-1 sm:flex-none min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="h-11 px-4 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-1 sm:flex-none min-h-[44px]"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={toggleTest}
                  className="h-11 px-4 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-1 sm:flex-none min-h-[44px]"
                >
                  <Eye className="w-4 h-4" /> Test My Memory
                </button>

                <button
                  type="button"
                  onClick={markLearned}
                  className={cn(
                    "h-11 px-4 border-2 font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors shrink-0 min-h-[44px]",
                    isLearnedThisSession
                      ? "border-emerald-600 bg-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                      : "border-foreground bg-card hover:bg-muted text-foreground",
                  )}
                >
                  <Check className="w-4 h-4" />
                  {isLearnedThisSession ? "Memorized" : "Got It"}
                </button>
              </div>
            </div>

            <div className="text-center sm:text-left text-[11px] text-muted-foreground font-medium pt-1">
              Shortcuts: <kbd className="px-1.5 py-0.5 border rounded bg-muted font-mono text-[10px]">← / →</kbd> Navigate · <kbd className="px-1.5 py-0.5 border rounded bg-muted font-mono text-[10px]">T</kbd> Quick Test
            </div>
          </motion.div>
        ) : (
          /* ── Interactive Recall Quiz ── */
          <InteractiveRecallQuiz
            currentCountry={currentCountry}
            fact={fact}
            onReveal={toggleTest}
            onMarkLearned={() => {
              setLearnedSet((prev) => new Set(prev).add(currentCountry.code));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractiveRecallQuiz({ currentCountry, fact, onReveal, onMarkLearned }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const choices = useMemo(() => {
    return pickOptions(currentCountry.code, null, 4);
  }, [currentCountry.code]);

  const handlePick = (c) => {
    if (answered) return;
    const isCorrect = c.code === currentCountry.code;
    setSelected(c.code);
    setAnswered(true);
    playUiSound(isCorrect ? "success" : "error");
    if (isCorrect) {
      onMarkLearned();
    }
  };

  return (
    <motion.div
      key={`test-${currentCountry.code}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="atlas-card p-5 sm:p-7 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center max-w-xl mx-auto space-y-4"
    >
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terra">
        <HelpCircle className="w-4 h-4" />
        <span>Recall Check · Can You Identify This Flag?</span>
      </div>

      <div className="w-48 aspect-[3/2] mx-auto border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden bg-background">
        <FlagImage
          code={currentCountry.code}
          className="w-full h-full object-cover"
          fittingType="fill"
          alt="Mystery Flag"
        />
      </div>

      <p className="text-xs text-muted-foreground italic px-2">
        💡 Lesson hint: "{fact.hook.slice(0, 80)}..."
      </p>

      {/* 4 Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-1">
        {choices.map((c) => {
          const isTarget = c.code === currentCountry.code;
          const isUserPick = selected === c.code;

          let btnStyle =
            "border-2 border-foreground bg-card text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] hover:bg-muted/60";

          if (answered) {
            if (isTarget) {
              btnStyle =
                "border-2 border-emerald-600 bg-emerald-500/20 text-emerald-950 dark:text-emerald-100 font-bold shadow-[2px_2px_0px_0px_rgba(16,185,129,0.9)]";
            } else if (isUserPick) {
              btnStyle =
                "border-2 border-destructive bg-destructive/15 text-destructive line-through opacity-80";
            } else {
              btnStyle = "border-2 border-border/40 text-muted-foreground/40 opacity-35";
            }
          }

          return (
            <button
              key={c.code}
              type="button"
              disabled={answered}
              onClick={() => handlePick(c)}
              className={cn(
                "p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-between min-h-[44px]",
                btnStyle,
              )}
            >
              <div>
                <span className="block font-bold">{c.name}</span>
                <span className="text-[11px] opacity-80">Cap: {c.capital}</span>
              </div>
              {answered && isTarget && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
        {answered ? (
          <span className="text-xs font-bold text-foreground text-left">
            {selected === currentCountry.code ? (
              <span className="text-emerald-700 dark:text-emerald-300">
                🎉 Spot on! {currentCountry.name} ({currentCountry.capital})
              </span>
            ) : (
              <span className="text-destructive">
                It's {currentCountry.name} ({currentCountry.capital})
              </span>
            )}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Pick matching country or reveal the story.</span>
        )}

        <button
          type="button"
          onClick={onReveal}
          className="h-10 px-4 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-tight rounded shrink-0 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] min-h-[40px]"
        >
          {answered ? "Return to Lesson →" : "Reveal Story →"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FLAG FAMILIES MODE (Pattern-Based Learning)
// ─────────────────────────────────────────────────────────────────────────────
function FlagFamiliesMode({ onSelectFamily }) {
  return (
    <div className="space-y-4">
      <div className="atlas-card p-5 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Learn by Visual Patterns & Families
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
          Flags aren't random. They belong to historical and cultural families.
          Click any family below to learn all countries that share that design
          motif.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FLAG_FAMILIES.map((family) => {
          const countries = family.codes
            .map((code) => byCode(code))
            .filter(Boolean);
          return (
            <motion.div
              key={family.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectFamily(family.id)}
              className="atlas-card p-5 border-2 border-foreground bg-card hover:border-terra shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-terra/10 border border-terra/30 text-terra">
                    {family.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {countries.length} flags
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-terra transition-colors">
                  {family.title}
                </h3>

                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {family.description}
                </p>

                {/* Flag Thumbnails row */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {countries.map((c) => (
                    <div
                      key={c.code}
                      className="w-10 h-7 border border-foreground/40 rounded overflow-hidden shrink-0 shadow-xs"
                      title={`${c.name} (${c.capital})`}
                    >
                      <FlagImage
                        code={c.code}
                        className="w-full h-full object-cover"
                        fittingType="fill"
                        alt={c.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-muted-foreground italic truncate mr-2">
                  Tip: {family.tip}
                </span>
                <span className="font-bold uppercase text-[11px] text-terra shrink-0 inline-flex items-center gap-1">
                  Study Lesson →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DIRECTORY & SEARCH MODE (With Full Educational Inspector)
// ─────────────────────────────────────────────────────────────────────────────
function normalizeText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function DirectoryMode({ region, onRegionChange, flagsProgress }) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);

  const filtered = useMemo(() => {
    let list = COUNTRIES;
    if (region !== "All") {
      list = list.filter((c) => c.region === region);
    }
    if (query.trim()) {
      const q = normalizeText(query);
      list = list.filter(
        (c) =>
          normalizeText(c.name).includes(q) ||
          normalizeText(c.capital).includes(q) ||
          c.code.toLowerCase() === q,
      );
    }
    return list;
  }, [region, query]);

  const selectedFact = useMemo(
    () => (selectedCountry ? getCountryFact(selectedCountry) : null),
    [selectedCountry],
  );

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="atlas-card p-4 sm:p-5 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-card space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country, capital city, or 2-letter code..."
            className="w-full h-11 pl-10 pr-10 border-2 border-foreground bg-background text-foreground text-sm rounded font-medium focus:outline-none focus:ring-2 focus:ring-forest"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {REGION_OPTIONS.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => onRegionChange(reg)}
              className={cn(
                "px-2.5 py-1 text-xs font-bold uppercase rounded border transition-colors shrink-0",
                region === reg
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-1">
          <span>Showing {filtered.length} of {COUNTRIES.length} countries</span>
          {region !== "All" && (
            <span>
              Filtered by: <strong className="text-foreground">{region}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const status = flagStatus(flagsProgress, c.code);
          return (
            <motion.div
              key={c.code}
              whileHover={{ y: -2 }}
              onClick={() => {
                setSelectedCountry(c);
                playUiSound("tap");
              }}
              className="atlas-card p-3 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer hover:border-terra transition-all flex items-center gap-3.5 group"
            >
              <div className="w-16 h-11 border border-foreground/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.7)] rounded overflow-hidden shrink-0 bg-muted">
                <FlagImage
                  code={c.code}
                  className="w-full h-full object-cover"
                  fittingType="fill"
                  alt={`Flag of ${c.name}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground truncate group-hover:text-terra transition-colors">
                  {c.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="w-3 h-3 shrink-0 text-terra" />
                  <span className="truncate">{c.capital}</span>
                </div>
              </div>

              <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider">
                {status === "mastered" && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-forest block"
                    title="Mastered"
                  />
                )}
                {status === "learning" && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-terra block"
                    title="Learning"
                  />
                )}
                {status === "locked" && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-border block"
                    title="Not studied"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Country Detail Educational Modal */}
      <AnimatePresence>
        {selectedCountry && selectedFact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border-2 border-foreground bg-card p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
            >
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="absolute right-4 top-4 p-1.5 border border-foreground bg-card hover:bg-muted text-foreground rounded"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-44 aspect-[3/2] mx-auto border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden bg-background">
                  <FlagImage
                    code={selectedCountry.code}
                    className="w-full h-full object-cover"
                    fittingType="fill"
                    alt={`Flag of ${selectedCountry.name}`}
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-terra">
                    {selectedCountry.region}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                    {selectedCountry.name}
                  </h2>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    Capital:{" "}
                    <span className="text-terra">
                      {selectedCountry.capital}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory Story Block */}
              <div className="p-3.5 bg-amber-500/10 border-2 border-foreground/30 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 uppercase flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  How to Remember This Flag
                </span>
                <p className="text-foreground leading-relaxed">
                  {selectedFact.hook}
                </p>
              </div>

              {/* Symbolism */}
              <div className="p-3.5 bg-sky-500/10 border-2 border-foreground/30 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-sky-900 dark:text-sky-200 uppercase flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Flag Meaning
                </span>
                <p className="text-foreground leading-relaxed">
                  {selectedFact.symbolism}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="flex-1 h-10 border-2 border-foreground bg-card hover:bg-muted text-foreground text-xs font-bold uppercase tracking-tight rounded"
                >
                  Close
                </button>

                <Link
                  to={`/play?region=${encodeURIComponent(selectedCountry.region)}`}
                  className="flex-1 h-10 border-2 border-foreground bg-terra hover:bg-terra/90 text-white text-xs font-bold uppercase tracking-tight rounded inline-flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span>Play This Region</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLASSIC FLASHCARDS (Active Recall Test Mode)
// ─────────────────────────────────────────────────────────────────────────────
function ClassicFlashcards({ region, onRegionChange }) {
  const filtered = useMemo(() => {
    return region === "All"
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.region === region);
  }, [region]);

  const [deck, setDeck] = useState(filtered);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setDeck(filtered);
    setIndex(0);
    setIsFlipped(false);
  }, [filtered]);

  const current = deck[index] || deck[0];

  const handleNext = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev + 1) % deck.length);
    playUiSound("advance");
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev - 1 + deck.length) % deck.length);
    playUiSound("advance");
  };

  const handleFlip = () => {
    setIsFlipped((f) => !f);
    playUiSound("tap");
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-3 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {REGION_OPTIONS.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => onRegionChange(reg)}
              className={cn(
                "px-2.5 py-1 text-xs font-bold uppercase rounded border transition-colors shrink-0",
                region === reg
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {reg}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs font-bold text-foreground">
          {index + 1} / {deck.length}
        </span>
      </div>

      <div className="flex justify-center py-2">
        <div
          onClick={handleFlip}
          className="relative w-full max-w-md cursor-pointer select-none min-h-[340px]"
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.45 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full h-full min-h-[340px] relative rounded-2xl"
          >
            {/* Front */}
            <div
              className={cn(
                "absolute inset-0 p-6 flex flex-col items-center justify-between text-center rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backface-hidden",
                isFlipped && "pointer-events-none",
              )}
            >
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {current.region} · Tap to Reveal
              </span>
              <div className="w-48 aspect-[3/2] border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden bg-background">
                <FlagImage
                  code={current.code}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-terra inline-flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Tap to check country &
                capital
              </span>
            </div>

            {/* Back */}
            <div
              className={cn(
                "absolute inset-0 p-6 flex flex-col items-center justify-between text-center rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backface-hidden",
                !isFlipped && "pointer-events-none",
              )}
              style={{ transform: "rotateY(180deg)" }}
            >
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {current.region}
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-3xl font-extrabold text-foreground">
                  {current.name}
                </h3>
                <div className="text-base font-bold text-terra">
                  Capital: {current.capital}
                </div>
              </div>
              <span className="text-xs font-bold text-terra inline-flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Flip back
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="flex-1 h-11 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleFlip}
          className="flex-1 h-11 border-2 border-foreground bg-foreground text-background font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <RotateCw className="w-3.5 h-3.5" /> Flip Card
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 h-11 border-2 border-foreground bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
