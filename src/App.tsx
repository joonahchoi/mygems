/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Trophy, RotateCcw, Play, UserPlus, Star, ChevronLeft, Minus, Save, BookOpen, Download, Gem, Sparkles } from 'lucide-react';
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

  const getExpression = (score: number) => {
    if (score === 0) return '😐'; // 기본 (0점)
    if (score === 1) return '🙂'; // 1점
    if (score === 2) return '😊'; // 2점
    if (score === 3) return '😄'; // 3점
    if (score === 4) return '😍'; // 4점
    return '😎'; // 5점 이상
  };

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
        className="w-full max-w-4xl flex justify-between items-center mb-8 z-10"
      >
        <h1 className="text-3xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          <Gem className="text-purple-500" /> 주나쌤과 보석들
        </h1>
        {mode === 'activity' && (
          <button
            onClick={() => setMode('input')}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-md rounded-full font-medium transition-colors shadow-sm"
          >
            <ChevronLeft size={18} /> 설정으로
          </button>
        )}
      </motion.header>

      {/* Main Content Area */}
      <main className={`w-full max-w-4xl z-10 flex-grow pb-24 ${glassClass} p-6 md:p-8`}>
        {mode === 'input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
             {/* 설정 화면 UI (생략) - 필요시 기존 코드 유지 */}
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">학생 목록 설정</h2>
                <button
                    onClick={() => setMode('activity')}
                    disabled={students.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    <Play size={18} /> 수업 시작!
                </button>
             </div>
             
             {/* 기존 학생 추가 입력 폼 등 렌더링 */}
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="이름 입력" 
                  className="border p-2 rounded w-full"
                />
                <button onClick={addStudent} className="bg-green-500 text-white px-4 rounded">추가</button>
             </div>

             <ul className="mt-4 space-y-2">
               {students.map(student => (
                  <li key={student.id} className="flex justify-between p-2 bg-white/50 rounded">
                    {student.name}
                    <button onClick={() => removeStudent(student.id)} className="text-red-500"><Trash2 size={16} /></button>
                  </li>
               ))}
             </ul>
          </motion.div>
        )}

        {mode === 'activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
             {/* 상단 Top 3 영역 */}
             <div className="bg-yellow-50 p-4 rounded-xl shadow-inner mb-6">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-yellow-700">
                  <Trophy size={20} /> 명예의 전당
                </h3>
                <div className="flex gap-4">
                  {topThree.map(student => (
                    <div key={`top-${student.id}`} className="flex flex-col items-center">
                       <div className="text-2xl">{getExpression(student.score)}</div>
                       <span className="font-semibold">{student.name}</span>
                       <span className="text-sm text-gray-500">{student.score}점</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* 학생 목록 (점수 주는 부분) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {students.map(student => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white/60 p-4 rounded-2xl flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* ★ 이 부분이 수정된 곳입니다! 이름 첫 글자 대신 표정이 들어갑니다. */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 flex items-center justify-center text-3xl shadow-inner">
                      {getExpression(student.score)}
                    </div>
                    
                    <span className="font-bold text-lg">{student.name}</span>
                    
                    <div className="flex items-center gap-3 bg-white/80 px-3 py-1 rounded-full shadow-inner">
                      <button 
                        onClick={() => updateScore(student.id, -1)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-bold w-6 text-center text-purple-700">{student.score}</span>
                      <button 
                        onClick={() => updateScore(student.id, 1)}
                        className="text-green-500 hover:text-green-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      {/* ★ 둥둥 떠다니는 정산하기 버튼 */}
      {mode === 'activity' && (
        <button 
          onClick={resetScores} // 임시로 점수 초기화를 연결해두었습니다. 원하는 함수로 바꾸세요.
          className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center gap-2 text-lg"
        >
          💰 정산하기
        </button>
      )}

    </div>
  );
}
