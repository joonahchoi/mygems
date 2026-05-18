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
        animate={{ y: 0, opacity
