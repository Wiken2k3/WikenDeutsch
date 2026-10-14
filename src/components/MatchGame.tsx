// src/components/MatchGame.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import { MatchPair } from '../types';
import {
  RotateCw,
  Trophy,
  Flame,
  Timer,
  Sparkles,
  ChevronDown,
  Zap
} from 'lucide-react';
import { playGermanAudio, playChimeSound } from '../utils/audio';

const SET_LABELS: Record<string, { label: string; emoji: string }> = {
  all: { label: 'Tất cả (412 từ)', emoji: '📚' },
  'einheit-1': { label: 'Einheit 1: Deutsch lernen', emoji: '📘' },
  'einheit-2': { label: 'Einheit 2: Familie', emoji: '👨‍👩‍👧‍👦' },
  'einheit-3': { label: 'Einheit 3: Mobilität', emoji: '🚗' },
  'station-1': { label: 'Station 1: Beruf & Magazin', emoji: '💼' }
};

const PAIR_OPTIONS = [4, 6, 8];
const BASE_TIMER = 90; // seconds

export const MatchGame: React.FC = () => {
  const { vocabulary, sets, activeSetId, setActiveSetId, completeStudySession, setActiveTab } = useVocab();

  // Local unit filter (decoupled from global activeSetId so user can change mid-screen)
  const [localSetId, setLocalSetId] = useState<string>(activeSetId || 'all');
  const [pairCount, setPairCount] = useState(6);
  const [showFilter, setShowFilter] = useState(false);

  const [cards, setCards] = useState<MatchPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchPair[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalPairs, setTotalPairs] = useState(6);
  const [timer, setTimer] = useState(BASE_TIMER);
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false); // block clicks during mismatch reveal

  // Use ref for matchedCount to avoid stale closure
  const matchedCountRef = useRef(0);

  const startNewGame = (unitId = localSetId, pairs = pairCount) => {
    const pool = unitId === 'all'
      ? vocabulary
      : vocabulary.filter(w => w.unitId === unitId);

    const available = pool.filter(w => w.german && w.vietnamese);
    if (available.length < 2) return;

    const actualPairs = Math.min(pairs, available.length);
    const sample = [...available].sort(() => Math.random() - 0.5).slice(0, actualPairs);

    const deCards: MatchPair[] = sample.map((item) => ({
      id: `de-${item.id}`,
      type: 'de',
      text: item.article ? `${item.article} ${item.german}` : item.german,
      subtext: item.type,
      matchedId: item.id,
      isMatched: false,
      isSelected: false,
      isError: false
    }));

    const viCards: MatchPair[] = sample.map((item) => ({
      id: `vi-${item.id}`,
      type: 'vi',
      text: item.vietnamese,
      subtext: undefined,
      matchedId: item.id,
      isMatched: false,
      isSelected: false,
      isError: false
    }));

    const combined = [...deCards, ...viCards].sort(() => Math.random() - 0.5);
    setCards(combined);
    setSelectedCards([]);
    matchedCountRef.current = 0;
    setMatchedCount(0);
    setTotalPairs(actualPairs);
    setTimer(BASE_TIMER + actualPairs * 5);
    setCombo(0);
    setScore(0);
    setIsActive(true);
    setIsGameOver(false);
    setGameWon(false);
    setIsChecking(false);
  };

  // Sync when global activeSetId changes (e.g. user navigated from Sets page)
  useEffect(() => {
    const initId = activeSetId || 'all';
    setLocalSetId(initId);
    startNewGame(initId, pairCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetId]);

  // Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0 && !isGameOver) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer <= 0 && isActive && !isGameOver) {
      setIsActive(false);
      setIsGameOver(true);
      setGameWon(false);
      playChimeSound('wrong');
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timer, isGameOver]);

  const handleCardClick = (card: MatchPair) => {
    if (!isActive || card.isMatched || card.isSelected || isChecking || selectedCards.length >= 2) return;

    if (card.type === 'de') {
      playGermanAudio(card.text);
    }

    const newSelected = [...selectedCards, { ...card }];
    setSelectedCards(newSelected);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, isSelected: true } : c));

    if (newSelected.length === 2) {
      setIsChecking(true);
      const [first, second] = newSelected;
      const isMatch = first.matchedId === second.matchedId && first.type !== second.type;

      if (isMatch) {
        playChimeSound('correct');
        const newCombo = combo + 1;
        const comboBonus = (newCombo > 1 ? (newCombo - 1) : 0) * 15;
        const roundScore = 100 + comboBonus;
        setScore(s => s + roundScore);
        setCombo(newCombo);

        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.matchedId === first.matchedId
                ? { ...c, isMatched: true, isSelected: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsChecking(false);

          const newMatched = matchedCountRef.current + 1;
          matchedCountRef.current = newMatched;
          setMatchedCount(newMatched);

          if (newMatched >= totalPairs) {
            setIsActive(false);
            setIsGameOver(true);
            setGameWon(true);
            const bonusTime = timer * 3;
            const totalXp = Math.floor((score + roundScore + bonusTime) / 8);
            completeStudySession(totalXp, newMatched, 0);
          }
        }, 350);
      } else {
        playChimeSound('wrong');
        setCombo(0);

        setCards(prev =>
          prev.map(c =>
            c.id === first.id || c.id === second.id
              ? { ...c, isError: true }
              : c
          )
        );

        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first.id || c.id === second.id
                ? { ...c, isSelected: false, isError: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsChecking(false);
        }, 750);
      }
    }
  };

  const handleChangeUnit = (unitId: string) => {
    setLocalSetId(unitId);
    setShowFilter(false);
    // Also sync global context so other views stay consistent
    setActiveSetId(unitId === 'all' ? null : unitId);
    startNewGame(unitId, pairCount);
  };

  const handleChangePairCount = (count: number) => {
    setPairCount(count);
    startNewGame(localSetId, count);
  };

  const timerColor = timer < 15 ? 'text-rose-600 font-extrabold' : timer < 30 ? 'text-amber-600 font-bold' : 'text-gray-700';
  const timerBg = timer < 15 ? 'text-rose-500' : 'text-blue-600';

  // --- Render helpers ---
  const allSets = [
    { id: 'all', title: 'Tất cả (412 từ)' },
    ...sets.filter(s => s.category === 'official')
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-6 px-2 sm:px-4 pb-mobile-nav">

      {/* ===== Game Control Bar ===== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">

        {/* Unit Filter Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowFilter(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 transition-colors shadow-xs min-h-[40px]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>{SET_LABELS[localSetId]?.emoji || '📚'}</span>
              <span className="truncate">{SET_LABELS[localSetId]?.label || allSets.find(s => s.id === localSetId)?.title || 'Tất cả'}</span>
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          {showFilter && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {allSets.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleChangeUnit(s.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    localSetId === s.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span>{SET_LABELS[s.id]?.emoji || '📁'}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pair count selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Số cặp:</span>
          {PAIR_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handleChangePairCount(n)}
              className={`w-9 h-9 rounded-xl text-xs font-extrabold border transition-all ${
                pairCount === n
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Restart button */}
        <button
          onClick={() => startNewGame(localSetId, pairCount)}
          title="Ván mới"
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs min-h-[40px]"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* ===== Status Bar ===== */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-xs mb-4">
        {/* Timer */}
        <div className={`flex items-center gap-1.5 text-sm font-bold ${timerColor}`}>
          <Timer className={`w-4 h-4 ${timerBg} ${timer < 15 ? 'animate-pulse' : ''}`} />
          <span>{timer}s</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="w-24 sm:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: totalPairs > 0 ? `${(matchedCount / totalPairs) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{matchedCount}/{totalPairs}</span>
        </div>

        {/* Score + Combo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{score}</span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-0.5 text-[11px] font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
              x{combo}
            </div>
          )}
        </div>
      </div>

      {/* ===== Result Banner ===== */}
      {isGameOver && (
        <div className={`p-5 mb-5 rounded-2xl border text-center ${gameWon ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'}`}>
          <div className="text-4xl mb-2">{gameWon ? '🏆' : '⏰'}</div>
          <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${gameWon ? 'text-emerald-800' : 'text-gray-900'}`}>
            {gameWon ? 'Ghép thành công toàn bộ thẻ!' : 'Hết giờ rồi!'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Ghép đúng <strong className="text-gray-900">{matchedCount}/{totalPairs}</strong> cặp từ
            {gameWon && <> • Điểm số: <strong className="text-amber-600">{score}</strong></>}
          </p>

          <div className="flex items-center justify-center flex-wrap gap-2.5">
            <button
              onClick={() => startNewGame(localSetId, pairCount)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all min-h-[40px]"
            >
              <RotateCw className="w-4 h-4" />
              Ván mới
            </button>

            <button
              onClick={() => setActiveTab('spell')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px]"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              Game Gõ từ
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px]"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Làm Quiz
            </button>
          </div>
        </div>
      )}

      {/* ===== Card Grid ===== */}
      {cards.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-xs">
          <p className="font-semibold mb-2">Không có từ vựng trong bộ này.</p>
          <p>Hãy chọn bộ từ khác bên trên.</p>
        </div>
      ) : (
        <div className={`grid gap-2.5 sm:gap-3 ${pairCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : pairCount <= 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {cards.map((card) => {
            let stateStyle =
              'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer';

            if (card.isMatched) {
              stateStyle = 'opacity-0 scale-90 pointer-events-none';
            } else if (card.isError) {
              stateStyle = 'bg-rose-50 border-rose-400 text-rose-800 animate-pulse';
            } else if (card.isSelected) {
              stateStyle = 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500/30 shadow-blue-100 shadow-sm';
            }

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched || isChecking || !isActive}
                className={`
                  min-h-[82px] sm:min-h-[96px] p-3 rounded-2xl border-2 flex flex-col items-center
                  justify-center text-center transition-all duration-200 active:scale-95 shadow-xs
                  ${stateStyle}
                `}
              >
                <span className="font-bold text-xs sm:text-sm leading-snug">{card.text}</span>
                {card.subtext && (
                  <span className="text-[10px] font-normal text-gray-400 mt-1">({card.subtext})</span>
                )}
                {/* Type badge */}
                <span className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  card.type === 'de'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {card.type === 'de' ? 'DE' : 'VI'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Overlay to close filter dropdown */}
      {showFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
      )}
    </div>
  );
};
