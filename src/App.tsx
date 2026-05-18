# StudyFlow — Estrutura Otimizada para Vercel + TypeScript Strict

## 1. App.tsx

```tsx
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return <DashboardPage />;
}
```

---

# 2. types/index.ts

```ts
export interface Subject {
  id: string;
  name: string;
  progress: number;
  accuracy: number;
  color: string;
  mastery: string;
}

export interface QuestionLog {
  id: string;
  subject: string;
  total: number;
  correct: number;
  xpGained: number;
  timestamp: string;
}

export interface Flashcard {
  id: string;
  type: 'standard' | 'cloze';
  subject: string;
  front: string;
  back: string;
  easeFactor: number;
  repetitions: number;
  intervalDays: number;
}
```

---

# 3. data/mockData.ts

```ts
import type { Subject, QuestionLog, Flashcard } from '../types';

export const subjects: Subject[] = [
  {
    id: '1',
    name: 'Direito Administrativo',
    progress: 65,
    accuracy: 72,
    color: '#6366f1',
    mastery: 'Adepto'
  },
  {
    id: '2',
    name: 'Português',
    progress: 88,
    accuracy: 91,
    color: '#10b981',
    mastery: 'Mestre'
  }
];

export const logs: QuestionLog[] = [
  {
    id: '1',
    subject: 'Português',
    total: 20,
    correct: 17,
    xpGained: 240,
    timestamp: 'Hoje'
  }
];

export const flashcards: Flashcard[] = [
  {
    id: '1',
    type: 'standard',
    subject: 'Direito Constitucional',
    front: 'O que são cláusulas pétreas?',
    back: 'São limitações materiais ao poder de reforma constitucional.',
    easeFactor: 2.5,
    repetitions: 0,
    intervalDays: 1
  }
];
```

---

# 4. components/GlassCard.tsx

```tsx
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: Props) {
  return (
    <div
      className={`
        bg-slate-950/60
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

---

# 5. components/ProgressBar.tsx

```tsx
interface Props {
  progress: number;
  color: string;
}

export default function ProgressBar({ progress, color }: Props) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${safeProgress}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}
```

---

# 6. components/FocusTimer.tsx

```tsx
import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Props {
  onComplete: (xp: number) => void;
}

export default function FocusTimer({ onComplete }: Props) {
  const [seconds, setSeconds] = useState<number>(1500);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          onComplete(400);
          return 1500;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-white/10">
      <h2 className="text-6xl font-black text-center text-white mb-6">
        {minutes}:{secs}
      </h2>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsActive((prev) => !prev)}
          className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold flex items-center gap-2"
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            setSeconds(1500);
          }}
          className="p-3 rounded-xl bg-white/10 text-white"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
```

---

# 7. pages/DashboardPage.tsx

```tsx
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  GraduationCap,
  History
} from 'lucide-react';

import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import FocusTimer from '../components/FocusTimer';

import { subjects, logs, flashcards } from '../data/mockData';

export default function DashboardPage() {
  const [xp, setXp] = useState<number>(1200);

  const progress = useMemo(() => {
    return Math.round((xp / 2000) * 100);
  }, [xp]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex">
      <aside className="w-64 border-r border-white/5 p-6 hidden lg:flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-white italic">
            STUDYFLOW
          </h1>
        </div>

        <nav className="space-y-3">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarItem icon={<BookOpen size={18} />} label="Matérias" />
          <SidebarItem icon={<GraduationCap size={18} />} label="Flashcards" />
          <SidebarItem icon={<Clock size={18} />} label="Focus Timer" />
          <SidebarItem icon={<History size={18} />} label="Histórico" />
        </nav>

        <div className="mt-auto">
          <ProgressBar progress={progress} color="#6366f1" />
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">
            Painel Arcano
          </h2>
          <p className="text-slate-500">
            Sistema otimizado para Vercel + TypeScript Strict
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <GlassCard key={subject.id} className="p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-white">
                  {subject.name}
                </h3>

                <span className="text-emerald-400 text-sm font-bold">
                  {subject.accuracy}%
                </span>
              </div>

              <ProgressBar
                progress={subject.progress}
                color={subject.color}
              />
            </GlassCard>
          ))}
        </div>

        <FocusTimer
          onComplete={(gainedXp) => {
            setXp((prev) => prev + gainedXp);
          }}
        />

        <GlassCard className="p-6">
          <h3 className="text-white font-bold mb-6">
            Últimos Estudos
          </h3>

          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5"
              >
                <div>
                  <h4 className="text-white font-bold text-sm">
                    {log.subject}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {log.timestamp}
                  </p>
                </div>

                <div className="text-emerald-400 font-bold text-sm">
                  {log.correct}/{log.total}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-white font-bold mb-6">
            Flashcards
          </h3>

          <div className="space-y-4">
            {flashcards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-white/5"
              >
                <p className="text-indigo-400 text-xs font-bold mb-2">
                  {card.subject}
                </p>

                <p className="text-white mb-4">
                  {card.front}
                </p>

                <p className="text-slate-400 text-sm">
                  {card.back}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
}

function SidebarItem({ icon, label }: SidebarItemProps) {
  return (
    <button
      className="
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-xl
        text-slate-400
        hover:text-white
        hover:bg-white/5
        transition-all
      "
    >
      {icon}
      <span className="font-bold text-sm">
        {label}
      </span>
    </button>
  );
}
```

---

# 8. vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
```

---

# 9. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": []
}
```

---

# 10. package.json

```json
{
  "name": "studyflow",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2",
    "vite": "^6.0.1"
  }
}
```

---

# 11. Estrutura profissional

```txt
src/
 ├── components/
 │    ├── FocusTimer.tsx
 │    ├── GlassCard.tsx
 │    └── ProgressBar.tsx
 │
 ├── pages/
 │    └── DashboardPage.tsx
 │
 ├── data/
 │    └── mockData.ts
 │
 ├── types/
 │    └── index.ts
 │
 ├── App.tsx
 ├── main.tsx
 └── index.css
```

---

# 12. Comandos finais

```bash
npm install
```

Depois:

```bash
npm run build
```

Se aparecer:

```bash
✓ built successfully
```

está 100% compatível com:

* Vercel
* TypeScript strict
* ESLint
* produção
* React 18
* Vite
* Tailwind
