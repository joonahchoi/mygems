/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Plus,
  Trash2,
  Trophy,
  RotateCcw,
  Play,
  UserPlus,
  Star,
  ChevronLeft,
  Minus,
  Save,
  BookOpen,
  Download,
  Gem,
  Sparkles,
} from 'lucide-react';
import { Student, AppMode, SavedClass } from './types';

// Utility for glassmorphism classes
const glassClass =
  'bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [mode, setMode] = useState<AppMode>('input');
  const [newName, setNewName] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [showClassManager, setShowClassManager] = useState(false);

  // =====================================================================
  // ✨ 플로팅 "정산하기" 버튼 - 스크롤 따라다니기 (살짝 늦게 따라오는 효과)
  // scrollY : 실제 스크롤 위치 (즉시 반응)
  // smoothScrollY : spring으로 부드럽게 따라오는 위치 (살짝 lag)
  // lagY : 두 값의 차이를 transform translateY 로 적용 → "쫓아오는" 느낌
  // =====================================================================
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 70,
    damping: 15,
    mass: 0.8,
  });
  const lagY = useTransform(
    [scrollY, smoothScrollY],
    (latest: number[]) => latest[1] - latest[0]
  );

  // Load from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('star-students');
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {
        console.error('Failed to parse students from localStorage', e);
      }
    }

    const classes = localStorage.getItem('star-student-classes');
    if (classes) {
      try {
        setSavedClasses(JSON.parse(classes));
      } catch (e) {
        console.error('Failed to parse classes from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('star-students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('star-student-classes', JSON.stringify(savedClasses));
  }, [savedClasses]);

  const addStudent = () => {
    if (!newName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      score: 0,
    };
    setStudents([...students, newStudent]);
    setNewName('');
  };

  const addBulkStudents = () => {
    const names = bulkInput
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) return;

    const newStudents: Student[] = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      score: 0,
    }));

    setStudents([...students, ...newStudents]);
    setBulkInput('');
    setBulkMode(false);
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const saveClass = () => {
    if (!newClassName.trim() || students.length === 0) return;
    const newClass: SavedClass = {
      id: crypto.randomUUID(),
      name: newClassName.trim(),
      students: students.map((s) => ({ ...s, score: 0 })),
    };
    setSavedClasses([...savedClasses, newClass]);
    setNewClassName('');
    alert(`'${newClass.name}' 반이 저장되었습니다!`);
  };

  const loadClass = (cls: SavedClass) => {
    if (confirm(`'${cls.name}' 명단을 불러올까요? 현재 목록은 덮어씌워집니다.`)) {
      setStudents(cls.students.map((s) => ({ ...s, score: 0 })));
      setShowClassManager(false);
    }
  };

  const deleteClass = (id: string) => {
    if (confirm('이 반 명단을 삭제하시겠습니까?')) {
      setSavedClasses(savedClasses.filter((c) => c.id !== id));
    }
  };

  const updateScore = (id: string, delta: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, score: Math.max(0, s.score + delta) };
        }
        return s;
      })
    );
  };

  const resetAll = () => {
    if (confirm('모든 데이터를 초기화할까요?')) {
      setStudents([]);
      setMode('input');
      localStorage.removeItem('star-students');
    }
  };

  // 명단 초기화 (현재 학생 목록만 비움 - 저장된 반 명단은 그대로 유지)
  const clearRoster = () => {
    if (students.length === 0) return;
    if (
      confirm(
        '현재 명단을 모두 비울까요?\n(저장해둔 반 명단은 그대로 남아있어요)'
      )
    ) {
      setStudents([]);
    }
  };

  const resetScores = () => {
    setStudents(students.map((s) => ({ ...s, score: 0 })));
  };

  const topThree = useMemo(() => {
    return [...students].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [students]);

  // 점수에 따른 표정 이모지
  const getExpression = (score: number) => {
    if (score === 0) return '😐'; // 기본 (0점)
    if (score === 1) return '🙂'; // 1점
    if (score === 2) return '😊'; // 2점
    if (score === 3) return '😄'; // 3점
    if (score === 4) return '😍'; // 4점
    return '😎'; // 5점 이상
  };

  const totalScore = useMemo(
    () => students.reduce((sum, s) => sum + s.score, 0),
    [students]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center relative overflow-x-clip">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-400/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 blur-[120px] rounded-full animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/20 blur-[100px] rounded-full animate-pulse pointer-events-none"
        style={{ animationDelay: '2s' }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl flex items-center justify-between mb-8 relative z-10"
      >
        <div className="flex items-center gap-3">
          <Gem className="w-9 h-9 text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            선생님의 보석함
          </h1>
        </div>
        {mode !== 'input' && (
          <button
            onClick={() => setMode('input')}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/40 hover:bg-white/60 transition"
          >
            <ChevronLeft size={18} /> 명단
          </button>
        )}
      </motion.header>

      <main className="w-full max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {/* ============ INPUT MODE ============ */}
          {mode === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${glassClass} p-6 md:p-8`}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="text-purple-500" /> 학생 명단
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowClassManager(!showClassManager)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 transition text-sm"
                  >
                    <BookOpen size={16} /> 반 명단
                  </button>
                  <button
                    onClick={() => setBulkMode(!bulkMode)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 transition text-sm"
                  >
                    {bulkMode ? '한 명씩 등록' : '한 번에 등록'}
                  </button>
                  <button
                    onClick={clearRoster}
                    disabled={students.length === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/40 hover:bg-red-100 transition text-sm text-red-500 disabled:opacity-40 disabled:hover:bg-white/40"
                  >
                    <RotateCcw size={16} /> 명단 초기화
                  </button>
                </div>
              </div>

              {/* Class Manager */}
              <AnimatePresence>
                {showClassManager && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-4 rounded-2xl bg-white/30 border border-white/40">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <input
                          type="text"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          placeholder="반 이름 (예: 4학년 2반)"
                          className="flex-1 min-w-[150px] px-3 py-2 rounded-xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                        <button
                          onClick={saveClass}
                          disabled={!newClassName.trim() || students.length === 0}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold disabled:opacity-40 flex items-center gap-1"
                        >
                          <Save size={16} /> 저장
                        </button>
                      </div>
                      {savedClasses.length > 0 ? (
                        <div className="space-y-2">
                          {savedClasses.map((cls) => (
                            <div
                              key={cls.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-white/50"
                            >
                              <span className="font-medium">
                                {cls.name}{' '}
                                <span className="text-xs text-slate-500">
                                  ({cls.students.length}명)
                                </span>
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => loadClass(cls)}
                                  className="px-3 py-1 rounded-lg bg-purple-400 text-white text-sm hover:bg-purple-500"
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  onClick={() => deleteClass(cls.id)}
                                  className="px-3 py-1 rounded-lg bg-red-400 text-white text-sm hover:bg-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-2">
                          저장된 반이 없어요
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Student Input */}
              {bulkMode ? (
                <div className="space-y-3 mb-4">
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="한 줄에 한 명씩 이름을 적어주세요"
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    onClick={addBulkStudents}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-[1.02] transition"
                  >
                    한꺼번에 추가
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                    placeholder="학생 이름"
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    onClick={addStudent}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition flex items-center gap-1"
                  >
                    <Plus size={18} /> 추가
                  </button>
                </div>
              )}

              {/* Student List */}
              <div className="space-y-2 mb-6">
                {students.map((student) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/40"
                  >
                    {/* ✅ 이모지 아바타 - 동그라미 안에 점수에 따른 표정 */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                      {getExpression(student.score)}
                    </div>
                    <span className="flex-1 font-medium">{student.name}</span>
                    <button
                      onClick={() => removeStudent(student.id)}
                      className="p-2 rounded-xl hover:bg-red-100 text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
                {students.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    학생을 추가해주세요 ✨
                  </p>
                )}
              </div>

              <button
                onClick={() => setMode('play')}
                disabled={students.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold text-lg disabled:opacity-40 hover:scale-[1.02] transition flex items-center justify-center gap-2 shadow-xl"
              >
                <Play size={22} /> 보석 모으기 시작!
              </button>
            </motion.div>
          )}

          {/* ============ PLAY MODE ============ */}
          {mode === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pb-24"
            >
              <div
                className={`${glassClass} p-5 flex items-center justify-between flex-wrap gap-2`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  <span className="font-bold">
                    총 {students.length}명 · 보석 {totalScore}개
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetScores}
                    className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 text-sm flex items-center gap-1"
                  >
                    <RotateCcw size={14} /> 초기화
                  </button>
                  <button
                    onClick={() => setMode('result')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm flex items-center gap-1"
                  >
                    <Trophy size={16} /> 정산하기
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map((student) => (
                  <motion.div
                    key={student.id}
                    layout
                    className={`${glassClass} p-4 flex items-center gap-3`}
                  >
                    {/* ✅ 이모지 아바타 - 점수가 바뀌면 살짝 튀어오르는 애니메이션 */}
                    <motion.div
                      key={student.score} // score 바뀔 때 리마운트되어 애니메이션 재생
                      initial={{ scale: 0.6, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0"
                    >
                      {getExpression(student.score)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{student.name}</p>
                      <p className="text-sm text-purple-600 font-bold flex items-center gap-1">
                        <Gem size={14} /> {student.score}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateScore(student.id, 1)}
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center hover:scale-110 transition shadow"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => updateScore(student.id, -1)}
                        className="w-9 h-9 rounded-xl bg-white/60 text-slate-600 flex items-center justify-center hover:scale-110 transition"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ============ RESULT MODE ============ */}
          {mode === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${glassClass} p-6 md:p-8`}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> 보석왕 정산!
                </h2>
                <button
                  onClick={() => setMode('play')}
                  className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 text-sm"
                >
                  돌아가기
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {topThree.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl ${
                      i === 0
                        ? 'bg-gradient-to-r from-yellow-300 to-orange-300'
                        : i === 1
                        ? 'bg-gradient-to-r from-slate-200 to-slate-300'
                        : 'bg-gradient-to-r from-orange-200 to-orange-300'
                    }`}
                  >
                    <div className="text-3xl font-extrabold w-10">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow">
                      {getExpression(s.score)}
                    </div>
                    <p className="flex-1 font-bold text-lg truncate">{s.name}</p>
                    <p className="font-extrabold text-xl flex items-center gap-1">
                      <Gem size={20} className="text-purple-600" /> {s.score}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...students]
                  .sort((a, b) => b.score - a.score)
                  .slice(3)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/40"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl">
                        {getExpression(s.score)}
                      </div>
                      <span className="flex-1 font-medium truncate">{s.name}</span>
                      <span className="font-bold text-purple-600 flex items-center gap-1">
                        <Gem size={14} /> {s.score}
                      </span>
                    </div>
                  ))}
              </div>

              <button
                onClick={resetAll}
                className="w-full mt-6 py-3 rounded-2xl bg-white/40 hover:bg-white/60 font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> 처음부터 다시
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ============================================================ */}
      {/* ✅ 플로팅 정산하기 버튼 (오른쪽에서 스크롤 따라다님 + 살짝 lag) */}
      {/* play 모드일 때만 등장 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mode === 'play' && students.length > 0 && (
          <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <motion.button
              style={{ y: lagY }} // 스크롤과 spring 사이의 차이만큼 살짝 늦게 따라옴
              initial={{ opacity: 0, scale: 0.4, x: 120 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.4, x: 120 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              whileHover={{ scale: 1.12, rotate: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMode('result')}
              className="pointer-events-auto relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white px-4 py-4 rounded-3xl shadow-2xl flex flex-col items-center gap-1 border-2 border-white/50 backdrop-blur-md"
              aria-label="정산하기"
            >
              <Trophy size={28} className="drop-shadow" />
              <span className="text-xs font-extrabold whitespace-nowrap">
                정산하기
              </span>
              {/* 반짝이는 별 장식 */}
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 20, -20, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-yellow-300"
              >
                <Sparkles size={16} fill="currentColor" />
              </motion.span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
