/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Trophy, RotateCcw, Play, BarChart3, UserPlus, Star, ChevronLeft, Minus, Save, BookOpen, Download, Layout } from 'lucide-react';
import { Student, AppMode, SavedClass } from './types';

// Utility for glassmorphism classes
const glassClass = "bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [mode, setMode] = useState<AppMode>('input');
  const [newName, setNewName] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [showClassManager, setShowClassManager] = useState(false);

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

  // Save to localStorage when students change
  useEffect(() => {
    localStorage.setItem('star-students', JSON.stringify(students));
  }, [students]);

  // Save to localStorage when classes change
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
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) return;

    const newStudents: Student[] = names.map(name => ({
      id: crypto.randomUUID(),
      name,
      score: 0,
    }));

    setStudents([...students, ...newStudents]);
    setBulkInput('');
    setBulkMode(false);
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const saveClass = () => {
    if (!newClassName.trim() || students.length === 0) return;
    const newClass: SavedClass = {
      id: crypto.randomUUID(),
      name: newClassName.trim(),
      students: students.map(s => ({ ...s, score: 0 })) // Reset scores when saving template
    };
    setSavedClasses([...savedClasses, newClass]);
    setNewClassName('');
    alert(`'${newClass.name}' 반이 저장되었습니다!`);
  };

  const loadClass = (cls: SavedClass) => {
    if (confirm(`'${cls.name}' 명단을 불러올까요? 현재 목록은 덮어씌워집니다.`)) {
      setStudents(cls.students.map(s => ({ ...s, score: 0 })));
      setShowClassManager(false);
    }
  };

  const deleteClass = (id: string) => {
    if (confirm('이 반 명단을 삭제하시겠습니까?')) {
      setSavedClasses(savedClasses.filter(c => c.id !== id));
    }
  };

  const updateScore = (id: string, delta: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, score: Math.max(0, s.score + delta) };
      }
      return s;
    }));
  };

  const resetAll = () => {
    if (confirm('모든 데이터를 초기화할까요?')) {
      setStudents([]);
      setMode('input');
      localStorage.removeItem('star-students');
    }
  };

  const resetScores = () => {
    setStudents(students.map(s => ({ ...s, score: 0 })));
  };

  const topThree = useMemo(() => {
    return [...students]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [students]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-400/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mb-8 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/40 rounded-2xl shadow-lg">
            <Trophy className="text-purple-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Star Student Podium
          </h1>
        </div>
        
        {mode !== 'input' && (
          <button 
            onClick={() => setMode('input')}
            className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 transition-all rounded-xl border border-white/50 font-medium"
          >
            <ChevronLeft size={20} /> 학생 관리
          </button>
        )}
      </motion.header>

      <main className="w-full max-w-6xl flex-grow flex flex-col items-center">
        <AnimatePresence mode="wait">
          {mode === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Left Side: Saved Classes */}
              <div className={`${glassClass} p-6 flex flex-col h-full`}>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="text-purple-500" />
                  <h2 className="text-lg font-semibold">저장된 반 명단</h2>
                </div>
                
                <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                  {savedClasses.length === 0 ? (
                    <div className="text-center py-10 px-4 border-2 border-dashed border-white/30 rounded-2xl">
                      <p className="text-sm text-slate-500 italic">저장된 명단이 없습니다. 오른쪽에서 명단을 입력 후 저장해보세요.</p>
                    </div>
                  ) : (
                    savedClasses.map(cls => (
                      <div 
                        key={cls.id}
                        className="group relative bg-white/40 hover:bg-white/60 p-4 rounded-2xl border border-white/50 transition-all cursor-pointer flex justify-between items-center"
                        onClick={() => loadClass(cls)}
                      >
                        <div>
                          <p className="font-bold text-purple-700">{cls.name}</p>
                          <p className="text-xs text-slate-500">{cls.students.length}명의 학생</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClass(cls.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side: Current Student Input (Main) */}
              <div className={`${glassClass} p-8 md:col-span-2`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UserPlus className="text-purple-500" />
                    <h2 className="text-xl font-semibold">현재 학생 목록</h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setBulkMode(!bulkMode)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-all"
                    >
                      {bulkMode ? '직접 입력' : '엑셀 붙여넣기'}
                    </button>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {bulkMode ? (
                    <motion.div
                      key="bulk"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 overflow-hidden"
                    >
                      <p className="text-sm text-slate-500 mb-2">이름을 한 줄에 한 명씩 입력하거나 엑셀에서 복사해 붙여넣으세요.</p>
                      <textarea 
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="김민수&#10;이영희&#10;박지성..."
                        className="w-full h-40 bg-white/50 border border-white/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-purple-400 transition-all text-lg shadow-inner resize-none mb-3"
                      />
                      <button 
                        onClick={addBulkStudents}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={20} /> 목록 전체 추가하기
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="single"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 mb-8 overflow-hidden"
                    >
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                        placeholder="학생 이름을 입력하세요"
                        className="flex-grow bg-white/50 border border-white/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-purple-400 transition-all text-lg shadow-inner"
                      />
                      <button 
                        onClick={addStudent}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Plus size={24} /> 추가
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {students.length === 0 ? (
                    <p className="text-center py-10 text-slate-500 italic">등록된 학생이 없습니다.</p>
                  ) : (
                    students.map(student => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={student.id}
                        className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50 group"
                      >
                        <span className="text-lg font-medium">{student.name}</span>
                        <button 
                          onClick={() => removeStudent(student.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>

                {students.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {/* Save current list section */}
                    <div className="p-4 bg-white/30 rounded-2xl border border-white/40">
                      <p className="text-sm font-semibold mb-3 text-slate-600">이 명단을 반으로 저장하기</p>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          placeholder="반 이름을 입력 (예: 3학년 1반)"
                          className="flex-grow px-4 py-2 bg-white/50 rounded-xl border border-white/50 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                        <button 
                          onClick={saveClass}
                          className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all flex items-center gap-2"
                        >
                          <Save size={16} /> 저장
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setMode('evaluation')}
                        className="flex-grow bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        <Play size={24} /> 오늘 수업 시작
                      </button>
                      <button 
                        onClick={resetAll}
                        className="px-6 py-4 bg-white/30 text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-white/30"
                        title="초기화"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'evaluation' && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col gap-6"
            >
              <div className={`w-full ${glassClass} p-8 overflow-x-auto relative min-h-[60vh]`}>
                <div className="absolute left-10 top-0 bottom-0 w-1 bg-white/30 dash-line" />
                
                <div className="space-y-6 py-8">
                  {students.map((student) => (
                    <div key={student.id} className="relative flex items-center h-16 group">
                      {/* Name placeholder on the left */}
                      <div className="w-32 flex justify-end pr-4 text-slate-500 font-medium z-10">
                        {student.name}
                      </div>

                      {/* Track Area */}
                      <div className="flex-grow relative h-full flex items-center">
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          initial={false}
                          animate={{ 
                            x: student.score * 40, // 40px per "step"
                          }}
                          className="flex items-center gap-4 cursor-pointer"
                        >
                          <div 
                            onClick={() => updateScore(student.id, 1)}
                            className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white hover:scale-110 active:scale-95 transition-transform flex items-center gap-3 select-none"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-bold text-lg">{student.name}</span>
                            <div className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-lg text-sm font-bold">
                              {student.score}
                            </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateScore(student.id, -1);
                            }}
                            className="p-3 bg-white/40 hover:bg-red-100 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/30"
                            title="뒤로 한칸"
                          >
                            <Minus size={16} />
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={resetScores}
                  className="px-8 py-4 bg-white/40 hover:bg-white/60 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                  <RotateCcw size={24} /> 점수 리셋
                </button>
                <button 
                  onClick={() => setMode('result')}
                  className="px-12 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-xl flex items-center gap-3 hover:scale-105 shadow-xl transition-all"
                >
                  <BarChart3 size={28} /> 정산하기
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`w-full max-w-4xl ${glassClass} p-12 flex flex-col items-center overflow-hidden`}
            >
              <h2 className="text-4xl font-extrabold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500 animate-pulse text-center">
                오늘의 명예의 전당
              </h2>

              <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[300px] w-full mt-12 relative">
                {/* 2nd Place */}
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-4 text-center">
                    <p className="text-2xl font-bold text-slate-600">{topThree[1]?.name || '-'}</p>
                    <p className="text-slate-400 font-medium">{topThree[1]?.score || 0} pts</p>
                  </div>
                  <div className="w-24 md:w-32 h-44 bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-inner border-t border-l border-r border-white/30">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-3xl font-black text-white/50">2</div>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="mb-4 text-center transform -translate-y-4">
                    <div className="flex justify-center mb-2">
                       <motion.div
                         animate={{ rotate: [0, -10, 10, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 2 }}
                       >
                         <Trophy className="text-yellow-400" size={48} fill="currentColor" />
                       </motion.div>
                    </div>
                    <p className="text-3xl font-black text-purple-700">{topThree[0]?.name || '-'}</p>
                    <p className="text-purple-500 font-bold">{topThree[0]?.score || 0} pts</p>
                  </div>
                  <div className="w-32 md:w-44 h-64 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl border-t border-l border-r border-white/50 relative">
                     <div className="absolute inset-x-0 top-0 h-4 bg-white/40 rounded-t-2xl blur-sm" />
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-5xl font-black text-white/70">1</div>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-4 text-center">
                    <p className="text-xl font-bold text-slate-500">{topThree[2]?.name || '-'}</p>
                    <p className="text-slate-400 font-medium">{topThree[2]?.score || 0} pts</p>
                  </div>
                  <div className="w-24 md:w-32 h-32 bg-gradient-to-b from-orange-300 to-orange-700 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-inner border-t border-l border-r border-white/30">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black text-white/50">3</div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-16 flex gap-6">
                <button 
                  onClick={() => setMode('evaluation')}
                  className="px-8 py-3 bg-white/40 hover:bg-white/60 rounded-2xl font-bold flex items-center gap-2 transition-all"
                >
                  <ChevronLeft size={20} /> 돌아가기
                </button>
                <button 
                  onClick={() => {
                    resetScores();
                    setMode('evaluation');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <RotateCcw size={20} /> 새 게임 시작
                </button>
              </div>

               {/* Confetti-like decoration */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#ffc0cb', '#da70d6', '#9370db', '#ffd700'][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: `-10px`,
                    }}
                    animate={{
                      y: [0, 800],
                      x: [0, (Math.random() - 0.5) * 200],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-slate-500 text-sm font-medium opacity-70">
        © 2024 Star Student Podium • Created with ✨
      </footer>

      <style>{`
        .dash-line {
          background-image: linear-gradient(to bottom, rgba(255,255,255,0.4) 50%, transparent 50%);
          background-size: 1px 12px;
          background-repeat: repeat-y;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
