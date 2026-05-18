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
  difficulty: number; 
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

const radarData = [
  { subject: 'D. Adm', A: 70, full: 100 },
  { subject: 'Português', A: 90, full: 100 },
  { subject: 'Const', A: 60, full: 100 },
  { subject: 'RLM', A: 40, full: 100 },
  { subject: 'Informática', A: 50, full: 100 },
];

const DEFAULT_EXAMS: ExamFolder[] = [
  {
    id: 'sedes',
    title: 'SEDES-DF',
    institution: 'Secretaria de Desenvolvimento Social',
    banca: 'IADES',
    salary: 'R$ 5.480,00',
    vagas: '120 + CR',
    examSystemDescription: 'Múltipla escolha (5 alternativas) com pontuação tradicional de acertos e alto peso nas disciplinas específicas de Assistência Social.',
    registrationStart: '10/05/2026',
    registrationEnd: '15/06/2026',
    examDate: '26/08/2026',
    overlapAnalysis: 'Alta compatibilidade (78%) com seu progresso atual de estudo. Aproveitamento excelente de Língua Portuguesa e Direito Administrativo.',
    bancaStyleExplanation: 'A banca IADES prioriza a literalidade das leis e do regimento interno, misturada com questões de interpretação de texto longas.',
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
    registrationStart: '01/08/2026',
    registrationEnd: '05/09/2026',
    examDate: '25/10/2026',
    overlapAnalysis: 'Compatibilidade de 61% com seu progresso. Alta sinergia em Português e Administrativo, mas exige estudo profundo de Legislação de Trânsito específica.',
    bancaStyleExplanation: 'IADES tende a cobrar literalidade extrema do Código de Trânsito Brasileiro e suas resoluções do CONTRAN.',
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
          {level < 5 ? 'Iniciado Arcano' : level < 15 ? 'Mago de Elite' : 'Arquimago Supremo'}
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
  const [profile, setProfile] = useState({
    name: "Mago Willian Nunes",
    level: 5,
    xp: 1200,
    maxXp: 2000,
    streak: 15,
    vitality: 90,
    stats: { int: 120, str: 95, end: 70 }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'concursos' | 'flashcards' | 'subjects' | 'lab' | 'timer' | 'chronicles'>('dashboard');
  const [studyMode, setStudyMode] = useState<'iniciante' | 'guerra'>('iniciante');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [logs, setLogs] = useState<QuestionLog[]>(INITIAL_LOGS);
  
  const [examFolders, setExamFolders] = useState<ExamFolder[]>(DEFAULT_EXAMS);
  const [activeExamId, setActiveExamId] = useState<string>('sedes');

  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiNotification, setAiNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [spectralPalette, setSpectralPalette] = useState<SpectralPalette>({
    name: "Nebulosa Cósmica do Conhecimento",
    gradient: "linear-gradient(135deg, hsl(230, 80%, 50%), hsl(300, 80%, 50%))"
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [bancaFilter, setBancaFilter] = useState<string>('TODOS');
  const [ankiInputText, setAnkiInputText] = useState<string>('');
  const [selectedBanca, setSelectedBanca] = useState<string>('IADES');
  const [isAnkiGenerating, setIsAnkiGenerating] = useState<boolean>(false);
  const [clozeRevealed, setClozeRevealed] = useState<boolean>(false);

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
          setSpectralPalette({
            name: `Sintonia Espectral #${Math.floor(Math.random() * 900 + 100)}`,
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

  const handleTriggerAiEditalAnalysis = () => {
    if (!aiInputText.trim()) {
      setAiNotification({
        message: 'Por favor, insira o texto do edital para o Oráculo analisar.',
        type: 'info'
      });
      return;
    }

    setIsAiProcessing(true);
    setAiNotification({ message: 'Extraindo conteúdo programático...', type: 'info' });

    setTimeout(() => {
      const randomId = 'custom_' + Date.now();
      const mockResult: ExamFolder = {
        id: randomId,
        title: 'TJDFT-DF',
        institution: 'Tribunal de Justiça do DF',
        banca: 'FGV',
        salary: 'R$ 13.202,62',
        vagas: '15 + CR',
        examSystemDescription: 'Múltipla escolha tradicional com 5 alternativas. Exige redação discursiva jurídica eliminatória.',
        registrationStart: '20/07/2026',
        registrationEnd: '30/08/2026',
        examDate: '15/11/2026',
        overlapAnalysis: 'Sua preparação base possui 56% de similaridade com este certame público.',
        bancaStyleExplanation: 'FGV foca em análise pesada de casos práticos constitucionais e exegese gramatical.',
        approvalProbability: 42,
        syllabus: [
          {
            subjectName: 'Matérias Gerais',
            topics: [
              { topicName: 'Lei de Organização Judiciária do DF', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 4, lastStudied: 'Nunca', revisionsCount: 0 },
              { topicName: 'Processo Civil - Recursos', completed: false, reviewed: false, exercisesDone: false, questionsCount: 0, correctAnswers: 0, difficulty: 5, lastStudied: 'Nunca', revisionsCount: 0 }
            ]
          }
        ]
      };
      setExamFolders(prev => [mockResult, ...prev]);
      setActiveExamId(randomId);
      setAiNotification({ message: 'Concurso extraído com sucesso!', type: 'success' });
      setIsAiProcessing(false);
      handleGainXpAndStats(500, 'int');
    }, 1500);
  };

  const handleGenerateAnkiCards = () => {
    if (!ankiInputText.trim()) {
      alert("Insira conteúdo para gerar.");
      return;
    }
    setIsAnkiGenerating(true);

    setTimeout(() => {
      const fallback: Flashcard[] = [
        {
          id: `ai_${Date.now()}`,
          type: 'trap',
          subject: 'Direito Constitucional',
          banca: selectedBanca,
          front: 'A investidura em cargo ou emprego público independe de aprovação prévia em concurso?',
          back: 'ERRADO. A regra exige aprovação em concurso, exceto para cargos em comissão de livre nomeação.',
          explanation: 'As bancas sempre tentam confundir a regra geral com os cargos de confiança.',
          difficultyRating: 3,
          easeFactor: 2.5,
          repetitions: 0,
          intervalDays: 1,
          nextReviewDate: new Date()
        }
      ];
      setFlashcards(prev => [...fallback, ...prev]);
      setAnkiInputText('');
      setIsAnkiGenerating(false);
      handleGainXpAndStats(200, 'int');
    }, 1200);
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

    card.easeFactor = parseFloat(newEaseFactor.toFixed(2));
    card.repetitions = newRepetitions;
    card.intervalDays = newInterval;
    card.nextReviewDate = new Date();

    setFlashcards(updatedCards);
    setIsFlipped(false);
    setClozeRevealed(false);

    if (activeCardIndex < updatedCards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0);
    }
    handleGainXpAndStats(100, 'int');
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
    return text.replace(regex, `<span class="bg-indigo-600/30 border border-dashed border-indigo-500 px-3 py-1 rounded mx-1 text-indigo-200">REVELAR CLOZE (CLIQUE)</span>`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Sidebar */}
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
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Mago Willian Nunes • Estação de Trabalho</h2>
            
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
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-4 p-8 flex flex-col items-center bg-gradient-to-b from-indigo-500/5 to-transparent relative">
                    <div className="absolute top-4 right-4">
                      <label className="cursor-pointer p-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all rounded-xl text-[10px] font-black text-indigo-400 flex items-center gap-1">
                        <Upload size={12} />
                        Conjurar Mago
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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
                    </div>
                  </GlassCard>

                  <GlassCard className="lg:col-span-8 p-8">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-md font-bold text-white">Evolução Cósmica</h3>
                        <p className="text-xs text-slate-500">Curva de ganho de XP e evolução do Mago</p>
                      </div>
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
              </motion.div>
            )}

            {/* TAB 2: CONCURSOS */}
            {activeTab === 'concursos' && (
              <motion.div 
                key="concursos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="text-indigo-400" />
                      Central de Concursos & Editais
                    </h2>
                    <p className="text-xs text-slate-500">Gerencie múltiplos concursos e analise o edital</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
                    {examFolders.map(exam => {
                      const isActive = exam.id === activeExamId;
                      return (
                        <button
                          key={exam.id}
                          onClick={() => setActiveExamId(exam.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                            isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {exam.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-6">
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Wand2 size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Análise de Novo Edital</h3>
                      </div>
                      <textarea
                        value={aiInputText}
                        onChange={(e) => setAiInputText(e.target.value)}
                        placeholder="Cole o texto ou conteúdo do edital aqui..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white h-32 resize-none"
                      />
                      <button
                        onClick={handleTriggerAiEditalAnalysis}
                        disabled={isAiProcessing}
                        className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        {isAiProcessing ? 'Processando...' : 'Analisar Edital'}
                      </button>
                    </GlassCard>

                    <GlassCard className="p-6">
                      <h3 className="text-sm font-bold text-white mb-4">Informações Gerais</h3>
                      <div className="space-y-3 text-xs">
                        <p><strong>Banca:</strong> {activeExam.banca}</p>
                        <p><strong>Salário:</strong> {activeExam.salary}</p>
                        <p><strong>Vagas:</strong> {activeExam.vagas}</p>
                        <p><strong>Data da Prova:</strong> {activeExam.examDate}</p>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-7">
                    <GlassCard className="p-6">
                      <h3 className="text-sm font-bold text-white mb-6">Edital Verticalizado</h3>
                      <div className="space-y-6">
                        {activeExam.syllabus.map((subj, sIdx) => (
                          <div key={sIdx} className="space-y-3">
                            <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                              <span className="text-xs font-bold text-white uppercase">{subj.subjectName}</span>
                            </div>
                            <div className="space-y-2 pl-2">
                              {subj.topics.map((topic, tIdx) => (
                                <div key={tIdx} className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                                  <span className="text-xs text-slate-300">{topic.topicName}</span>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleToggleSyllabusMetric(activeExam.id, subj.subjectName, topic.topicName, 'completed')}
                                      className={`px-2 py-1 rounded text-[10px] ${topic.completed ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
                                    >
                                      Estudado
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-6">
                    <GlassCard className="p-6">
                      <h3 className="text-sm font-bold text-white mb-4">Criar Flashcards com IA</h3>
                      <textarea
                        value={ankiInputText}
                        onChange={(e) => setAnkiInputText(e.target.value)}
                        placeholder="Cole a lei seca ou resumo aqui..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white h-32"
                      />
                      <button
                        onClick={handleGenerateAnkiCards}
                        disabled={isAnkiGenerating}
                        className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                      >
                        {isAnkiGenerating ? 'Gerando...' : 'Gerar Cartões'}
                      </button>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-7">
                    {filteredCards.length > 0 && (
                      <div className="space-y-6">
                        <div 
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="min-h-[250px] bg-slate-950/80 border border-white/10 rounded-3xl p-8 flex flex-col justify-between cursor-pointer"
                        >
                          <span className="text-[10px] text-indigo-400 uppercase font-bold">{activeCard.subject}</span>
                          <div className="text-center my-auto">
                            {!isFlipped ? (
                              <p className="text-base text-white">{activeCard.front}</p>
                            ) : (
                              <p className="text-base text-slate-300">{activeCard.back}</p>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 text-center">Clique para virar</p>
                        </div>

                        {isFlipped && (
                          <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => handleRateAnkiCard(1)} className="p-3 bg-red-600/10 text-red-400 rounded-xl">Errei</button>
                            <button onClick={() => handleRateAnkiCard(2)} className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">Difícil</button>
                            <button onClick={() => handleRateAnkiCard(3)} className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">Bom</button>
                            <button onClick={() => handleRateAnkiCard(4)} className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">Fácil</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SUBJECTS */}
            {activeTab === 'subjects' && (
              <motion.div 
                key="subjects"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-4 p-6">
                    <h3 className="text-sm font-bold text-white mb-6">Registrar Exercícios</h3>
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
                      <select name="subject" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs">
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <input name="total" type="number" placeholder="Total de Questões" className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs" />
                      <input name="correct" type="number" placeholder="Acertos" className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs" />
                      <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">Salvar</button>
                    </form>
                  </GlassCard>

                  <div className="lg:col-span-8 space-y-4">
                    {subjects.map(sub => (
                      <GlassCard key={sub.id} className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                          <span className="text-xs text-emerald-400">{sub.accuracy}% de Precisão</span>
                        </div>
                        <ProgressBar progress={sub.progress} color={sub.color} />
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: LAB */}
            {activeTab === 'lab' && (
              <motion.div 
                key="lab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                <GlassCard className="lg:col-span-6 p-8">
                  <h3 className="text-sm font-bold text-white mb-6">Radar de Competências</h3>
                  <div className="h-[280px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar name="Precisão %" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* TAB 6: TIMER */}
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

            {/* TAB 7: CHRONICLES */}
            {activeTab === 'chronicles' && (
              <motion.div 
                key="chronicles"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-white">{log.subject}</h4>
                          <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">{log.correct}/{log.total} Acertos</span>
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
