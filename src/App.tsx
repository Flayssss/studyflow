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
  X,
  FileDown,
  Edit3,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
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
  difficulty: number; // 1 (Fácil) a 5 (Difícil)
  lastStudied: string;
  revisionsCount: number;
  timeInvested: number; // em minutos
  notes: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  incidence: string; // Ex: "Muito Cobrado (85%)"
}

interface VerticalizedSubject {
  subjectName: string;
  topics: SyllabusTopic[];
}

interface EssayTraining {
  id: string;
  theme: string;
  grade: number;
  date: string;
  correctionsNotes: string;
}

interface EssayConfig {
  hasEssay: boolean;
  type: string; // "Redação Discursiva" ou "Estudo de Caso"
  maxGrade: number;
  minGrade: number;
  criteria: string[];
  probableThemes: string[];
  trainings: EssayTraining[];
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
  essay: EssayConfig;
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
  nextReviewDate: string;
}

// --- Preloaded Default Databases (If LocalStorage is Empty) ---
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
    bancaStyleExplanation: 'A banca IADES prioriza a literalidade das leis e regimentos de assistência social.',
    approvalProbability: 72,
    essay: {
      hasEssay: true,
      type: "Redação Discursiva",
      maxGrade: 30,
      minGrade: 18,
      criteria: [
        "Apresentação e estrutura textual (máx. 3,0 pontos)",
        "Desenvolvimento do tema e coerência argumentativa (máx. 15,0 pontos)",
        "Domínio da modalidade escrita da língua portuguesa (máx. 12,0 pontos)"
      ],
      probableThemes: [
        "O papel do SUAS no combate à extrema pobreza urbana",
        "Políticas públicas de acolhimento para idosos no DF",
        "Segurança Alimentar e Nutricional em tempos de vulnerabilidade social"
      ],
      trainings: [
        { id: '1', theme: 'Implementação do SUAS no cenário pós-pandemia', grade: 24, date: '10/05/2026', correctionsNotes: 'Excelente argumentação jurídica. Atenção aos desvios de concordância verbal no segundo parágrafo.' }
      ]
    },
    syllabus: [
      {
        subjectName: 'Língua Portuguesa',
        topics: [
          { topicName: 'Compreensão e interpretação de textos', completed: true, reviewed: true, exercisesDone: true, questionsCount: 45, correctAnswers: 39, difficulty: 2, lastStudied: 'Ontem', revisionsCount: 3, timeInvested: 180, notes: 'Banca foca muito em conjunções e sinonímia', priority: 'Alta', incidence: 'Frequência de 92%' },
          { topicName: 'Ortografia oficial, acentuação e crase', completed: true, reviewed: false, exercisesDone: true, questionsCount: 20, correctAnswers: 14, difficulty: 3, lastStudied: 'Há 2 dias', revisionsCount: 1, timeInvested: 90, notes: 'Crase ligada a nomes femininos com preposição exigida.', priority: 'Alta', incidence: 'Frequência de 78%' },
          { topicName: 'Sintaxe da oração e do período', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Média', incidence: 'Frequência de 45%' },
        ]
      },
      {
        subjectName: 'Direito Administrativo',
        topics: [
          { topicName: 'Organização administrativa do Estado', completed: true, reviewed: true, exercisesDone: true, questionsCount: 30, correctAnswers: 26, difficulty: 2, lastStudied: 'Há 3 dias', revisionsCount: 2, timeInvested: 120, notes: 'Autarquias versus Empresas Públicas cai muito!', priority: 'Alta', incidence: 'Frequência de 88%' },
          { topicName: 'Atos administrativos: conceito e requisitos', completed: false, reviewed: false, exercisesDone: false, questionsCount: 5, correctAnswers: 2, difficulty: 5, lastStudied: 'Há 5 dias', revisionsCount: 0, timeInvested: 30, notes: 'Falta memorizar os atributos: PATI.', priority: 'Alta', incidence: 'Frequência de 80%' }
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
    essay: {
      hasEssay: true,
      type: "Redação Discursiva",
      maxGrade: 20,
      minGrade: 12,
      criteria: [
        "Domínio do tema e argumentação lógica (máx. 10,0 pontos)",
        "Adequação linguística e coesão textual (máx. 10,0 pontos)"
      ],
      probableThemes: [
        "Os desafios da mobilidade urbana sustentável no DF",
        "O impacto da sinalização inteligente na redução de sinistros de trânsito",
        "Avanços e desafios do Código de Trânsito Brasileiro nos últimos anos"
      ],
      trainings: []
    },
    syllabus: [
      {
        subjectName: 'Língua Portuguesa',
        topics: [
          { topicName: 'Significação das palavras e sinonímia', completed: true, reviewed: true, exercisesDone: true, questionsCount: 15, correctAnswers: 12, difficulty: 1, lastStudied: 'Há 4 dias', revisionsCount: 1, timeInvested: 45, notes: '', priority: 'Média', incidence: 'Frequência de 50%' },
          { topicName: 'Emprego das classes de palavras', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Média', incidence: 'Frequência de 60%' }
        ]
      },
      {
        subjectName: 'Legislação de Trânsito',
        topics: [
          { topicName: 'Código de Trânsito Brasileiro (CTB) - Introdução', completed: false, reviewed: false, exercisesDone: false, questionsCount: 10, correctAnswers: 4, difficulty: 4, lastStudied: 'Há 6 dias', revisionsCount: 0, timeInvested: 40, notes: '', priority: 'Alta', incidence: 'Frequência de 90%' },
          { topicName: 'Normas Gerais de Circulação e Conduta', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Alta', incidence: 'Frequência de 95%' }
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
    nextReviewDate: new Date().toISOString()
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
    nextReviewDate: new Date().toISOString()
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

// --- Helpers ---
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

// --- RPG Avatar Customizer Component ---
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

// --- Deep Work Pomodoro Timer Component ---
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

// --- MAIN ARCHITECTURE CORE ---
export default function App() {
  // --- Persisted State Engines ---
  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('studyflow_profile');
    return local ? JSON.parse(local) : {
      name: "Mago Willian Nunes",
      level: 5,
      xp: 1200,
      maxXp: 2000,
      streak: 15,
      vitality: 90,
      stats: { int: 120, str: 95, end: 70 }
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
    const local = localStorage.getItem('studyflow_exams_v2');
    return local ? JSON.parse(local) : DEFAULT_EXAMS;
  });

  const [activeExamId, setActiveExamId] = useState(() => {
    const local = localStorage.getItem('studyflow_active_exam_id');
    return local || 'sedes';
  });

  const [spectralPalette, setSpectralPalette] = useState<SpectralPalette>(() => {
    const local = localStorage.getItem('studyflow_spectral_palette');
    return local ? JSON.parse(local) : {
      name: "Nebulosa Cósmica do Conhecimento",
      gradient: "linear-gradient(135deg, hsl(230, 80%, 50%), hsl(300, 80%, 50%))"
    };
  });

  // Anki Flashcard State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const local = localStorage.getItem('studyflow_flashcards');
    return local ? JSON.parse(local) : INITIAL_FLASHCARDS;
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bancaFilter, setBancaFilter] = useState('TODOS');
  const [ankiInputText, setAnkiInputText] = useState('');
  const [selectedBanca, setSelectedBanca] = useState('IADES');
  const [isAnkiGenerating, setIsAnkiGenerating] = useState(false);
  const [clozeRevealed, setClozeRevealed] = useState(false);

  // AI OCR simulated and user states
  const [aiInputText, setAiInputText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiNotification, setAiNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Writing essay state
  const [newEssayTheme, setNewEssayTheme] = useState('');
  const [newEssayGrade, setNewEssayGrade] = useState('');
  const [newEssayNotes, setNewEssayNotes] = useState('');

  // --- Sync database to LocalStorage ---
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
    localStorage.setItem('studyflow_exams_v2', JSON.stringify(examFolders));
  }, [examFolders]);

  useEffect(() => {
    localStorage.setItem('studyflow_active_exam_id', activeExamId);
  }, [activeExamId]);

  useEffect(() => {
    localStorage.setItem('studyflow_spectral_palette', JSON.stringify(spectralPalette));
  }, [spectralPalette]);

  useEffect(() => {
    localStorage.setItem('studyflow_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  // --- Dynamic calculations ---
  const activeExam = useMemo(() => {
    return examFolders.find(e => e.id === activeExamId) || examFolders[0];
  }, [examFolders, activeExamId]);

  // Countdown timers
  const countdowns = useMemo(() => {
    if (!activeExam) return { testDays: 0, regDays: 0 };
    const now = new Date().getTime();
    
    const testDate = new Date(activeExam.examDate).getTime();
    const testDiff = testDate - now;
    const testDays = Math.ceil(testDiff / (1000 * 60 * 60 * 24));

    const regDate = new Date(activeExam.registrationEnd).getTime();
    const regDiff = regDate - now;
    const regDays = Math.ceil(regDiff / (1000 * 60 * 60 * 24));

    return { 
      testDays: isNaN(testDays) ? 0 : testDays, 
      regDays: isNaN(regDays) ? 0 : regDays 
    };
  }, [activeExam]);

  // Compare active exam similarity with all other exams
  const examOverlapAnalysis = useMemo(() => {
    if (!activeExam || examFolders.length <= 1) return [];
    
    return examFolders
      .filter(e => e.id !== activeExam.id)
      .map(e => {
        // Simple mock algorithm comparing exact same subjects names matching
        const currentSubjects = activeExam.syllabus.map(s => s.subjectName.toLowerCase());
        const targetSubjects = e.syllabus.map(s => s.subjectName.toLowerCase());
        const common = currentSubjects.filter(cs => targetSubjects.includes(cs));
        
        const pct = currentSubjects.length > 0 
          ? Math.round((common.length / currentSubjects.length) * 100) 
          : 0;
          
        return {
          targetTitle: e.title,
          overlapPercentage: Math.max(15, pct), // Ensure some base matching
          commonSubjects: common.map(c => c.toUpperCase())
        };
      });
  }, [activeExam, examFolders]);

  // --- Actions ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarImage(reader.result);
          localStorage.setItem('studyflow_avatar', reader.result);
          
          // AI Spectral random gradient generation
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

  // Toggle checklist details inside exams vertical syllabus
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
            let finalTime = topic.timeInvested;
            let finalQC = topic.questionsCount;
            let finalCA = topic.correctAnswers;

            if (nextValue) {
              increment = 60;
              finalTime += 30; // Auto-add study time
              if (metric === 'exercisesDone') {
                finalQC += 10;
                finalCA += 8;
              }
              handleGainXpAndStats(increment, 'int');
            }

            return { 
              ...topic, 
              [metric]: nextValue,
              timeInvested: finalTime,
              questionsCount: finalQC,
              correctAnswers: finalCA,
              lastStudied: nextValue ? 'Hoje' : topic.lastStudied,
              revisionsCount: metric === 'reviewed' && nextValue ? topic.revisionsCount + 1 : topic.revisionsCount
            };
          });
          return { ...subj, topics: updatedTopics };
        });
        
        // Calculate Approval Probability
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

  // Add notes directly to a syllabus topic
  const handleUpdateTopicNotes = (
    examId: string,
    subjectName: string,
    topicName: string,
    notesText: string
  ) => {
    setExamFolders(prevExams => 
      prevExams.map(exam => {
        if (exam.id !== examId) return exam;
        const updatedSyllabus = exam.syllabus.map(subj => {
          if (subj.subjectName !== subjectName) return subj;
          const updatedTopics = subj.topics.map(topic => {
            if (topic.topicName !== topicName) return topic;
            return { ...topic, notes: notesText };
          });
          return { ...subj, topics: updatedTopics };
        });
        return { ...exam, syllabus: updatedSyllabus };
      })
    );
  };

  // Simulated PDF OCR text processing engine
  const handleTriggerAiEditalAnalysis = () => {
    if (!aiInputText.trim()) {
      setAiNotification({
        message: 'Por favor, insira ou cole o edital em PDF na caixa abaixo para a IA escanear.',
        type: 'info'
      });
      return;
    }

    setIsAiProcessing(true);
    setAiNotification({ message: 'Lendo PDF e decodificando estrutura de dados...', type: 'info' });

    setTimeout(() => {
      const isPcdf = aiInputText.toLowerCase().includes('pcdf') || aiInputText.toLowerCase().includes('polícia') || aiInputText.toLowerCase().includes('policia');
      
      const newExamId = isPcdf ? 'pcdf' : 'custom_' + Date.now();
      const newExamTitle = isPcdf ? 'PCDF - Agente' : 'TJDFT - Analista';
      const cargo = isPcdf ? 'Agente de Polícia' : 'Analista Judiciário';
      const banca = isPcdf ? 'CEBRASPE' : 'FGV';
      const salario = isPcdf ? 'R$ 11.085,72' : 'R$ 13.202,62';
      const vagas = isPcdf ? '600 + CR' : '112 + CR';
      const examDate = isPcdf ? '2026-11-15' : '2026-10-18';
      
      const newExamFolder: ExamFolder = {
        id: newExamId,
        title: newExamTitle,
        institution: isPcdf ? 'Polícia Civil do Distrito Federal' : 'Tribunal de Justiça do DF',
        banca: banca,
        salary: salario,
        vagas: vagas,
        examSystemDescription: isPcdf 
          ? 'Certo ou Errado (CEBRASPE), com fator de correção (uma errada anula uma certa).' 
          : 'Múltipla escolha (FGV) com 5 alternativas e alto nível de complexidade doutrinária.',
        registrationStart: '2026-06-01',
        registrationEnd: '2026-07-15',
        examDate: examDate,
        overlapAnalysis: isPcdf 
          ? 'Sua preparação atual possui 52% de similaridade. Excelente aproveitamento de Português, mas exige Informática e Raciocínio Lógico avançados.' 
          : 'Sua preparação possui 68% de similaridade. Altíssimo aproveitamento em Direito Administrativo e Constitucional.',
        bancaStyleExplanation: isPcdf 
          ? 'A banca CEBRASPE exige estratégia de preenchimento rígida devido ao fator de correção de penalidade.' 
          : 'A FGV elabora enunciados longos com interpretações jurisprudenciais complexas.',
        approvalProbability: 38,
        essay: {
          hasEssay: true,
          type: "Redação Discursiva",
          maxGrade: 40,
          minGrade: 24,
          criteria: [
            "Apresentação, legibilidade e estrutura textual (máx. 4,0 pontos)",
            "Desenvolvimento e profundidade técnica dos temas jurídicos (máx. 36,0 pontos)"
          ],
          probableThemes: [
            "Inquérito policial e suas garantias fundamentais",
            "Crimes contra a Administração Pública e leis anticorrupção",
            "A importância do controle judicial nos atos administrativos discricionários"
          ],
          trainings: []
        },
        syllabus: [
          {
            subjectName: 'Matérias Gerais',
            topics: [
              { topicName: 'Língua Portuguesa para banca ' + banca, completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 3, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Alta', incidence: 'Frequência de 95%' },
              { topicName: 'Lei Orgânica do Distrito Federal', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 2, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Média', incidence: 'Frequência de 40%' }
            ]
          },
          {
            subjectName: 'Matérias Específicas',
            topics: [
              { topicName: isPcdf ? 'Noções de Direito Penal' : 'Direito Processual Civil', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Alta', incidence: 'Frequência de 88%' },
              { topicName: isPcdf ? 'Noções de Informática Avançada' : 'Direito Administrativo Aplicado', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0, timeInvested: 0, notes: '', priority: 'Alta', incidence: 'Frequência de 90%' }
            ]
          }
        ]
      };

      setExamFolders(prev => [newExamFolder, ...prev]);
      setActiveExamId(newExamId);
      setAiInputText('');
      setAiNotification({ message: `Concurso "${newExamTitle}" mapeado e adicionado com sucesso!`, type: 'success' });
      handleGainXpAndStats(600, 'int');
      setIsAiProcessing(false);
    }, 2000);
  };

  // Anki smart flashcards SM2 mechanics
  const handleGenerateAnkiCards = () => {
    if (!ankiInputText.trim()) {
      alert("Adicione um texto para invocar novos cartões.");
      return;
    }
    setIsAnkiGenerating(true);

    setTimeout(() => {
      const generatedCard: Flashcard = {
        id: `ai_card_${Date.now()}`,
        type: 'trap',
        subject: 'Direito Constitucional',
        banca: selectedBanca,
        front: `No estilo da banca ${selectedBanca}: A investidura em cargo público independe de aprovação em concurso?`,
        back: 'ERRADO. Exige-se aprovação em concurso, exceto para nomeação de cargos em comissão livres.',
        explanation: 'As bancas adoram tentar omitir a exceção constitucional para forçar o erro.',
        difficultyRating: 3,
        easeFactor: 2.5,
        repetitions: 0,
        intervalDays: 1,
        nextReviewDate: new Date().toISOString()
      };

      setFlashcards(prev => [generatedCard, ...prev]);
      setAnkiInputText('');
      setIsAnkiGenerating(false);
      handleGainXpAndStats(250, 'int');
    }, 1500);
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
      } else if (rating === 4) {
        newEaseFactor = card.easeFactor + 0.15;
      }
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    card.easeFactor = parseFloat(newEaseFactor.toFixed(2));
    card.repetitions = newRepetitions;
    card.intervalDays = newInterval;
    card.nextReviewDate = nextDate.toISOString();

    setFlashcards(updatedCards);
    setIsFlipped(false);
    setClozeRevealed(false);

    if (activeCardIndex < updatedCards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0);
    }

    const reward = rating === 4 ? 250 : rating === 3 ? 150 : 50;
    handleGainXpAndStats(reward, 'int');
  };

  // Add dynamic training logs to Essay discursivas section
  const handleAddEssayTraining = (examId: string) => {
    if (!newEssayTheme.trim()) {
      alert("Por favor, preencha o tema treinado.");
      return;
    }
    const gradeVal = parseFloat(newEssayGrade) || 0;

    const newTraining: EssayTraining = {
      id: `t_${Date.now()}`,
      theme: newEssayTheme,
      grade: gradeVal,
      date: new Date().toLocaleDateString('pt-BR'),
      correctionsNotes: newEssayNotes
    };

    setExamFolders(prevExams => 
      prevExams.map(exam => {
        if (exam.id !== examId) return exam;
        return {
          ...exam,
          essay: {
            ...exam.essay,
            trainings: [newTraining, ...exam.essay.trainings]
          }
        };
      })
    );

    setNewEssayTheme('');
    setNewEssayGrade('');
    setNewEssayNotes('');
    handleGainXpAndStats(400, 'str');
  };

  const prefillSamplePdfText = (type: 'pcdf' | 'tjdft') => {
    if (type === 'pcdf') {
      setAiInputText("EDITAL N 1 - POLÍCIA CIVIL DO DISTRITO FEDERAL (PCDF). Cargo: Agente de Polícia. Banca Organizadora: CEBRASPE. Salário: R$ 11.085,72. Inscrições: 01/06/2026 a 15/07/2026. Data da Prova Objetiva e Discursiva: 15/11/2026. Conteúdo Programático: Noções de Direito Penal, Noções de Direito Processual Penal, Língua Portuguesa, Raciocínio Lógico, Informática Avançada, Direitos Humanos.");
    } else {
      setAiInputText("EDITAL TRIBUNAL DE JUSTIÇA DO DISTRITO FEDERAL (TJDFT). Cargo: Analista Judiciário - Área Judiciária. Banca: FGV. Salário: R$ 13.202,62. Vagas: 112. Prova: 18/10/2026. Conteúdo: Língua Portuguesa, Processo Civil, Processo Penal, Direito Constitucional, Direito Administrativo.");
    }
  };

  const filteredCards = useMemo(() => {
    if (bancaFilter === 'TODOS') return flashcards;
    return flashcards.filter(c => c.subject === bancaFilter);
  }, [flashcards, bancaFilter]);

  const activeCard = filteredCards[activeCardIndex] || filteredCards[0];

  const renderClozeText = (text: string, reveal: boolean) => {
    const regex = /\{\{c1::(.*?)\}\}/g;
    if (reveal) {
      return text.replace(regex, "<strong>$1</strong>");
    }
    return text.replace(regex, `<span class="bg-indigo-600/30 border border-dashed border-indigo-500 px-3 py-1 rounded mx-1 text-indigo-200 cursor-pointer hover:bg-indigo-600/50 transition-all font-black text-xs">REVELAR CLOZE</span>`);
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
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 font-bold text-xs uppercase cursor-pointer">
              WN
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
                {/* Mental coaching recommendation bar */}
                {studyMode === 'iniciante' ? (
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start gap-3.5">
                    <BrainCircuit size={22} className="text-indigo-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">Aconselhamento do Mentor Arcano</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bem-vindo à sua estação, Willian Nunes. Conclua seus checklists e revisões de editais na aba **Concursos** para ganhar cor alquímica no seu perfil e evoluir seus atributos. Hoje, seu foco absoluto sugerido está em fechar o edital de <span className="text-indigo-400 font-bold">{activeExam.title}</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-3.5">
                    <Target size={22} className="text-red-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-wider mb-0.5">Modo Guerra Ativo (Reta Final)</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Exclusão total de distrações. Faltam exatamente <span className="font-bold text-white">{countdowns.testDays} dias</span> para a prova de {activeExam.title}. Priorize resoluções rápidas de questões e cartões tipo "Pegadinhas" da banca organizadora {activeExam.banca}.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Avatar Profile */}
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

                    {/* RPG attributes stats */}
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

                  {/* Chart Visual */}
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

                      {/* Overlap Indicator on Active Context */}
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
                          Seu maior ganho de pontos de custo-benefício imediato está na banca {activeExam.banca}. Estude os tópicos de prioridade "Alta" no edital verticalizado.
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
                        <h3 className="text-sm font-bold text-white">Processador Inteligente de Editais</h3>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Cole o conteúdo programático ou o resumo de um edital de PDF abaixo. O "Mapeador de Editais" gerará instantaneamente o edital verticalizado, prioridades de matérias, regras da banca e cronograma de datas.
                      </p>

                      <div className="space-y-3">
                        <textarea
                          value={aiInputText}
                          onChange={(e) => setAiInputText(e.target.value)}
                          placeholder="Cole o trecho do edital, regulamento ou conteúdo programático aqui..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-32 resize-none"
                        />

                        {/* Presets Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Preencher Exemplo:</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => prefillSamplePdfText('pcdf')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[10px] font-bold">PCDF (Polícia)</button>
                            <button onClick={() => prefillSamplePdfText('tjdft')} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[10px] font-bold">TJDFT (Analista)</button>
                          </div>
                        </div>

                        <button
                          onClick={handleTriggerAiEditalAnalysis}
                          disabled={isAiProcessing}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {isAiProcessing ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Escaneando PDF & Gerando Trilha...
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              Escanear e Importar Edital
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
                        <h3 className="text-sm font-bold">Resumo Analítico: {activeExam.title}</h3>
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

                        {/* Countdown Timers */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                            <span className="text-[10px] text-indigo-400 font-black block uppercase tracking-wider">Inscrições Encerram</span>
                            <span className="text-xl font-mono font-black text-white block mt-1">{countdowns.regDays} DIAS</span>
                          </div>
                          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                            <span className="text-[10px] text-amber-500 font-black block uppercase tracking-wider">Contagem Regressiva Prova</span>
                            <span className="text-xl font-mono font-black text-white block mt-1">{countdowns.testDays} DIAS</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Comparative Similarity matrix */}
                    {examOverlapAnalysis.length > 0 && (
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={16} className="text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">Comparador de Similaridade Inteligente</h3>
                        </div>
                        <div className="space-y-4">
                          {examOverlapAnalysis.map((item, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <span className="text-white">vs. {item.targetTitle}</span>
                                <span className="text-indigo-400 font-black">{item.overlapPercentage}% Sinergia</span>
                              </div>
                              <ProgressBar progress={item.overlapPercentage} color="#8b5cf6" />
                              <div className="mt-2 text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                                Matérias Reaproveitáveis: {item.commonSubjects.join(', ') || 'NENHUMA'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}
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
                          Competitividade Esperada: <span className="text-emerald-400 font-black">{activeExam.approvalProbability}%</span>
                        </div>
                      </div>

                      {/* Map of Approval Indicator */}
                      <div className="mb-6 p-4 bg-slate-950/60 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                          <span>Quanto falta para ficar competitivo?</span>
                          <span>{activeExam.approvalProbability}% Preparado</span>
                        </div>
                        <ProgressBar progress={activeExam.approvalProbability} color={activeExam.approvalProbability > 70 ? '#10b981' : activeExam.approvalProbability > 40 ? '#6366f1' : '#f59e0b'} />
                        <span className="text-[10px] text-slate-500 block mt-1">Nível de corte estimado para vagas imediatas: 75% de acertos/cobertura de edital.</span>
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
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-300 font-bold">{topic.topicName}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                            topic.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                                            topic.priority === 'Média' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                            'bg-slate-500/10 text-slate-400 border border-white/5'
                                          }`}>
                                            {topic.priority} Prioridade
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold">{topic.incidence}</p>
                                      </div>
                                      
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

                                    {/* Granular interactive input logs per topic (Advaced info) */}
                                    <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-500 border-t border-white/5 pt-2 font-bold uppercase">
                                      <span>Questões: <strong className="text-white">{topic.questionsCount}</strong></span>
                                      <span>Acertos: <strong className="text-emerald-400">{topic.correctAnswers}</strong></span>
                                      <span>Tempo: <strong className="text-white">{topic.timeInvested} min</strong></span>
                                      <span>Revisões: <strong className="text-indigo-400">{topic.revisionsCount}</strong></span>
                                    </div>

                                    {/* Quick Notes Input field */}
                                    <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
                                      <Edit3 size={10} className="text-slate-500" />
                                      <input 
                                        type="text"
                                        value={topic.notes}
                                        placeholder="Caderno de erros / observações rápidas para este assunto..."
                                        onChange={(e) => handleUpdateTopicNotes(activeExam.id, subj.subjectName, topic.topicName, e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] text-slate-300 placeholder-slate-600 flex-1"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>

                    {/* REDAÇÃO E PROVAS DISCURSIVAS INTERACTIVE CORE */}
                    {activeExam.essay?.hasEssay && (
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                          <Edit3 size={18} className="text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">Redação & Provas Discursivas</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Criteria & Topics suggestions */}
                          <div className="space-y-4 text-xs">
                            <div>
                              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider block mb-2">Critérios de Correção da Banca</span>
                              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                                {activeExam.essay.criteria.map((c, idx) => <li key={idx}>{c}</li>)}
                              </ul>
                            </div>
                            <div>
                              <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider block mb-2">Temas Quentes Sugeridos pela IA</span>
                              <div className="space-y-1">
                                {activeExam.essay.probableThemes.map((t, idx) => (
                                  <div key={idx} className="p-2 bg-white/5 rounded-lg border border-white/5 text-[11px] text-slate-300">
                                    {t}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Training log register */}
                          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
                            <span className="text-[10px] text-white font-bold block uppercase tracking-wider">Registrar Novo Treino de Redação</span>
                            <input 
                              type="text" 
                              value={newEssayTheme}
                              onChange={(e) => setNewEssayTheme(e.target.value)}
                              placeholder="Escreva o tema da redação..."
                              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="number" 
                                value={newEssayGrade}
                                onChange={(e) => setNewEssayGrade(e.target.value)}
                                placeholder={`Nota (Max ${activeExam.essay.maxGrade})`}
                                className="bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              />
                              <button 
                                onClick={() => handleAddEssayTraining(activeExam.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all"
                              >
                                Logar Treino
                              </button>
                            </div>
                            <textarea 
                              value={newEssayNotes}
                              onChange={(e) => setNewEssayNotes(e.target.value)}
                              placeholder="Erros cometidos, observações do corretor ou correções gramaticais necessárias..."
                              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white h-20 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                          </div>
                        </div>

                        {/* Recent trainings log output */}
                        {activeExam.essay.trainings.length > 0 && (
                          <div className="mt-6 border-t border-white/5 pt-4">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Histórico de Redações</span>
                            <div className="space-y-3">
                              {activeExam.essay.trainings.map((t, idx) => (
                                <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block mb-0.5">{t.date}</span>
                                    <p className="text-white font-bold">{t.theme}</p>
                                    {t.correctionsNotes && <p className="text-[11px] text-slate-400 italic mt-1 leading-normal">{t.correctionsNotes}</p>}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-500 block">Sua Nota</span>
                                    <span className="text-emerald-400 font-black text-sm">{t.grade} / {activeExam.essay.maxGrade}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    )}
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Input upload and creator tool */}
                  <div className="lg:col-span-5 space-y-6">
                    <GlassCard className="p-6">
                      <h3 className="text-sm font-bold text-white mb-3">Modelador de Cartões</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Cole resumos, leis ou apostilas para que o sistema gere cartões de memorização adaptativa.
                      </p>

                      <div className="space-y-4">
                        <textarea
                          value={ankiInputText}
                          onChange={(e) => setAnkiInputText(e.target.value)}
                          placeholder="Cole o material para gerar cartões..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-32 resize-none"
                        />

                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <select
                              value={selectedBanca}
                              onChange={(e) => setSelectedBanca(e.target.value)}
                              className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-bold"
                            >
                              <option value="IADES">Estilo IADES (Literal)</option>
                              <option value="CEBRASPE">Estilo CEBRASPE (C/E)</option>
                              <option value="FGV">Estilo FGV (Prático)</option>
                            </select>
                          </div>

                          <button
                            onClick={handleGenerateAnkiCards}
                            disabled={isAnkiGenerating}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {isAnkiGenerating ? 'Modelando Memória...' : 'Invocar Flashcards'}
                          </button>
                        </div>
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
                          className={`min-h-[250px] bg-slate-950/80 border-2 rounded-[32px] p-8 flex flex-col justify-between relative cursor-pointer overflow-hidden transition-all duration-300 ${
                            isFlipped ? 'border-indigo-500 shadow-lg shadow-indigo-500/5' : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase mb-4">
                            <span className="flex items-center gap-1">
                              <Bookmark size={10} className="text-indigo-400" />
                              {activeCard.subject}
                            </span>
                            <span className="bg-white/5 px-2 py-0.5 rounded text-indigo-300 font-black">
                              TIPO: {activeCard.type.toUpperCase()} {activeCard.banca && `• ${activeCard.banca}`}
                            </span>
                          </div>

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
                                      className="text-sm sm:text-base text-white font-medium leading-relaxed"
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
                                    <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                                      {activeCard.front}
                                    </p>
                                  )}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="back"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="space-y-4 text-left"
                                >
                                  <p className="text-xs text-indigo-400 font-black uppercase tracking-wider block mb-1">Resposta</p>
                                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-semibold mb-3">
                                    {activeCard.back}
                                  </p>

                                  {activeCard.explanation && (
                                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-2.5">
                                      <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="text-[9px] text-amber-500 font-black uppercase block">Explicação</span>
                                        <p className="text-xs text-slate-400 leading-relaxed">{activeCard.explanation}</p>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest mt-4">
                            {!isFlipped ? 'Clique para virar e gabaritar' : 'Avalie sua recordação abaixo'}
                          </p>
                        </div>

                        {/* Adaptive SM2 SRS scoring triggers */}
                        {isFlipped && (
                          <div className="grid grid-cols-4 gap-3">
                            <button
                              onClick={() => handleRateAnkiCard(1)}
                              className="p-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Errei</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(2)}
                              className="p-3 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Difícil</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(3)}
                              className="p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Bom</span>
                            </button>
                            <button
                              onClick={() => handleRateAnkiCard(4)}
                              className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <span className="font-black text-xs uppercase">Fácil</span>
                            </button>
                          </div>
                        )}
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
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Acertos</label>
                          <input 
                            name="correct" 
                            type="number" 
                            placeholder="0" 
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" 
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
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
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Taxa de Acertos</p>
                            <p className="text-base font-bold text-emerald-400">{sub.accuracy}% de Precisão</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
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
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Faz 3 dias que você não realiza treinos de "Direitos Fundamentais". Evite decaimento de memória espacial.</p>
                        </div>
                      </div>
                    </div>
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
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Desempenho</p>
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
