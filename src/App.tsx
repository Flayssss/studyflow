import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Zap, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw,
  Search, 
  Bell, 
  CheckCircle2, 
  BrainCircuit, 
  Sword, 
  Shield, 
  ChevronRight, 
  Sparkles, 
  Wand2, 
  BarChart3, 
  Flame,
  Clock,
  Plus,
  History,
  RefreshCw,
  Upload,
  Sparkle,
  FileText,
  Calendar,
  Layers,
  CheckSquare,
  AlertCircle,
  Cpu,
  Bookmark,
  GraduationCap,
  Lightbulb,
  X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface Subject {
  id: string;
  name: string;
  progress: number;
  accuracy: number;
  color: string;
  mastery: string;
}

interface QuestionLog {
  id: string;
  subject: string;
  total: number;
  correct: number;
  xpGained: number;
  timestamp: string;
}

interface SpectralPalette {
  name: string;
  gradient: string;
}

interface SyllabusTopic {
  topicName: string;
  completed: boolean;
  reviewed: boolean;
  exercisesDone: boolean;
  questionsCount: number;
  correctAnswers: number;
  difficulty: number; // 1 a 5
  lastStudied: string;
  revisionsCount: number;
}

interface VerticalizedSubject {
  subjectName: string;
  topics: SyllabusTopic[];
}

interface ExamFolder {
  id: string; 
  title: string;
  institution: string;
  banca: string;
  salary: string;
  vagas: string;
  examSystemDescription: string;
  registrationStart: string;
  registrationEnd: string;
  examDate: string;
  overlapAnalysis: string;
  bancaStyleExplanation: string;
  approvalProbability: number;
  syllabus: VerticalizedSubject[];
}

interface Flashcard {
  id: string;
  type: 'standard' | 'cloze' | 'law' | 'trap' | 'contextualized';
  subject: string;
  banca?: string;
  front: string;
  back: string;
  explanation?: string;
  clozeAnswer?: string;
  difficultyRating: number;
  easeFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReviewDate: Date;
}

const DEFAULT_EXAMS: ExamFolder[] = [
  {
    id: 'sedes',
    title: 'SEDES-DF',
    institution: 'Secretaria de Desenvolvimento Social',
    banca: 'IADES',
    salary: 'R$ 5.480,00',
    vagas: '120 + CR',
    examSystemDescription: 'Múltipla escolha (5 alternativas) com pontuação tradicional de acertos e alto peso nas específicas.',
    registrationStart: '2026-05-10',
    registrationEnd: '2026-06-15',
    examDate: '2026-08-26',
    overlapAnalysis: 'Alta compatibilidade (78%) com seu progresso atual de estudo. Ótimo aproveitamento de Língua Portuguesa e D. Administrativo.',
    bancaStyleExplanation: 'A banca IADES prioriza a literalidade das leis e do regimento interno de assistência social.',
    approvalProbability: 72,
    syllabus: [
      {
        subjectName: 'Língua Portuguesa',
        topics: [
          { topicName: 'Compreensão e interpretação de textos', completed: true, reviewed: true, exercisesDone: true, questionsCount: 45, correctAnswers: 39, difficulty: 2, lastStudied: 'Ontem', revisionsCount: 3 },
          { topicName: 'Ortografia oficial, acentuação e crase', completed: true, reviewed: false, exercisesDone: true, questionsCount: 20, correctAnswers: 14, difficulty: 3, lastStudied: 'Há 2 dias', revisionsCount: 1 },
          { topicName: 'Sintaxe da oração e do período', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 },
        ]
      },
      {
        subjectName: 'Direito Administrativo',
        topics: [
          { topicName: 'Organização administrativa do Estado', completed: true, reviewed: true, exercisesDone: true, questionsCount: 30, correctAnswers: 26, difficulty: 2, lastStudied: 'Há 3 dias', revisionsCount: 2 },
          { topicName: 'Atos administrativos: conceito e requisitos', completed: false, reviewed: false, exercisesDone: false, questionsCount: 5, correctAnswers: 2, difficulty: 5, lastStudied: 'Há 5 dias', revisionsCount: 0 }
        ]
      }
    ]
  },
  {
    id: 'der',
    title: 'DER-DF',
    institution: 'Departamento de Estradas de Rodagem do DF',
    banca: 'IADES',
    salary: 'R$ 7.200,00',
    vagas: '85',
    examSystemDescription: 'Múltipla escolha tradicional com peso maior nas disciplinas de legislação rodoviária e trânsito.',
    registrationStart: '2026-08-01',
    registrationEnd: '2026-09-05',
    examDate: '2026-10-25',
    overlapAnalysis: 'Compatibilidade de 61% com seu progresso. Alta sinergia em Português e Administrativo, exige estudo de Código de Trânsito Brasileiro.',
    bancaStyleExplanation: 'IADES tende a cobrar literalidade extrema do Código de Trânsito Brasileiro.',
    approvalProbability: 58,
    syllabus: [
      {
        subjectName: 'Língua Portuguesa',
        topics: [
          { topicName: 'Significação das palavras e sinonímia', completed: true, reviewed: true, exercisesDone: true, questionsCount: 15, correctAnswers: 12, difficulty: 1, lastStudied: 'Há 4 dias', revisionsCount: 1 },
          { topicName: 'Emprego das classes de palavras', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0 }
        ]
      },
      {
        subjectName: 'Legislação de Trânsito',
        topics: [
          { topicName: 'Código de Trânsito Brasileiro (CTB) - Introdução', completed: false, reviewed: false, exercisesDone: false, questionsCount: 10, correctAnswers: 4, difficulty: 4, lastStudied: 'Há 6 dias', revisionsCount: 0 },
          { topicName: 'Normas Gerais de Circulação e Conduta', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0 }
        ]
      }
    ]
  }
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Direito Administrativo', progress: 65, accuracy: 72, color: '#6366f1', mastery: 'Adepto' },
  { id: '2', name: 'Língua Portuguesa', progress: 88, accuracy: 91, color: '#10b981', mastery: 'Mestre' },
  { id: '3', name: 'Direito Constitucional', progress: 42, accuracy: 68, color: '#8b5cf6', mastery: 'Iniciado' },
];

const INITIAL_LOGS: QuestionLog[] = [
  { id: 'l1', subject: 'Direito Administrativo', total: 20, correct: 16, xpGained: 240, timestamp: 'Há 2 horas' },
  { id: 'l2', subject: 'Língua Portuguesa', total: 15, correct: 14, xpGained: 210, timestamp: 'Ontem' },
];

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'f1',
    type: 'standard',
    subject: 'Direito Administrativo',
    front: 'O que é poder constituinte derivado reformador?',
    back: 'É o poder de modificar a Constituição Federal por meio de um procedimento formal e solene, previamente estabelecido pelo poder constituinte originário, respeitando limites materiais (cláusulas pétreas), formais e circunstanciais.',
    explanation: 'Dica do Professor: Memorize que o constituinte derivado é secundário, condicionado e limitado.',
    difficultyRating: 2,
    easeFactor: 2.5,
    repetitions: 1,
    intervalDays: 1,
    nextReviewDate: new Date()
  },
  {
    id: 'f2',
    type: 'cloze',
    subject: 'Direito Constitucional',
    front: 'A Constituição pode ser emendada mediante proposta de {{c1::um terço, no mínimo, dos membros da Câmara dos Deputados ou do Senado Federal}}.',
    back: 'A Constituição Federal exige um quórum qualificado mínimo de 1/3 das casas legislativas para propor emendas constitucionais.',
    clozeAnswer: 'um terço, no mínimo, dos membros da Câmara dos Deputados ou do Senado Federal',
    explanation: 'Pegadinha Clássica: As bancas costumam trocar "1/3" por "maioria absoluta" na iniciativa. Atenção!',
    difficultyRating: 3,
    easeFactor: 2.2,
    repetitions: 0,
    intervalDays: 0,
    nextReviewDate: new Date()
  }
];

const CHART_DATA = [
  { name: 'Sem 1', xp: 1200 },
  { name: 'Sem 2', xp: 1900 },
  { name: 'Sem 3', xp: 1600 },
  { name: 'Sem 4', xp: 2400 },
  { name: 'Sem 5', xp: 2200 },
  { name: 'Sem 6', xp: 2900 },
];

const radarData = [
  { subject: 'D. Adm', A: 70, full: 100 },
  { subject: 'Português', A: 90, full: 100 },
  { subject: 'Const', A: 60, full: 100 },
  { subject: 'RLM', A: 40, full: 100 },
  { subject: 'Informática', A: 50, full: 100 },
];

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
);

const WizardAvatar = ({ 
  level, 
  vitality, 
  streak, 
  imageUrl, 
  palette 
}: { 
  level: number; 
  vitality: number; 
  streak: number; 
  imageUrl: string | null; 
  palette: SpectralPalette;
}) => {
  const isWeak = vitality < 50;
  const colorPercentage = Math.min(100, level * 10);

  return (
    <div className="relative flex flex-col items-center group">
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-44 h-44 flex items-center justify-center"
      >
        <AnimatePresence>
          {streak > 5 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1.15, rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20 blur-sm bg-gradient-to-tr from-indigo-500/5 to-transparent"
            />
          )}
        </AnimatePresence>

        <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.2)] bg-slate-950 flex items-center justify-center">
          {imageUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={imageUrl} 
                alt="Wizard Avatar" 
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  filter: `grayscale(${Math.max(0, 100 - colorPercentage)}%)`
                }}
              />
              <div 
                className="absolute inset-0 mix-blend-color pointer-events-none opacity-65"
                style={{
                  background: palette.gradient
                }}
              />
            </div>
          ) : (
            <svg viewBox="0 0 200 200" className={`w-32 h-32 drop-shadow-2xl ${isWeak ? 'grayscale opacity-70' : ''}`}>
              <path d="M60 180 L100 80 L140 180 Z" fill={level > 10 ? "#312e81" : "#1e1b4b"} stroke="#6366f1" strokeWidth="2" />
              <circle cx="100" cy="90" r="25" fill="#fecaca" />
              <circle cx="92" cy="85" r="2.5" fill="#1e1b4b" />
              <circle cx="108" cy="85" r="2.5" fill="#1e1b4b" />
              <path d="M92 98 Q100 105 108 98" stroke="#1e1b4b" fill="none" strokeWidth="1.5" />
              <path d="M50 75 L100 10 L150 75 Z" fill="#3730a3" />
              <path d="M45 70 Q100 85 155 70" stroke="#6366f1" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          )}

          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full pointer-events-none animate-pulse" />
        </div>

        <div className="absolute -bottom-2 bg-indigo-600 border border-indigo-400 text-white font-black px-3 py-1 rounded-full text-[10px] shadow-lg">
          Lvl {level}
        </div>
      </motion.div>

      <div className="mt-4 text-center">
        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
          {level < 5 ? 'Aprendiz' : level < 15 ? 'Mago de Elite' : 'Arquimago Supremo'}
        </span>
        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
          Alquimia: <span className="text-indigo-400 font-extrabold">{colorPercentage}% Colorido</span>
        </p>
        <p className="text-[9px] text-slate-500 italic mt-0.5">Sintonia: {palette.name}</p>
      </div>
    </div>
  );
};

const FocusTimer = ({ onComplete }: { onComplete: (xp: number, stat: 'int' | 'str') => void }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (sessionType === 'study') {
        onComplete(400, 'int');
        setSessionType('break');
        setSeconds(5 * 60);
      } else {
        setSessionType('study');
        setSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, sessionType, onComplete]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(sessionType === 'study' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-[32px] border border-white/5 relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
        <Clock size={12} className="text-indigo-400" />
        {sessionType === 'study' ? 'Sessão de Foco Ativo' : 'Intervalo de Meditação'}
      </div>

      <h2 className="text-7xl font-mono font-black text-white tracking-tighter my-6 tabular-nums">
        {formatTime(seconds)}
      </h2>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
            isActive 
              ? 'bg-slate-800 text-white hover:bg-slate-700' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('studyflow_profile');
    return local ? JSON.parse(local) : {
      name: "Mago Willian Nunes",
      level: 12,
      xp: 1850,
      maxXp: 3000,
      streak: 15,
      vitality: 90,
      stats: { int: 168, str: 112, end: 94 }
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'concursos' | 'flashcards' | 'subjects' | 'lab' | 'timer' | 'chronicles'>('dashboard');
  const [studyMode, setStudyMode] = useState<'iniciante' | 'guerra'>('iniciante');
  
  const [avatarImage, setAvatarImage] = useState<string | null>(() => {
    return localStorage.getItem('studyflow_avatar') || null;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const local = localStorage.getItem('studyflow_subjects');
    return local ? JSON.parse(local) : INITIAL_SUBJECTS;
  });

  const [logs, setLogs] = useState<QuestionLog[]>(() => {
    const local = localStorage.getItem('studyflow_logs');
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });

  const [examFolders, setExamFolders] = useState<ExamFolder[]>(() => {
    const local = localStorage.getItem('studyflow_exams');
    return local ? JSON.parse(local) : DEFAULT_EXAMS;
  });

  const [activeExamId, setActiveExamId] = useState(() => {
    const local = localStorage.getItem('studyflow_active_exam');
    return local || 'sedes';
  });

  // Input processing states
  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiNotification, setAiNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [spectralPalette, setSpectralPalette] = useState<SpectralPalette>(() => {
    const local = localStorage.getItem('studyflow_palette');
    return local ? JSON.parse(local) : {
      name: "Nebulosa Cósmica do Conhecimento",
      gradient: "linear-gradient(135deg, hsl(230, 80%, 50%), hsl(300, 80%, 50%))"
    };
  });

  // Anki interactive state
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const local = localStorage.getItem('studyflow_flashcards');
    return local ? JSON.parse(local) : INITIAL_FLASHCARDS;
  });

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [bancaFilter, setBancaFilter] = useState<string>('TODOS');
  const [ankiInputText, setAnkiInputText] = useState<string>('');
  const [selectedBanca, setSelectedBanca] = useState<string>('IADES');
  const [isAnkiGenerating, setIsAnkiGenerating] = useState<boolean>(false);
  const [clozeRevealed, setClozeRevealed] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('studyflow_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studyflow_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('studyflow_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('studyflow_exams', JSON.stringify(examFolders));
  }, [examFolders]);

  useEffect(() => {
    localStorage.setItem('studyflow_active_exam', activeExamId);
  }, [activeExamId]);

  useEffect(() => {
    localStorage.setItem('studyflow_avatar', avatarImage || '');
  }, [avatarImage]);

  useEffect(() => {
    localStorage.setItem('studyflow_palette', JSON.stringify(spectralPalette));
  }, [spectralPalette]);

  useEffect(() => {
    localStorage.setItem('studyflow_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    };
    document.body.appendChild(script);
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAiProcessing(true);
    setAiNotification({ message: 'Lendo e decodificando edital em PDF...', type: 'info' });
    
    try {
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        // @ts-ignore
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        const pagesToRead = Math.min(pdf.numPages, 10);
        for (let i = 1; i <= pagesToRead; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setAiInputText(fullText);
        setAiNotification({ message: `PDF lido com sucesso (${pagesToRead} páginas extraídas). Agora clique no botão abaixo para processar!`, type: 'success' });
        setIsAiProcessing(false);
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      setAiNotification({ message: 'Erro ao analisar PDF. Usando fallback de texto.', type: 'error' });
      setIsAiProcessing(false);
    }
  };

  const activeExam = useMemo(() => {
    return examFolders.find(e => e.id === activeExamId) || examFolders[0];
  }, [examFolders, activeExamId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarImage(reader.result);
          const hue1 = Math.floor(Math.random() * 360);
          const hue2 = (hue1 + 120) % 360;
          const names = [
            "Cristal de Éter", "Nebulosa de Orion", "Fogo de Fênix", 
            "Sabedoria Dracônica", "Tempestade Estelar", "Mana da Floresta"
          ];
          const randomName = names[Math.floor(Math.random() * names.length)] + ` #${Math.floor(Math.random() * 900 + 100)}`;
          
          setSpectralPalette({
            name: randomName,
            gradient: `linear-gradient(135deg, hsl(${hue1}, 85%, 55%), hsl(${hue2}, 85%, 45%))`
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGainXpAndStats = (xpGain: number, statType: 'int' | 'str') => {
    setProfile((prev) => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      const updatedStats = { ...prev.stats };

      if (statType === 'int') updatedStats.int += 5;
      if (statType === 'str') updatedStats.str += 5;
      updatedStats.end += 2;

      while (newXp >= newMaxXp) {
        newLevel++;
        newXp -= newMaxXp;
        newMaxXp = Math.floor(newMaxXp * 1.25);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        stats: updatedStats,
        vitality: Math.min(100, prev.vitality + 8)
      };
    });
  };

  const handleAddQuestionLog = (subjectId: string, total: number, correct: number) => {
    if (total <= 0 || correct < 0 || correct > total) return;
    
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newAccuracy = Math.round((correct / total) * 100);
    const xpCalculated = correct * 15 + (total - correct) * 5;

    const newLogEntry: QuestionLog = {
      id: `l_${Date.now()}`,
      subject: subject.name,
      total,
      correct,
      xpGained: xpCalculated,
      timestamp: 'Agora mesmo'
    };

    setLogs(prev => [newLogEntry, ...prev]);

    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const totalAccuracy = Math.round((s.accuracy + newAccuracy) / 2);
        return {
          ...s,
          progress: Math.min(100, s.progress + Math.round(total / 4)),
          accuracy: totalAccuracy,
          mastery: totalAccuracy > 85 ? 'Mestre' : totalAccuracy > 65 ? 'Adepto' : 'Iniciado'
        };
      }
      return s;
    }));

    handleGainXpAndStats(xpCalculated, 'str');
  };

  const handleToggleSyllabusMetric = (
    examId: string,
    subjectName: string,
    topicName: string,
    metric: 'completed' | 'reviewed' | 'exercisesDone'
  ) => {
    setExamFolders(prevExams => 
      prevExams.map(exam => {
        if (exam.id !== examId) return exam;

        const updatedSyllabus = exam.syllabus.map(subj => {
          if (subj.subjectName !== subjectName) return subj;

          const updatedTopics = subj.topics.map(topic => {
            if (topic.topicName !== topicName) return topic;
            const nextValue = !topic[metric];
            let increment = 0;
            if (nextValue) {
              increment = 60;
              if (metric === 'exercisesDone') {
                topic.questionsCount += 10;
                topic.correctAnswers += 8;
              }
              handleGainXpAndStats(increment, 'int');
            }
            return { 
              ...topic, 
              [metric]: nextValue,
              lastStudied: nextValue ? 'Hoje' : topic.lastStudied,
              revisionsCount: metric === 'reviewed' && nextValue ? topic.revisionsCount + 1 : topic.revisionsCount
            };
          });
          return { ...subj, topics: updatedTopics };
        });
        
        let totalCount = 0;
        let checkedCount = 0;
        updatedSyllabus.forEach(s => s.topics.forEach(t => {
          totalCount += 3;
          if (t.completed) checkedCount++;
          if (t.reviewed) checkedCount++;
          if (t.exercisesDone) checkedCount++;
        }));
        const calculatedProbability = Math.min(98, Math.max(10, Math.round((checkedCount / (totalCount || 1)) * 100)));

        return { 
          ...exam, 
          syllabus: updatedSyllabus,
          approvalProbability: calculatedProbability
        };
      })
    );
  };

  const handleTriggerAiEditalAnalysis = async () => {
    if (!aiInputText.trim()) {
      setAiNotification({
        message: 'Por favor, insira ou cole o conteúdo do edital para o Oráculo ler.',
        type: 'info'
      });
      return;
    }

    setIsAiProcessing(true);
    setAiNotification({ message: 'Conectando ao núcleo cognitivo do Gemini...', type: 'info' });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analise as informações programáticas e regras do edital a seguir: "${aiInputText}". Extraia e responda exclusivamente em JSON formatado de acordo com a estrutura do aplicativo.` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                "examName": { "type": "STRING" },
                "banca": { "type": "STRING" },
                "salary": { "type": "STRING" },
                "vagas": { "type": "STRING" },
                "examSystemDescription": { "type": "STRING" },
                "registrationStart": { "type": "STRING" },
                "registrationEnd": { "type": "STRING" },
                "examDate": { "type": "STRING" },
                "overlapAnalysis": { "type": "STRING" },
                "bancaStyleExplanation": { "type": "STRING" },
                "syllabus": {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      "subjectName": { "type": "STRING" },
                      "topics": {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            "topicName": { "type": "STRING" }
                          },
                          required: ["topicName"]
                        }
                      }
                    },
                    required: ["subjectName", "topics"]
                  }
                }
              },
              required: ["examName", "banca", "salary", "vagas", "examSystemDescription", "registrationStart", "registrationEnd", "examDate", "overlapAnalysis", "bancaStyleExplanation", "syllabus"]
            }
          }
        })
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        const parsed = JSON.parse(rawText);
        const newExamId = parsed.examName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const mappedSyllabus: VerticalizedSubject[] = parsed.syllabus.map((s: any) => ({
          subjectName: s.subjectName,
          topics: s.topics.map((t: any) => ({
            topicName: t.topicName,
            completed: false,
            reviewed: false,
            exercisesDone: false,
            questionsCount: 0,
            correctAnswers: 0,
            difficulty: 3,
            lastStudied: 'Nunca',
            revisionsCount: 0
          }))
        }));

        const newExamFolder: ExamFolder = {
          id: newExamId,
          title: parsed.examName,
          institution: parsed.examName + ' Corporation',
          banca: parsed.banca,
          salary: parsed.salary,
          vagas: parsed.vagas,
          examSystemDescription: parsed.examSystemDescription,
          registrationStart: parsed.registrationStart,
          registrationEnd: parsed.registrationEnd,
          examDate: parsed.examDate,
          overlapAnalysis: parsed.overlapAnalysis,
          bancaStyleExplanation: parsed.bancaStyleExplanation,
          approvalProbability: 15,
          syllabus: mappedSyllabus
        };

        setExamFolders(prev => [newExamFolder, ...prev]);
        setActiveExamId(newExamId);
        setAiNotification({ message: `Sucesso! Subpasta de estudo para "${parsed.examName}" configurada e estruturada.`, type: 'success' });
        setAiInputText('');
        handleGainXpAndStats(600, 'int');
      } else {
        throw new Error("API return empty text");
      }
    } catch (err) {
      console.warn("Using offline fallback parser", err);
      
      const text = aiInputText.toLowerCase();
      let parsedTitle = 'Novo Concurso';
      let parsedInstitution = 'Órgão de Governo';
      let parsedBanca = 'A Definir';
      let parsedSalary = 'R$ 6.200,00';
      let parsedVagas = '80 + CR';
      let parsedExamDate = '2026-11-20';
      let parsedRegistrationStart = '2026-06-01';
      let parsedRegistrationEnd = '2026-07-15';
      let parsedSystemDesc = 'Múltipla escolha tradicional com 5 alternativas.';
      let parsedBancaStyle = 'A banca exige leitura atenta de regimentos e decretos.';
      let parsedSyllabus: VerticalizedSubject[] = [];

      // 1. Detect SEDES-DF (Heurística avançada de Assistência Social e DF)
      if (text.includes('sedes') || text.includes('desenvolvimento social') || text.includes('assistência social') || text.includes('loas') || text.includes('suas')) {
        parsedTitle = 'SEDES-DF';
        parsedInstitution = 'Secretaria de Desenvolvimento Social do DF';
        parsedBanca = text.includes('iades') ? 'IADES' : 'IADES (Previsto)';
        parsedSalary = 'R$ 5.480,00';
        parsedVagas = '120 + CR';
        parsedSystemDesc = 'Prova objetiva de 50 questões de múltipla escolha (A, B, C, D, E) com alto peso em assistência social.';
        parsedBancaStyle = 'A banca IADES prioriza a literalidade da Lei Orgânica de Assistência Social (LOAS) e do regimento interno.';
        parsedSyllabus = [
          {
            subjectName: 'Conhecimentos Gerais (SEDES)',
            topics: [
              { topicName: 'Lei Orgânica de Assistência Social (LOAS)', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Sistema Único de Assistência Social (SUAS)', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Política Nacional de Assistência Social (PNAS)', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          },
          {
            subjectName: 'Direito e Legislação',
            topics: [
              { topicName: 'Estatuto da Criança e do Adolescente (ECA)', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Estatuto do Idoso', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 2, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          }
        ];
      } 
      // 2. Detect DER-DF
      else if (text.includes('der') || text.includes('rodagem') || text.includes('trânsito') || text.includes('ctb')) {
        parsedTitle = 'DER-DF';
        parsedInstitution = 'Departamento de Estradas de Rodagem do DF';
        parsedBanca = 'IADES';
        parsedSalary = 'R$ 7.200,00';
        parsedVagas = '85';
        parsedSystemDesc = 'Múltipla escolha com forte peso no Código de Trânsito Brasileiro.';
        parsedBancaStyle = 'Exige memorização de regras gerais de circulação e conduta e resoluções do CONTRAN.';
        parsedSyllabus = [
          {
            subjectName: 'Legislação Rodoviária',
            topics: [
              { topicName: 'Código de Trânsito Brasileiro (CTB)', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Normas Gerais de Circulação e Conduta', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          }
        ];
      }
      // 3. Detect CLDF
      else if (text.includes('cldf') || text.includes('câmara legislativa') || text.includes('parlamentar')) {
        parsedTitle = 'CLDF';
        parsedInstitution = 'Câmara Legislativa do Distrito Federal';
        parsedBanca = 'FGV';
        parsedSalary = 'R$ 16.500,00';
        parsedVagas = '42';
        parsedSystemDesc = 'Múltipla escolha de alta complexidade com enunciados interpretativos longos.';
        parsedBancaStyle = 'A FGV foca em análise pesada de casos práticos constitucionais e exegese gramatical.';
        parsedSyllabus = [
          {
            subjectName: 'Regimento Interno',
            topics: [
              { topicName: 'Processo Legislativo Constitucional', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Regimento Interno da CLDF', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          }
        ];
      }
      else {
        parsedTitle = 'Novo Concurso';
        parsedInstitution = 'Órgão Geral';
        parsedBanca = 'Padrão';
        parsedSyllabus = [
          {
            subjectName: 'Matérias Gerais',
            topics: [
              { topicName: 'Língua Portuguesa Instrumental', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Direito Administrativo Aplicado', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          }
        ];
      }

      const randomId = 'custom_' + Date.now();
      const mockResult: ExamFolder = {
        id: randomId,
        title: parsedTitle,
        institution: parsedInstitution,
        banca: parsedBanca,
        salary: parsedSalary,
        vagas: parsedVagas,
        examSystemDescription: parsedSystemDesc,
        registrationStart: parsedRegistrationStart,
        registrationEnd: parsedRegistrationEnd,
        examDate: parsedExamDate,
        overlapAnalysis: `Sua preparação atual possui alta compatibilidade com o edital do ${parsedTitle}.`,
        bancaStyleExplanation: parsedBancaStyle,
        approvalProbability: 45,
        syllabus: parsedSyllabus
      };

      setExamFolders(prev => [mockResult, ...prev]);
      setActiveExamId(randomId);
      setAiNotification({ message: `Concurso "${parsedTitle}" mapeado e adicionado com sucesso!`, type: 'success' });
      setAiInputText('');
      handleGainXpAndStats(600, 'int');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleGenerateAnkiCards = async () => {
    if (!ankiInputText.trim()) {
      alert("Adicione um resumo, lei seca ou anotação para invocar.");
      return;
    }

    setIsAnkiGenerating(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Gere uma lista de flashcards baseada no seguinte conteúdo: "${ankiInputText}". Estilo da banca: "${selectedBanca}".` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  "type": { "type": "STRING" },
                  "subject": { "type": "STRING" },
                  "banca": { "type": "STRING" },
                  "front": { "type": "STRING" },
                  "back": { "type": "STRING" },
                  "explanation": { "type": "STRING" },
                  "clozeAnswer": { "type": "STRING" }
                },
                required: ["type", "subject", "front", "back", "explanation"]
              }
            }
          }
        })
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        const parsedCards = JSON.parse(rawText);
        const mapped: Flashcard[] = parsedCards.map((c: any, index: number) => ({
          id: `ai_card_${Date.now()}_${index}`,
          type: c.type || 'standard',
          subject: c.subject || 'Geral',
          banca: c.banca || selectedBanca,
          front: c.front,
          back: c.back,
          explanation: c.explanation,
          clozeAnswer: c.clozeAnswer || '',
          difficultyRating: 3,
          easeFactor: 2.5,
          repetitions: 0,
          intervalDays: 1,
          nextReviewDate: new Date()
        }));

        setFlashcards(prev => [...mapped, ...prev]);
        setAnkiInputText('');
        handleGainXpAndStats(300, 'int');
        alert(`Sucesso! O Oráculo gerou ${mapped.length} Flashcards Inteligentes.`);
      } else {
        throw new Error("API return empty text");
      }
    } catch (e) {
      console.warn("Anki AI Fallback active", e);
      const fallback: Flashcard[] = [
        {
          id: `fallback_${Date.now()}_1`,
          type: 'trap',
          subject: 'Direito Constitucional',
          banca: selectedBanca,
          front: 'A investidura em cargo ou emprego público independe de aprovação prévia em concurso público?',
          back: 'ERRADO. A regra constitucional do Art. 37, II exige a aprovação em concurso, exceto para as nomeações de cargo em comissão declarados em lei de livre nomeação.',
          explanation: 'Meteoro das Bancas: A exceção cai mais que a regra! "Cargos em comissão" não passam por concurso.',
          difficultyRating: 3,
          easeFactor: 2.5,
          repetitions: 0,
          intervalDays: 1,
          nextReviewDate: new Date()
        }
      ];
      setFlashcards(prev => [...fallback, ...prev]);
      setAnkiInputText('');
      handleGainXpAndStats(150, 'int');
    } finally {
      setIsAnkiGenerating(false);
    }
  };

  const handleRateAnkiCard = (rating: 1 | 2 | 3 | 4) => {
    const updatedCards = [...flashcards];
    const card = updatedCards[activeCardIndex];

    if (!card) return;

    let newEaseFactor = card.easeFactor;
    let newRepetitions = card.repetitions;
    let newInterval = card.intervalDays;

    if (rating === 1) {
      newRepetitions = 0;
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
      handleGainXpAndStats(20, 'str');
    } else {
      newRepetitions += 1;
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 3;
      } else {
        newInterval = Math.round(card.intervalDays * card.easeFactor);
      }

      if (rating === 2) {
        newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
        handleGainXpAndStats(80, 'str');
      } else if (rating === 3) {
        handleGainXpAndStats(150, 'int');
      } else if (rating === 4) {
        newEaseFactor = card.easeFactor + 0.15;
        handleGainXpAndStats(250, 'int');
      }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    card.easeFactor = parseFloat(newEaseFactor.toFixed(2));
    card.repetitions = newRepetitions;
    card.intervalDays = newInterval;
    card.nextReviewDate = nextReview;

    setFlashcards(updatedCards);
    setIsFlipped(false);
    setClozeRevealed(false);

    if (activeCardIndex < updatedCards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0);
    }
  };

  const prefillSamplePreset = (type: 'sedes' | 'der' | 'cldf') => {
    const textPresets = {
      sedes: "CONCURSO SECRETARIA DE DESENVOLVIMENTO SOCIAL (SEDES-DF). Banca IADES. Prova dia 26/08/2026. Inscrições de 10/05/2026 a 15/06/2026. Salário R$ 5.480,00. Vagas: 120 + CR. Matérias: Compreensão de texto, concordância verbal, Lei Orgânica da Assistência Social (LOAS), SUAS.",
      der: "DEPARTAMENTO DE ESTRADAS DE RODAGEM DO DF (DER-DF). Banca IADES. Prova dia 25/10/2026. Salário R$ 7.200,00. Vagas: 85. Conteúdo: Legislação de Trânsito específica de estradas, CTB, sinalização e Português.",
      cldf: "CÂMARA LEGISLATIVA DO DF (CLDF). Banca FGV. Provas dia 06/12/2026. Salário R$ 16.500,00. Vagas: 42. Matérias: Regimento Interno, Processo Legislativo Constitucional, Direitos e Garantias Fundamentais, Organização dos Poderes."
    };
    setAiInputText(textPresets[type]);
  };

  const filteredCards = useMemo(() => {
    if (bancaFilter === 'TODOS') return flashcards;
    return flashcards.filter(c => c.banca === bancaFilter || c.subject === bancaFilter);
  }, [flashcards, bancaFilter]);

  const activeCard = filteredCards[activeCardIndex] || filteredCards[0];

  const renderClozeText = (text: string, reveal: boolean) => {
    const regex = /\{\{c1::(.*?)\}\}/g;
    if (reveal) {
      return text.replace(regex, "<strong>$1</strong>");
    }
    return text.replace(regex, `<span class="bg-indigo-600/30 border border-dashed border-indigo-500 px-3 py-1 rounded mx-1 text-indigo-200 cursor-pointer hover:bg-indigo-600/50 transition-all font-black text-xs">REVELAR CLOZE (CLIQUE AQUI)</span>`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Sidebar - Archmage Premium Navigation */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 hidden lg:flex bg-[#020617] h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wand2 size={20} className="text-white" />
          </div>
          <span className="font-black text-xl text-white italic tracking-tighter">STUDYFLOW</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-bold text-xs text-left">Painel de Alquimia</span>
          </button>

          <button 
            onClick={() => setActiveTab('concursos')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'concursos' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers size={18} />
              <span className="font-bold text-xs text-left">Central Concursos</span>
            </div>
            <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">IA</span>
          </button>

          <button 
            onClick={() => setActiveTab('flashcards')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'flashcards' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap size={18} />
              <span className="font-bold text-xs text-left">Grimório Anki AI</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">SRS</span>
          </button>

          <button 
            onClick={() => setActiveTab('subjects')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'subjects' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <BookOpen size={18} />
            <span className="font-bold text-xs text-left">Grimório de Matérias</span>
          </button>

          <button 
            onClick={() => setActiveTab('lab')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'lab' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            <span className="font-bold text-xs text-left">Laboratório de IA</span>
          </button>

          <button 
            onClick={() => setActiveTab('timer')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'timer' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Clock size={18} />
            <span className="font-bold text-xs text-left">Modo Foco Arcano</span>
          </button>

          <button 
            onClick={() => setActiveTab('chronicles')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'chronicles' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-white'
            }`}
          >
            <History size={18} />
            <span className="font-bold text-xs text-left">Crônicas de Estudos</span>
          </button>
        </nav>

        {/* Level progress bar */}
        <div className="mt-auto border-t border-white/5 pt-6">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase mb-2">
              <span>Nível {profile.level}</span>
              <span>{Math.round((profile.xp / profile.maxXp) * 100)}%</span>
            </div>
            <ProgressBar progress={(profile.xp / profile.maxXp) * 100} color="#6366f1" />
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <Sparkle size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Estação de Trabalho do Arquimago</h2>
            
            {/* Cognitive Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 ml-4">
              <button 
                onClick={() => setStudyMode('iniciante')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                  studyMode === 'iniciante' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciante
              </button>
              <button 
                onClick={() => setStudyMode('guerra')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                  studyMode === 'guerra' ? 'bg-red-600/30 text-red-400 border border-red-500/20 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Modo Guerra
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Flame size={14} className="text-amber-500" fill="currentColor" />
              <span className="text-[10px] font-black text-amber-500">{profile.streak} DIAS SEGUIDOS</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400">
              <Bell size={18} />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD PANEL */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Cognitive Mentoring Notification Card */}
                {studyMode === 'iniciante' ? (
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start gap-3.5">
                    <BrainCircuit size={22} className="text-indigo-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">Explicação do Oráculo (Modo Iniciante)</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bem-vindo ao seu ecossistema, Willian Nunes. Este painel integra a estatística fria dos concursos com a inteligência do seu Mago do Conhecimento. Cada progresso e simulado injeta cor (Alquimia Espectral) na sua foto e evolui sua Inteligência (INT). Concentre-se no edital do <span className="text-indigo-400 font-bold">{activeExam.title}</span> hoje!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-3.5">
                    <Target size={22} className="text-red-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-0.5">Retícula Militar de Estudos (Modo Guerra Ativo)</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Foco exclusivo em reta final do edital <span className="font-bold text-white">{activeExam.title}</span>. Menos teoria, foco total em simulados dinâmicos e cartões tipo Trap da banca organizadora. Revisões pendentes marcadas no topo. Não pare agora!
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Dynamic RPG Avatar Profile container */}
                  <GlassCard className="lg:col-span-4 p-8 flex flex-col items-center bg-gradient-to-b from-indigo-500/5 to-transparent relative">
                    <div className="absolute top-4 right-4">
                      <label className="cursor-pointer p-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all rounded-xl text-[10px] font-black text-indigo-400 flex items-center gap-1">
                        <Upload size={12} />
                        Conjurar Mago
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    <WizardAvatar 
                      level={profile.level} 
                      vitality={profile.vitality} 
                      streak={profile.streak} 
                      imageUrl={avatarImage} 
                      palette={spectralPalette}
                    />
                    
                    <h2 className="text-lg font-black text-white mt-4">{profile.name}</h2>

                    {/* Character RPG Stats */}
                    <div className="w-full grid grid-cols-3 gap-4 mt-6 border-t border-white/5 pt-6">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inteligência (INT)</p>
                        <p className="text-base font-bold text-indigo-400">{profile.stats.int}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Poder Físico (STR)</p>
                        <p className="text-base font-bold text-rose-400">{profile.stats.str}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vitalidade</p>
                        <p className="text-base font-bold text-emerald-400">{profile.vitality}%</p>
                      </div>
                    </div>

                    <div className="w-full mt-6 space-y-2.5">
                      <button 
                        onClick={() => handleGainXpAndStats(300, 'int')}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <BrainCircuit size={14} /> Estudar Grimório (+300 XP)
                      </button>
                      <button 
                        onClick={() => handleGainXpAndStats(150, 'str')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Sword size={14} /> Batalhar Questões (+150 XP)
                      </button>
                    </div>
                  </GlassCard>

                  {/* Visual Learning Evolution Area Chart */}
                  <GlassCard className="lg:col-span-8 p-8">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-md font-bold text-white">Evolução Cósmica</h3>
                        <p className="text-xs text-slate-500">Curva de ganho de XP e evolução do Mago</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">Canalização Ativa</span>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA}>
                          <defs>
                            <linearGradient id="glowColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '11px' }}
                          />
                          <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#glowColor)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                </div>

                {/* Subfolder Switches Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-6">
                    <GlassCard className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white">Subpastas de Concursos Ativos</h3>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Mudar o foco ativamente</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {examFolders.map(folder => {
                          const isActive = folder.id === activeExamId;
                          return (
                            <button 
                              key={folder.id}
                              onClick={() => {
                                setActiveExamId(folder.id);
                                setProfile(p => ({ ...p, vitality: Math.min(100, p.vitality + 5) }));
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                isActive 
                                  ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                                  : 'bg-white/5 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                                <Layers size={16} />
                              </div>
                              <span className="text-xs font-black text-white uppercase tracking-tight block">{folder.title}</span>
                              <span className="text-[9px] text-slate-500 font-bold block mt-0.5 truncate">{folder.banca}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Display active selection analytics metadata */}
                      <div className="mt-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-white">Foco Ativo: {activeExam.title}</span>
                          <span className="text-indigo-400">Prova: {activeExam.examDate}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{activeExam.overlapAnalysis}</p>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-950 p-6 rounded-[24px] text-white h-full flex flex-col justify-between relative overflow-hidden">
                      <div className="relative z-10 space-y-2">
                        <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-wider">Aconselhamento do Oráculo</span>
                        <h3 className="text-md font-bold italic pt-2">"O seu edital do {activeExam.title} possui forte sinergia com o seu arsenal."</h3>
                        <p className="text-xs text-indigo-200 leading-relaxed max-w-sm">
                          Seu maior ganho imediato de pontos está na banca {activeExam.banca}. Estude e revise os tópicos do edital verticalizado para aumentar sua competitividade!
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('concursos')}
                        className="mt-6 self-start bg-white text-indigo-950 font-black px-4 py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-all flex items-center gap-1"
                      >
                        Ver Edital Verticalizado <ChevronRight size={14} />
                      </button>
                      <Sparkles className="absolute -right-10 -bottom-10 text-white opacity-10" size={160} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: CENTRAL CONCURSOS (COMPREHENSIVE MULTI-EXAM MANAGEMENT HUB) */}
            {activeTab === 'concursos' && (
              <motion.div 
                key="concursos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header Subfolder Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="text-indigo-400" />
                      Central de Concursos & Editais IA
                    </h2>
                    <p className="text-xs text-slate-500">Organize múltiplos concursos, compare similaridade e verticalize matérias</p>
                  </div>

                  {/* Quick context switch */}
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full">
                    {examFolders.map(exam => {
                      const isActive = exam.id === activeExamId;
                      return (
                        <button
                          key={exam.id}
                          onClick={() => setActiveExamId(exam.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {exam.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subfolder Info Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left: IA Scanner Form & Banca Profile Analytics */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* IA Scanner Interface */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Wand2 size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Adicionar Novo Edital via Oráculo</h3>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Arraste e solte o arquivo PDF do edital ou cole o conteúdo programático/resumo abaixo. O Oráculo lerá e estruturará toda a sua trilha de forma inteligente.
                      </p>

                      <div className="space-y-4">
                        {/* Real Drag & Drop PDF upload area */}
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-950/40 text-center relative hover:border-indigo-500/50 transition-all">
                          <Upload size={24} className="text-indigo-400 mb-2" />
                          <span className="text-xs font-bold text-white">Anexar PDF do Edital</span>
                          <span className="text-[9px] text-slate-500 mt-1">Extração automática de datas, salários e tópicos</span>
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handlePdfUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                        </div>

                        <textarea
                          value={aiInputText}
                          onChange={(e) => setAiInputText(e.target.value)}
                          placeholder="Cole o trecho do edital ou aguarde a extração de texto do PDF aqui..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-32 resize-none"
                        />

                        {/* Presets Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Preencher Exemplo:</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => prefillSamplePreset('sedes')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[10px] font-bold">SEDES</button>
                            <button onClick={() => prefillSamplePreset('der')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[10px] font-bold">DER</button>
                            <button onClick={() => prefillSamplePreset('cldf')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[10px] font-bold">CLDF</button>
                          </div>
                        </div>

                        <button
                          onClick={handleTriggerAiEditalAnalysis}
                          disabled={isAiProcessing}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                        >
                          {isAiProcessing ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Calculando rotas espectrais de estudo...
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              Processar Edital com Oráculo IA
                            </>
                          )}
                        </button>
                      </div>

                      {aiNotification && (
                        <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-2">
                          <AlertCircle size={14} className="text-indigo-400 mt-0.5" />
                          <p className="text-[11px] text-indigo-300 leading-normal">{aiNotification.message}</p>
                        </div>
                      )}
                    </GlassCard>

                    {/* Compare Multi-Concursos Metrics */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-4 text-white">
                        <FileText size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-bold">Visão Geral do Edital {activeExam.title}</h3>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Banca Reguladora</span>
                            <span className="text-white font-bold text-sm block mt-0.5">{activeExam.banca}</span>
                          </div>
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Data da Prova</span>
                            <span className="text-amber-400 font-bold text-sm block mt-0.5">{activeExam.examDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Salário Inicial</span>
                            <span className="text-emerald-400 font-bold text-sm block mt-0.5">{activeExam.salary}</span>
                          </div>
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Vagas Ofertadas</span>
                            <span className="text-white font-bold text-sm block mt-0.5">{activeExam.vagas}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Sistema de Avaliação</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{activeExam.examSystemDescription}</p>
                        </div>

                        {/* Banca profile strategy explanation */}
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                          <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider block mb-1">Análise da Banca ({activeExam.banca})</span>
                          <p className="text-[11px] text-slate-400 leading-normal">{activeExam.bancaStyleExplanation}</p>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Adaptive Mentoring based on Study Mode */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {studyMode === 'iniciante' ? (
                          <CheckCircle2 size={16} className="text-indigo-400" />
                        ) : (
                          <Target size={16} className="text-red-400" />
                        )}
                        <h4 className="text-xs font-black text-white uppercase">Plano de Ataque do Mentor</h4>
                      </div>
                      {studyMode === 'iniciante' ? (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          "Foque primeiro em entender os conceitos básicos. Complete 100% dos checklists em <strong>Compreensão de textos</strong>. Não se apresse com as revisões automáticas de 30 dias até dominar os princípios."
                        </p>
                      ) : (
                        <p className="text-xs text-red-300 leading-relaxed">
                          "Reta final agressiva! Você possui apenas {activeExam.approvalProbability}% de probabilidade estimada de aprovação. Priorize resolver questões de Direito Constitucional e Direito Administrativo da banca {activeExam.banca} hoje."
                        </p>
                      )}
                    </GlassCard>
                  </div>

                  {/* Right: Interactive Granular Verticalized Checklist */}
                  <div className="lg:col-span-7 space-y-6">
                    <GlassCard className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                            <CheckSquare size={18} className="text-emerald-400" />
                            Edital Verticalizado Inteligente: {activeExam.title}
                          </h3>
                          <p className="text-xs text-slate-500">Acompanhe seu progresso real por tópico de matéria</p>
                        </div>
                        <div className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 self-start">
                          Probabilidade de Aprovação Estimada: <span className="text-emerald-400 font-black">{activeExam.approvalProbability}%</span>
                        </div>
                      </div>

                      {/* Map of Approval Indicator */}
                      <div className="mb-6 p-4 bg-slate-950/60 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                          <span>Nível Competitivo do Edital</span>
                          <span>{activeExam.approvalProbability}% Competitivo</span>
                        </div>
                        <ProgressBar progress={activeExam.approvalProbability} color={activeExam.approvalProbability > 70 ? '#10b981' : activeExam.approvalProbability > 40 ? '#6366f1' : '#f59e0b'} />
                        <span className="text-[10px] text-slate-500 block mt-1">Atingir +75% para entrar na zona crítica de aprovação de vagas.</span>
                      </div>

                      <div className="space-y-6">
                        {activeExam.syllabus.map((subj, sIdx) => {
                          const completedTopics = subj.topics.filter(t => t.completed).length;
                          const totalTopics = subj.topics.length;
                          const subjProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                          return (
                            <div key={sIdx} className="space-y-3">
                              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                <span className="text-xs font-black text-white uppercase">{subj.subjectName}</span>
                                <span className="text-[11px] font-black text-indigo-400">{subjProgress}%</span>
                              </div>

                              <div className="space-y-2 pl-2">
                                {subj.topics.map((topic, tIdx) => (
                                  <div 
                                    key={tIdx}
                                    className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col gap-3"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <span className="text-xs text-slate-300 font-bold max-w-sm">{topic.topicName}</span>
                                      
                                      {/* Interactive study actions */}
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => handleToggleSyllabusMetric(activeExam.id, subj.subjectName, topic.topicName, 'completed')}
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight transition-all border ${
                                            topic.completed 
                                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                                              : 'bg-transparent text-slate-500 border-white/5 hover:border-white/10'
                                          }`}
                                        >
                                          Estudado
                                        </button>
                                        <button 
                                          onClick={() => handleToggleSyllabusMetric(activeExam.id, subj.subjectName, topic.topicName, 'reviewed')}
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight transition-all border ${
                                            topic.reviewed 
                                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' 
                                              : 'bg-transparent text-slate-500 border-white/5 hover:border-white/10'
                                          }`}
                                        >
                                          Revisado
                                        </button>
                                        <button 
                                          onClick={() => handleToggleSyllabusMetric(activeExam.id, subj.subjectName, topic.topicName, 'exercisesDone')}
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight transition-all border ${
                                            topic.exercisesDone 
                                              ? 'bg-amber-600/20 text-amber-400 border-amber-500/30' 
                                              : 'bg-transparent text-slate-500 border-white/5 hover:border-white/10'
                                          }`}
                                        >
                                          Questões
                                        </button>
                                      </div>
                                    </div>

                                    {/* Granular analytics details per topic (Advaced info) */}
                                    <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-500 border-t border-white/5 pt-2 font-bold uppercase">
                                      <span>Questões: <strong className="text-white">{topic.questionsCount}</strong></span>
                                      <span>Acertos: <strong className="text-emerald-400">{topic.correctAnswers}</strong></span>
                                      <span>Revisões: <strong className="text-indigo-400">{topic.revisionsCount}</strong></span>
                                      <span className="truncate">Estudado: <strong className="text-white">{topic.lastStudied}</strong></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 3: ANKI COGNITIVE FLASHCARDS WORKSPACE */}
            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <GraduationCap className="text-indigo-400" />
                      Grimório Anki AI: Memorização Espaçada (SRS)
                    </h2>
                    <p className="text-xs text-slate-500">Reforce e diagnostique erros de memorização de forma programada.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Filtrar Assunto:</span>
                    <select
                      value={bancaFilter}
                      onChange={(e) => {
                        setBancaFilter(e.target.value);
                        setActiveCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="TODOS">Todas as Matérias</option>
                      <option value="Direito Constitucional">Direito Constitucional</option>
                      <option value="Direito Administrativo">Direito Administrativo</option>
                    </select>
                  </div>
                </div>

                {/* Spaced repetition memory dashboards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Cartões Revisados</span>
                    <h3 className="text-lg font-black text-white mt-1">{filteredCards.length} / {flashcards.length}</h3>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Retenção Ativa Média</span>
                    <h3 className="text-lg font-black text-emerald-400 mt-1">87%</h3>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Revisões Atrasadas</span>
                    <h3 className="text-lg font-black text-rose-400 mt-1">0</h3>
                  </div>
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider">Ajuste de Memorização</span>
                    <h3 className="text-lg font-black text-indigo-300 mt-1">Manual / Gemini</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Input upload and creator tool */}
                  <div className="lg:col-span-5 space-y-6">
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Criador Adaptativo de Cartões</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Cole resumos, leis, regimentos ou apostilas inteiras. O sistema transformará o material em cartões inteligentes de memorização.
                      </p>

                      <div className="space-y-4">
                        <textarea
                          value={ankiInputText}
                          onChange={(e) => setAnkiInputText(e.target.value)}
                          placeholder="Exemplo: CF Art. 5º, inciso IX - é livre a expressão da atividade intelectual, artística, científica..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-32 resize-none"
                        />

                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider block mb-1">Banca Estilo</label>
                            <select
                              value={selectedBanca}
                              onChange={(e) => setSelectedBanca(e.target.value)}
                              className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                            >
                              <option value="IADES">IADES (Literal)</option>
                              <option value="CEBRASPE">CEBRASPE (C/E)</option>
                              <option value="FGV">FGV (Caso Prático)</option>
                            </select>
                          </div>

                          <button
                            onClick={handleGenerateAnkiCards}
                            disabled={isAnkiGenerating}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                          >
                            {isAnkiGenerating ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                Modelando Memória...
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} />
                                Invocar Flashcards com IA
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </GlassCard>

                    {/* AI Memory Tracker diagnosis feedback */}
                    <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={16} className="text-amber-400 animate-bounce" />
                        <h4 className="text-xs font-black text-white uppercase">IA Analista de Memorização</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        "Detectamos cansaço ou queda de retenção em Direito Administrativo. Seus flashcards serão apresentados de forma simplificada por 24h para reter a base legal sólida."
                      </p>
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between text-[10px] font-bold text-amber-500">
                        <span>Frequência de Revisão</span>
                        <span>Adaptada +12%</span>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Right: Active Card Reviewer */}
                  <div className="lg:col-span-7">
                    {filteredCards.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                        <Cpu className="mx-auto text-indigo-400 mb-4 animate-pulse" size={32} />
                        <h3 className="text-sm font-bold text-white">Nenhum cartão para este assunto</h3>
                        <p className="text-xs text-slate-500 mt-2">Use o formulário esquerdo para colar leis secas e criar.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Interactive flippable card */}
                        <div 
                          onClick={() => {
                            if (!isFlipped) setIsFlipped(true);
                          }}
                          className={`min-h-[280px] bg-slate-950/80 border-2 rounded-[32px] p-8 flex flex-col justify-between relative cursor-pointer overflow-hidden transition-all duration-300 ${
                            isFlipped ? 'border-indigo-500 shadow-lg shadow-indigo-500/5' : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          {/* Card metadata */}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase mb-4">
                            <span className="flex items-center gap-1">
                              <Bookmark size={10} className="text-indigo-400" />
                              {activeCard.subject}
                            </span>
                            <span className="bg-white/5 px-2 py-0.5 rounded text-indigo-300 font-black">
                              TIPO: {activeCard.type.toUpperCase()} {activeCard.banca && `• ${activeCard.banca}`}
                            </span>
                          </div>

                          {/* Front vs Back display */}
                          <div className="my-auto text-center">
                            <AnimatePresence mode="wait">
                              {!isFlipped ? (
                                <motion.div
                                  key="front"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="space-y-4"
                                >
                                  {activeCard.type === 'cloze' ? (
                                    <p 
                                      className="text-base sm:text-lg text-white font-medium leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: renderClozeText(activeCard.front, clozeRevealed) }}
                                      onClick={(e) => {
                                        const target = e.target as HTMLElement;
                                        if (target.tagName === 'SPAN') {
                                          e.stopPropagation();
                                          setClozeRevealed(true);
                                          setIsFlipped(true);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                                      {activeCard.front}
                                    </p>
                                  )}
                                  
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-6 animate-pulse">
                                    Clique no cartão para virar e ver gabarito
                                  </p>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="back"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="space-y-4 text-left"
                                >
                                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                    <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider block mb-2">Resposta Consolidada</span>
                                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-semibold">
                                      {activeCard.back}
                                    </p>
                                  </div>

                                  {activeCard.explanation && (
                                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                                      <Lightbulb size={16} className="text-amber-400 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider block mb-0.5">Associações Mentais & Explicações</span>
                                        <p className="text-xs text-slate-400 leading-normal">
                                          {activeCard.explanation}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Interval rating status */}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-4 pt-4 border-t border-white/5">
                            <span>Repetições: {activeCard.repetitions}</span>
                            <span>Intervalo: {activeCard.intervalDays} dias</span>
                            <span>Facilidade: {activeCard.easeFactor}x</span>
                          </div>
                        </div>

                        {/* Adaptive SM2 SRS scoring triggers */}
                        {isFlipped && (
                          <div className="grid grid-cols-4 gap-3">
                            <button
                              onClick={() => handleRateAnkiCard(1)}
                              className="p-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500 text-red-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Errei</span>
                              <span className="text-[9px] text-red-500/80 font-bold block">Revisão (1 dia)</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(2)}
                              className="p-3 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 hover:border-amber-500 text-amber-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Difícil</span>
                              <span className="text-[9px] text-amber-500/80 font-bold block">Revisão (2 dias)</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(3)}
                              className="p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Bom</span>
                              <span className="text-[9px] text-indigo-500/80 font-bold block">Revisão (4 dias)</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(4)}
                              className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Fácil</span>
                              <span className="text-[9px] text-emerald-500/80 font-bold block">Revisão (8 dias)</span>
                            </button>
                          </div>
                        )}

                        {/* Deck carousel controller */}
                        <div className="flex justify-between items-center text-xs text-slate-500 px-2 font-bold">
                          <span>Cartão {activeCardIndex + 1} de {filteredCards.length}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setIsFlipped(false);
                                setClozeRevealed(false);
                                setActiveCardIndex(p => Math.max(0, p - 1));
                              }}
                              className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white"
                            >
                              Anterior
                            </button>
                            <button 
                              onClick={() => {
                                setIsFlipped(false);
                                setClozeRevealed(false);
                                setActiveCardIndex(p => Math.min(filteredCards.length - 1, p + 1));
                              }}
                              className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white"
                            >
                              Próximo
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SUBJECTS MATERIAS MANAGER */}
            {activeTab === 'subjects' && (
              <motion.div 
                key="subjects"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Grimório de Conhecimentos</h2>
                    <p className="text-xs text-slate-500">Monitore as disciplinas do seu concurso de forma modular</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Performance Log input */}
                  <GlassCard className="lg:col-span-4 p-6">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-1.5">
                      <Plus size={16} className="text-indigo-400" /> Registrar Prática de Questões
                    </h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const subId = data.get('subject') as string;
                        const total = parseInt(data.get('total') as string) || 0;
                        const correct = parseInt(data.get('correct') as string) || 0;
                        handleAddQuestionLog(subId, total, correct);
                        e.currentTarget.reset();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Selecione a Matéria</label>
                        <select 
                          name="subject" 
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Questões Totais</label>
                          <input 
                            name="total" 
                            type="number" 
                            placeholder="0" 
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Acertos</label>
                          <input 
                            name="correct" 
                            type="number" 
                            placeholder="0" 
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" 
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                      >
                        Registrar no Diário
                      </button>
                    </form>
                  </GlassCard>

                  {/* Subjects list */}
                  <div className="lg:col-span-8 space-y-4">
                    {subjects.map(sub => (
                      <GlassCard key={sub.id} className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[9px] rounded-full uppercase tracking-wider">
                              Maestria: {sub.mastery}
                            </span>
                            <h4 className="text-md font-bold text-white mt-1.5">{sub.name}</h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Taxa de Acertos</p>
                            <p className="text-base font-bold text-emerald-400">{sub.accuracy}% de Precisão</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>Progresso Geral do Edital</span>
                            <span>{sub.progress}%</span>
                          </div>
                          <ProgressBar progress={sub.progress} color={sub.color} />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: ARTIFICIAL INTELLIGENCE LAB */}
            {activeTab === 'lab' && (
              <motion.div 
                key="lab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Radar chart visualization */}
                <GlassCard className="lg:col-span-6 p-8">
                  <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-indigo-400" /> Distribuição de Poder de Combate
                  </h3>
                  <div className="h-[280px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name="Precisão %"
                          dataKey="A"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* AI Diagnoses & suggestions */}
                <div className="lg:col-span-6 space-y-6">
                  <GlassCard className="p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Pontos de Fuga Identificados</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
                        <div>
                          <p className="text-xs font-bold text-white">Domínio Crítico: Lógica Proposicional</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Sua taxa de acertos caiu de 68% para 55%. Recomendamos revisão baseada em mapas mentais procedurais.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                        <div>
                          <p className="text-xs font-bold text-white">Atenção em Consistência: Constitucional</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Faz 3 dias que você não resolve sessões sobre "Direitos Fundamentais". Evite decaimento de memória espacial.</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 bg-gradient-to-tr from-indigo-500/5 to-transparent">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1">
                      <Sparkles size={16} className="text-indigo-400" /> Sugestão de Feitiço de Estudos
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Ative o Modo Foco Arcano de 25 minutos e foque na revisão do caderno de erros de Informática. Isso garantirá mais velocidade na sua jornada evolutiva.
                    </p>
                    <button 
                      onClick={() => setActiveTab('timer')}
                      className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold transition-all"
                    >
                      Canalizar Recomendação
                    </button>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* TAB 6: POMODORO TIMER WORKSPACE */}
            {activeTab === 'timer' && (
              <motion.div 
                key="timer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-xl mx-auto py-8"
              >
                <FocusTimer onComplete={(xp, stat) => handleGainXpAndStats(xp, stat)} />
              </motion.div>
            )}

            {/* TAB 7: CHRONICLES HISTORY LOG */}
            {activeTab === 'chronicles' && (
              <motion.div 
                key="chronicles"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold text-white">Crônicas de Batalhas</h2>
                  <p className="text-xs text-slate-500">Log completo de sessões de foco e resoluções passadas</p>
                </div>

                <GlassCard className="p-6">
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 bg-white/5 border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <Target size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{log.subject}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">{log.timestamp} • Prática Realizada</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Desempenho</p>
                            <p className="text-xs font-black text-emerald-400">{log.correct} acertos de {log.total} questões</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">+{log.xpGained} XP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
