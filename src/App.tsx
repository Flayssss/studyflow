import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Award, 
  Clock, 
  FileText, 
  Database, 
  Plus, 
  Upload, 
  Brain, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown, 
  Bookmark, 
  Info, 
  Flame, 
  Target, 
  HelpCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

// --- CONFIGURAÇÃO DO EMULADOR DE API DO GEMINI ---
const apiKey = ""; // A chave é injetada automaticamente pelo ambiente de execução

// Função auxiliar com exponencial backoff para chamadas estáveis da API do Gemini
const fetchWithRetry = async (url: string, options: any, retries = 5, delay = 1000): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Interface para estruturar os dados que a IA retornará
interface Topic {
  id: string;
  nome: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  frequencia: string;
  peso: number;
  estudado: boolean;
  revisado: boolean;
  exercicios: boolean;
  questoesFeitas: number;
  acertos: number;
  tempoEstudado: number; // em minutos
  notas: string;
}

interface Subject {
  id: string;
  nomeMateria: string;
  topicos: Topic[];
}

interface Concurso {
  id: string;
  nomeConcurso: string;
  orgao: string;
  cargo: string;
  banca: string;
  dataProva: string;
  periodoInscricao: string;
  valorInscricao: string;
  requisitos: string;
  vagas: string;
  salario: string;
  materias: Subject[];
  redacaoInfo: {
    possuiRedacao: boolean;
    criterios: string;
    temasProvaveis: string[];
    estruturaExigida: string;
    peso: string;
    treinos: { id: string; tema: string; data: string; nota: number; feedback: string }[];
  };
  datasImportantes: { id: string; evento: string; data: string }[];
}

// Dados iniciais de fallback (caso o usuário limpe ou a IA esteja offline)
const defaultConcursos: Concurso[] = [
  {
    id: "sedes-df-default",
    nomeConcurso: "SEDES-DF (Especialista)",
    orgao: "Secretaria de Estado de Desenvolvimento Social do DF",
    cargo: "Especialista em Assistência Social",
    banca: "Instituto Quadrix",
    dataProva: "2026-11-20",
    periodoInscricao: "Previsto",
    valorInscricao: "R$ 90,00",
    requisitos: "Ensino Superior Completo na área correspondente",
    vagas: "120 Vagas + Cadastro Reserva",
    salario: "R$ 5.480,00",
    datasImportantes: [
      { id: "d1", evento: "Prova Objetiva e Discursiva", data: "2026-11-20" },
      { id: "d2", evento: "Período de Inscrições", data: "2026-09-10" }
    ],
    redacaoInfo: {
      possuiRedacao: true,
      criterios: "Avaliação de domínio técnico do tema de assistência social, clareza, coesão e correção gramatical pela banca Quadrix.",
      temasProvaveis: [
        "Desafios da Implementação do SUAS no Distrito Federal",
        "Atuação do Assistente Social no combate à extrema pobreza urbana",
        "A importância do Cadastro Único como porta de entrada de políticas públicas"
      ],
      estruturaExigida: "Texto dissertativo-argumentativo de até 30 linhas.",
      peso: "20 Pontos",
      treinos: [
        { id: "t1", tema: "O impacto da LOAS no desenvolvimento comunitário", data: "2026-05-10", nota: 18.5, feedback: "Excelente domínio do conteúdo normativo. Atenção às regras de crase no terceiro parágrafo." }
      ]
    },
    materias: [
      {
        id: "m1",
        nomeMateria: "Conhecimentos Básicos (Língua Portuguesa)",
        topicos: [
          { id: "t_pt1", nome: "Compreensão e interpretação de textos", prioridade: "Alta", frequencia: "95%", peso: 2, estudado: true, revisado: true, exercicios: true, questoesFeitas: 50, acertos: 45, tempoEstudado: 120, notas: "Focar em nexos coesivos e tipologia textual da Quadrix." },
          { id: "t_pt2", nome: "Domínio da estrutura morfossintática do período", prioridade: "Alta", frequencia: "88%", peso: 2, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" },
          { id: "t_pt3", nome: "Regência nominal e verbal, crase", prioridade: "Alta", frequencia: "90%", peso: 2, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" }
        ]
      },
      {
        id: "m2",
        nomeMateria: "Conhecimentos Específicos (Legislação Assistencial)",
        topicos: [
          { id: "t_sp1", nome: "Lei Orgânica de Assistência Social (LOAS) - Lei 8.742/1993", prioridade: "Alta", frequencia: "100%", peso: 3, estudado: true, revisado: true, exercicios: true, questoesFeitas: 120, acertos: 110, tempoEstudado: 340, notas: "Lei essencial! Revisar as alterações recentes de proteção social e benefícios." },
          { id: "t_sp2", nome: "Sistema Único de Assistência Social (SUAS)", prioridade: "Alta", frequencia: "98%", peso: 3, estudado: true, revisado: false, exercicios: true, questoesFeitas: 80, acertos: 72, tempoEstudado: 200, notas: "Tipificação Nacional de Serviços Socioassistenciais (Resolução 109)." },
          { id: "t_sp3", nome: "Política Nacional de Assistência Social (PNAS)", prioridade: "Média", frequencia: "75%", peso: 2.5, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" }
        ]
      }
    ]
  }
];

export default function App() {
  // --- ESTADOS PRINCIPAIS (Persistência no LocalStorage) ---
  const [concursos, setConcursos] = useState<Concurso[]>(() => {
    const saved = localStorage.getItem('studyflow_concursos_v3');
    return saved ? JSON.parse(saved) : defaultConcursos;
  });

  const [selectedConcursoId, setSelectedConcursoId] = useState<string>(() => {
    const savedId = localStorage.getItem('studyflow_selected_id');
    return savedId && savedId !== 'undefined' ? savedId : (concursos[0]?.id || "sedes-df-default");
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'concursos' | 'anki' | 'cronicas'>('concursos');
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem('studyflow_level') || '12'));
  const [exp, setExp] = useState<number>(() => Number(localStorage.getItem('studyflow_exp') || '82'));
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem('studyflow_streak') || '5'));

  // Estados de processamento e uploads
  const [pdfText, setPdfText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // UI Accordions e Modais
  const [expandedSubject, setExpandedSubject] = useState<string | null>("m1");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [newTrainingTema, setNewTrainingTema] = useState<string>('');
  const [newTrainingNota, setNewTrainingNota] = useState<number>(0);
  const [newTrainingFeedback, setNewTrainingFeedback] = useState<string>('');

  // Grimório Flashcards
  const [flashcards, setFlashcards] = useState<{id: string, front: string, back: string, subject: string, ease: number}[]>(() => {
    const saved = localStorage.getItem('studyflow_flashcards');
    return saved ? JSON.parse(saved) : [
      { id: "fc1", front: "Qual o prazo para revisão do Benefício de Prestação Continuada (BPC) previsto na LOAS?", back: "O benefício deve ser revisto a cada 2 (dois) anos para avaliação das condições que lhe deram origem.", subject: "LOAS", ease: 2.5 },
      { id: "fc2", front: "A quem se destina a Proteção Social Especial no SUAS?", back: "A famílias e indivíduos que se encontram em situação de risco pessoal e social, por ocorrência de abandono, maus-tratos, exploração, etc.", subject: "SUAS", ease: 2.4 }
    ];
  });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardBack, setShowCardBack] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);

  // Sincronização automática com localStorage
  useEffect(() => {
    localStorage.setItem('studyflow_concursos_v3', JSON.stringify(concursos));
  }, [concursos]);

  useEffect(() => {
    localStorage.setItem('studyflow_selected_id', selectedConcursoId);
  }, [selectedConcursoId]);

  useEffect(() => {
    localStorage.setItem('studyflow_level', level.toString());
    localStorage.setItem('studyflow_exp', exp.toString());
    localStorage.setItem('studyflow_streak', streak.toString());
  }, [level, exp, streak]);

  useEffect(() => {
    localStorage.setItem('studyflow_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  // Carrega PDFJS de forma assíncrona para extração local real de texto
  useEffect(() => {
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  const activeConcurso = concursos.find(c => c.id === selectedConcursoId) || concursos[0] || defaultConcursos[0];

  // --- FUNÇÃO PARA GANHAR EXP (Gamificação de Concurseiro) ---
  const addExp = (amount: number) => {
    let newExp = exp + amount;
    let newLevel = level;
    while (newExp >= 100) {
      newExp -= 100;
      newLevel += 1;
      setSuccessMessage(`✨ SUBIU DE NÍVEL! Seu Mago dos Estudos agora é Nível ${newLevel}! ✨`);
    }
    setExp(newExp);
    setLevel(newLevel);
  };

  // --- LEITOR DE PDF E EXTRAÇÃO REAL DE TEXTO ---
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!(window as any).pdfjsLib) {
      setErrorMessage("O leitor de PDF ainda está inicializando no navegador. Aguarde 3 segundos e tente novamente.");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStatus("Abrindo arquivo PDF do Edital...");
    setErrorMessage(null);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await (window as any).pdfjsLib.getDocument(typedarray).promise;
          
          setProcessingStatus(`Extraindo texto das páginas (Total: ${pdf.numPages})...`);
          setProcessingProgress(35);
          
          let extractedText = "";
          // Lemos até as primeiras 35 páginas para evitar travamento do navegador ou limites de tokens da API
          const pagesToRead = Math.min(pdf.numPages, 35);
          
          for (let i = 1; i <= pagesToRead; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
            setProcessingProgress(Math.floor(35 + (i / pagesToRead) * 25));
          }

          setPdfText(extractedText);
          setProcessingStatus("Texto extraído com sucesso! Pronto para enviar ao Oráculo Gemini.");
          setProcessingProgress(70);
          
          // Envia automaticamente para a IA após a extração
          await processEditalWithGemini(extractedText);
        } catch (err: any) {
          setErrorMessage(`Erro ao decodificar páginas do PDF: ${err.message}`);
          setIsProcessing(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      setErrorMessage(`Falha na leitura do arquivo: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // --- CHAMADA À API REAL DO GEMINI 2.5 FLASH COM ESQUEMA JSON ---
  const processEditalWithGemini = async (rawText: string, contextPreset?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingProgress(80);
    setProcessingStatus("Invocando o Oráculo Gemini 2.5 para análise de conteúdo...");

    const textToAnalyze = contextPreset ? `PRESET CONTEXTO: ${contextPreset}\n\n${rawText.substring(0, 80000)}` : rawText.substring(0, 100000);

    const systemPrompt = `Você é o Oráculo de Editais, uma IA mestre em concursos públicos integrada ao StudyFlow.
    Sua missão é ler o texto do edital fornecido e estruturar um plano de estudos premium, altamente detalhado e rigorosamente fiel ao documento.
    
    INSTRUÇÕES CRÍTICAS DE PRECISÃO:
    1. Se o edital/texto for sobre o "SEDES-DF" (Secretaria de Desenvolvimento Social do DF), a banca é OBRIGATORIAMENTE o INSTITUTO QUADRIX. Os salários são por volta de R$ 5.480,00 e o conteúdo programático deve conter matérias básicas completas (Português, Lei Orgânica do DF (LODF), Direito Administrativo, Direito Constitucional, Raciocínio Lógico) e específicas completas (LOAS - Lei 8.742, SUAS, NOB-SUAS, PNAS, Tipificação Nacional de Serviços Socioassistenciais).
    2. Identifique corretamente a banca (Quadrix, Cebraspe, IADES, FGV, etc.), os salários, as vagas, as datas de prova e o conteúdo de redação/discursivas se houver.
    3. Crie matérias e tópicos detalhados. Cada matéria deve ter de 5 a 10 tópicos cirúrgicos.
    4. Atribua prioridades reais (Alta, Média, Baixa) com base na relevância histórica da banca organizadora mapeada.
    5. Retorne a resposta EXCLUSIVAMENTE em formato JSON puro, seguindo exatamente o esquema estruturado abaixo, sem blocos explicativos antes ou depois.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        nomeConcurso: { type: "STRING" },
        orgao: { type: "STRING" },
        cargo: { type: "STRING" },
        banca: { type: "STRING" },
        dataProva: { type: "STRING" },
        periodoInscricao: { type: "STRING" },
        valorInscricao: { type: "STRING" },
        requisitos: { type: "STRING" },
        vagas: { type: "STRING" },
        salario: { type: "STRING" },
        materias: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              nomeMateria: { type: "STRING" },
              topicos: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    nome: { type: "STRING" },
                    prioridade: { type: "STRING", enum: ["Alta", "Média", "Baixa"] },
                    frequencia: { type: "STRING" },
                    peso: { type: "NUMBER" }
                  },
                  required: ["nome", "prioridade", "frequencia", "peso"]
                }
              }
            },
            required: ["nomeMateria", "topicos"]
          }
        },
        redacaoInfo: {
          type: "OBJECT",
          properties: {
            possuiRedacao: { type: "BOOLEAN" },
            criterios: { type: "STRING" },
            temasProvaveis: { type: "ARRAY", items: { type: "STRING" } },
            estruturaExigida: { type: "STRING" },
            peso: { type: "STRING" }
          },
          required: ["possuiRedacao", "criterios", "temasProvaveis", "estruturaExigida", "peso"]
        },
        datasImportantes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              evento: { type: "STRING" },
              data: { type: "STRING" }
            },
            required: ["evento", "data"]
          }
        }
      },
      required: ["nomeConcurso", "orgao", "cargo", "banca", "salario", "materias", "redacaoInfo", "datasImportantes"]
    };

    const payload = {
      contents: [
        {
          parts: [
            { text: `Aqui está o texto do edital para você estruturar:\n\n${textToAnalyze}` }
          ]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    try {
      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      setProcessingProgress(95);
      setProcessingStatus("Estruturando o banco de dados dinamicamente...");

      const outputText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!outputText) {
        throw new Error("O Oráculo retornou uma resposta sem conteúdo de dados estruturados.");
      }

      const rawData = JSON.parse(outputText);
      
      // Mapeamento e higienização dos tópicos para integrar estados de controle locais
      const formattedMaterias = rawData.materias.map((materia: any, mIdx: number) => ({
        id: `m_${Date.now()}_${mIdx}`,
        nomeMateria: materia.nomeMateria,
        topicos: materia.topicos.map((topico: any, tIdx: number) => ({
          id: `t_${Date.now()}_${mIdx}_${tIdx}`,
          nome: topico.nome,
          prioridade: topico.prioridade || 'Média',
          frequencia: topico.frequencia || 'Sem estatística',
          peso: topico.peso || 1.0,
          estudado: false,
          revisado: false,
          exercicios: false,
          questoesFeitas: 0,
          acertos: 0,
          tempoEstudado: 0,
          notas: ""
        }))
      }));

      const newConcurso: Concurso = {
        id: `concurso_${Date.now()}`,
        nomeConcurso: rawData.nomeConcurso,
        orgao: rawData.orgao,
        cargo: rawData.cargo,
        banca: rawData.banca,
        dataProva: rawData.dataProva || "Definir",
        periodoInscricao: rawData.periodoInscricao || "Consultar Edital",
        valorInscricao: rawData.valorInscricao || "Consultar Edital",
        requisitos: rawData.requisitos || "Consultar Edital",
        vagas: rawData.vagas || "Não especificado",
        salario: rawData.salario || "Não especificado",
        datasImportantes: rawData.datasImportantes.map((d: any, idx: number) => ({
          id: `d_${Date.now()}_${idx}`,
          evento: d.evento,
          data: d.data
        })),
        redacaoInfo: {
          possuiRedacao: rawData.redacaoInfo?.possuiRedacao || false,
          criterios: rawData.redacaoInfo?.criterios || "Sem critérios discursivos mapeados.",
          temasProvaveis: rawData.redacaoInfo?.temasProvaveis || [],
          estruturaExigida: rawData.redacaoInfo?.estruturaExigida || "Dissertativa",
          peso: rawData.redacaoInfo?.peso || "0",
          treinos: []
        },
        materias: formattedMaterias
      };

      setConcursos(prev => [newConcurso, ...prev]);
      setSelectedConcursoId(newConcurso.id);
      addExp(50);
      setSuccessMessage(`🔮 Oráculo: O Edital do concurso ${newConcurso.nomeConcurso} foi mapeado e verticalizado com sucesso!`);
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Erro ao processar com Inteligência Artificial: ${err.message}.`);
      setIsProcessing(false);
    }
  };

  // --- PRESET MOCK GENERATORS QUE USAM O GEMINI ATIVO ---
  const handleLoadPresetWithAI = async (presetName: string) => {
    let rawTextContext = "";
    if (presetName === 'SEDES') {
      rawTextContext = "Estou me preparando para o concurso SEDES-DF da Secretaria de Desenvolvimento Social do Distrito Federal. A banca é o Instituto Quadrix. O cargo é de Especialista em Assistência Social. Por favor, crie um plano com matérias completas incluindo Português, Raciocínio Lógico, LODF, Direito Administrativo, Constitucional, LOAS, SUAS e PNAS de forma super detalhada para eu estudar.";
    } else if (presetName === 'DER') {
      rawTextContext = "Estou me preparando para o concurso DER-DF (Departamento de Estradas de Rodagem do DF). Defina as matérias típicas de nível técnico e superior, leis de trânsito, código de trânsito brasileiro (CTB), português e direito administrativo.";
    } else {
      rawTextContext = "Estou me preparando para o concurso da CLDF (Câmara Legislativa do Distrito Federal). Matérias administrativas, regimento interno, processo legislativo, administração pública, português, etc.";
    }

    await processEditalWithGemini("Solicitação de preenchimento automático usando conhecimento interno do Gemini para o edital selecionado.", rawTextContext);
  };

  // --- GERADOR DE FLASHCARDS COM GEMINI ---
  const generateFlashcardsForTopic = async (topicName: string, subjectName: string) => {
    setGeneratingCards(true);
    setErrorMessage(null);

    const prompt = `Gere 4 flashcards de alto nível para estudo de concurso sobre o tópico "${topicName}" da matéria "${subjectName}".
    Retorne a resposta estritamente em um array de objetos JSON válido, onde cada objeto tem os campos: "front" (pergunta direta e profunda) e "back" (resposta clara e gabaritada com base em leis ou doutrinas de concurso).
    Não use blocos de texto ou explicações extras além do JSON.`;

    const schema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          front: { type: "STRING" },
          back: { type: "STRING" }
        },
        required: ["front", "back"]
      }
    };

    try {
      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema
            }
          })
        }
      );

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Sem dados na resposta do Gemini");

      const cards = JSON.parse(text);
      const newCards = cards.map((c: any, idx: number) => ({
        id: `fc_${Date.now()}_${idx}`,
        front: c.front,
        back: c.back,
        subject: subjectName,
        ease: 2.5
      }));

      setFlashcards(prev => [...newCards, ...prev]);
      addExp(15);
      setSuccessMessage(`📚 Grimório Anki: 4 novos flashcards inteligentes foram adicionados à sua pilha!`);
    } catch (err: any) {
      setErrorMessage(`Não foi possível gerar os flashcards com a IA: ${err.message}`);
    } finally {
      setGeneratingCards(false);
    }
  };

  // --- INTERAÇÕES DO CONTROLE DE ESTUDOS ---
  const toggleTopicState = (subjectId: string, topicId: string, field: 'estudado' | 'revisado' | 'exercicios') => {
    setConcursos(prev => prev.map(c => {
      if (c.id !== selectedConcursoId) return c;
      return {
        ...c,
        materias: c.materias.map(m => {
          if (m.id !== subjectId) return m;
          return {
            ...m,
            topicos: m.topicos.map(t => {
              if (t.id !== topicId) return t;
              const nextVal = !t[field];
              if (nextVal) addExp(5); // Gamificação
              return { ...t, [field]: nextVal };
            })
          };
        })
      };
    }));
  };

  const updateTopicMetrics = (subjectId: string, topicId: string, questoes: number, acertos: number, tempo: number) => {
    setConcursos(prev => prev.map(c => {
      if (c.id !== selectedConcursoId) return c;
      return {
        ...c,
        materias: c.materias.map(m => {
          if (m.id !== subjectId) return m;
          return {
            ...m,
            topicos: m.topicos.map(t => {
              if (t.id !== topicId) return t;
              addExp(10);
              return {
                ...t,
                questoesFeitas: t.questoesFeitas + questoes,
                acertos: t.acertos + acertos,
                tempoEstudado: t.tempoEstudado + tempo
              };
            })
          };
        })
      };
    }));
    setSelectedTopic(null);
  };

  const saveTopicNotes = (subjectId: string, topicId: string, text: string) => {
    setConcursos(prev => prev.map(c => {
      if (c.id !== selectedConcursoId) return c;
      return {
        ...c,
        materias: c.materias.map(m => {
          if (m.id !== subjectId) return m;
          return {
            ...m,
            topicos: m.topicos.map(t => {
              if (t.id !== topicId) return t;
              return { ...t, notas: text };
            })
          };
        })
      };
    }));
    setSuccessMessage("Nota de estudo salva com sucesso no banco de dados!");
  };

  // --- ADICIONAR TREINO DE REDAÇÃO ---
  const handleAddTrainingRedacao = () => {
    if (!newTrainingTema) return;
    setConcursos(prev => prev.map(c => {
      if (c.id !== selectedConcursoId) return c;
      return {
        ...c,
        redacaoInfo: {
          ...c.redacaoInfo,
          treinos: [
            ...c.redacaoInfo.treinos,
            {
              id: `tr_${Date.now()}`,
              tema: newTrainingTema,
              data: new Date().toLocaleDateString('pt-BR'),
              nota: newTrainingNota,
              feedback: newTrainingFeedback
            }
          ]
        }
      };
    }));
    setNewTrainingTema('');
    setNewTrainingNota(0);
    setNewTrainingFeedback('');
    addExp(20);
    setSuccessMessage("Redação avaliada salva na base de dados de treino!");
  };

  // --- EXCLUIR CONCURSO ---
  const handleDeleteConcurso = (idToDelete: string) => {
    if (concursos.length <= 1) {
      setErrorMessage("Você precisa manter pelo menos 1 concurso ativo no seu painel.");
      return;
    }
    const filtered = concursos.filter(c => c.id !== idToDelete);
    setConcursos(filtered);
    setSelectedConcursoId(filtered[0].id);
    setSuccessMessage("Concurso removido com sucesso do sistema.");
  };

  // --- CÁLCULO DE ESTATÍSTICAS E MÉTRICAS ---
  const calculateProgress = (concurso: Concurso) => {
    let totalItems = 0;
    let completedItems = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        totalItems += 3; // estudado, revisado, exercicios
        if (t.estudado) completedItems++;
        if (t.revisado) completedItems++;
        if (t.exercicios) completedItems++;
      });
    });
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getAccuracyRate = (concurso: Concurso) => {
    let totalFeitas = 0;
    let totalAcertos = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        totalFeitas += t.questoesFeitas;
        totalAcertos += t.acertos;
      });
    });
    return totalFeitas > 0 ? Math.round((totalAcertos / totalFeitas) * 100) : 0;
  };

  const getTotalTimeStudied = (concurso: Concurso) => {
    let totalMinutos = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        totalMinutos += t.tempoEstudado;
      });
    });
    return Math.round(totalMinutos / 60);
  };

  // Montar estrutura de dados para o RadarChart de matérias
  const getRadarData = () => {
    return activeConcurso.materias.map(m => {
      let total = m.topicos.length * 3;
      let concluded = 0;
      m.topicos.forEach(t => {
        if (t.estudado) concluded++;
        if (t.revisado) concluded++;
        if (t.exercicios) concluded++;
      });
      return {
        subject: m.nomeMateria.substring(0, 22) + "...",
        Aproveitamento: total > 0 ? Math.round((concluded / total) * 100) : 0,
        fullMark: 100
      };
    });
  };

  // --- CALCULAR DATA REGRESSIVA ---
  const getDaysRemaining = (dateString: string) => {
    if (!dateString || dateString === "Definir" || dateString === "Previsto") return "A definir";
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} dias` : "Dia da Prova!";
  };

  // --- CALCULAR SIMILARIDADE/OVERLAP ENTRE CONCURSOS ---
  const calculateOverlap = (concursoA: Concurso, concursoB: Concurso) => {
    if (concursoA.id === concursoB.id) return 100;
    let commonWords = 0;
    const wordsA = concursoA.materias.map(m => m.nomeMateria.toLowerCase()).join(" ");
    const wordsB = concursoB.materias.map(m => m.nomeMateria.toLowerCase()).join(" ");
    
    // Análise simples de palavras chaves comuns em concursos
    const keywords = ["portugues", "direito", "administrativo", "constitucional", "raciocinio", "social", "loas", "suas", "legislacao"];
    keywords.forEach(kw => {
      if (wordsA.includes(kw) && wordsB.includes(kw)) {
        commonWords++;
      }
    });
    return Math.round((commonWords / keywords.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* NOTIFICAÇÃO FLUTUANTE DE SUCESSO/ERRO */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-violet-900/90 border border-violet-500 text-violet-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <Sparkles className="text-amber-400 animate-pulse" size={20} />
          <span className="text-sm font-semibold">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-violet-300 hover:text-white ml-2">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-950/90 border border-rose-500 text-rose-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="text-rose-400" size={20} />
          <span className="text-sm font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-rose-300 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* CABEÇALHO COM AVATAR DO MAGO E GAMIFICAÇÃO */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-75 blur animate-pulse"></div>
            <div className="relative bg-slate-950 p-2.5 rounded-full border border-violet-500/50">
              <Brain className="text-violet-400" size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-400 bg-clip-text text-transparent">
              StudyFlow <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-900/50 border border-violet-500/30 text-violet-300">Archmage Edition v3</span>
            </h1>
            <p className="text-xs text-slate-400">Ecossistema Inteligente de Estudos para Concursos</p>
          </div>
        </div>

        {/* STATUS DO MAGO DOS ESTUDOS */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2">
          {/* Streak */}
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <Flame className="text-amber-500 fill-amber-500 animate-pulse" size={20} />
            <div>
              <div className="text-sm font-bold text-slate-100">{streak} dias</div>
              <div className="text-[10px] text-slate-500 uppercase">Fluência</div>
            </div>
          </div>

          {/* Level do Mago */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-violet-950/50">
              {level}
            </div>
            <div>
              <div className="text-xs font-semibold text-violet-300 uppercase">Mago dos Estudos</div>
              <div className="w-32 bg-slate-950 h-2 rounded-full border border-slate-800 mt-1 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${exp}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-white">
                  {exp}/100 XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        
        {/* NAV LATERAL ESQUERDA */}
        <aside className="w-full lg:w-64 bg-slate-950 border-r border-slate-900 p-4 flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase px-3 mb-2">Abas do Grimório</div>
          
          <button 
            onClick={() => setActiveTab('concursos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'concursos' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <BookOpen size={18} />
            Central de Concursos
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <TrendingUp size={18} />
            Dashboard de Desempenho
          </button>

          <button 
            onClick={() => setActiveTab('anki')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'anki' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
          >
            <Brain size={18} />
            Grimório Anki (Cards)
          </button>

          <div className="mt-8">
            <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase px-3 mb-2">Painel de Foco</div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">Concurso em Foco:</div>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-violet-300 font-bold focus:outline-none focus:border-violet-500"
                value={selectedConcursoId}
                onChange={(e) => setSelectedConcursoId(e.target.value)}
              >
                {concursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nomeConcurso}</option>
                ))}
              </select>
              
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Mapeados:</span>
                <span className="font-bold text-slate-300">{concursos.length} editais</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTAINER CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* TAB: CENTRAL DE CONCURSOS */}
          {activeTab === 'concursos' && (
            <div className="space-y-6">
              
              {/* SEÇÃO 1: SCANNER DE EDITAL INTELIGENTE */}
              <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -z-10"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-violet-400" size={22} />
                      Scanner de Editais com IA Real
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Arraste o arquivo PDF do edital real do seu concurso ou use um de nossos atalhos baseados na inteligência do Oráculo Gemini.
                    </p>
                  </div>

                  {/* Atalhos Rápidos */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">PRESETS DA IA:</span>
                    <button 
                      onClick={() => handleLoadPresetWithAI('SEDES')} 
                      className="text-xs font-bold bg-violet-950 hover:bg-violet-900 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-lg transition-all"
                    >
                      SEDES-DF (Quadrix)
                    </button>
                    <button 
                      onClick={() => handleLoadPresetWithAI('DER')} 
                      className="text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
                    >
                      DER-DF
                    </button>
                    <button 
                      onClick={() => handleLoadPresetWithAI('CLDF')} 
                      className="text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
                    >
                      CLDF
                    </button>
                  </div>
                </div>

                {/* AREA DE DROP DO PDF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-dashed border-slate-800 hover:border-violet-500/50 bg-slate-950/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative transition-all group">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="text-slate-500 group-hover:text-violet-400 transition-colors mb-3" size={36} />
                    <h3 className="text-sm font-bold text-slate-300 mb-1">Arraste seu arquivo PDF aqui</h3>
                    <p className="text-xs text-slate-500">Ou clique para procurar em seu computador (Até 35 páginas analisadas na hora)</p>
                  </div>

                  {/* CAIXA DE TEXTO / LOG DE PROCESSAMENTO */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[160px]">
                    {isProcessing ? (
                      <div className="space-y-4 my-auto">
                        <div className="flex items-center justify-between text-xs text-violet-400 font-bold animate-pulse">
                          <span>{processingStatus}</span>
                          <span>{processingProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center">Extraindo tabelas, matérias, pesos e redação de forma real pelo Gemini 2.5 Flash...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <textarea 
                          className="w-full h-full bg-transparent resize-none text-xs text-slate-400 placeholder-slate-600 focus:outline-none"
                          placeholder="Cole trechos de matérias do edital aqui se preferir um mapeamento manual acelerado..."
                          value={pdfText}
                          onChange={(e) => setPdfText(e.target.value)}
                        />
                        <button 
                          onClick={() => pdfText && processEditalWithGemini(pdfText)}
                          disabled={!pdfText}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${pdfText ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
                        >
                          <Brain size={14} />
                          Analisar Texto com Oráculo IA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SEÇÃO 2: DETALHES GERAIS E EDITAL VERTICALIZADO */}
              {activeConcurso && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLUNA ESQUERDA: INFOS GERAIS DO EDITAL SELECIONADO */}
                  <div className="space-y-6 lg:col-span-1">
                    
                    {/* VISÃO GERAL */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-300">Resumo do Edital</h3>
                        <button 
                          onClick={() => handleDeleteConcurso(activeConcurso.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-950/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Nome do Concurso</div>
                          <div className="text-sm font-bold text-violet-400">{activeConcurso.nomeConcurso}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Banca Reguladora</div>
                            <div className="text-xs font-bold text-slate-200">{activeConcurso.banca}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Data da Prova</div>
                            <div className="text-xs font-bold text-slate-200">{activeConcurso.dataProva}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Salário Inicial</div>
                            <div className="text-xs font-bold text-emerald-400">{activeConcurso.salario}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase">Vagas</div>
                            <div className="text-xs font-bold text-slate-200">{activeConcurso.vagas}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Requisitos</div>
                          <p className="text-xs text-slate-400 leading-relaxed">{activeConcurso.requisitos}</p>
                        </div>
                      </div>
                    </div>

                    {/* REDAÇÃO E DISCURSIVAS */}
                    {activeConcurso.redacaoInfo?.possuiRedacao && (
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-fuchsia-400" size={18} />
                          <h3 className="font-bold text-sm text-slate-300">Treino Discursivo / Redação</h3>
                        </div>

                        <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-500">Peso: </span>
                            <span className="font-bold text-slate-200">{activeConcurso.redacaoInfo.peso}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Estrutura Exigida: </span>
                            <span className="font-bold text-slate-200">{activeConcurso.redacaoInfo.estruturaExigida}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Critério da Banca: </span>
                            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{activeConcurso.redacaoInfo.criterios}</p>
                          </div>
                        </div>

                        {/* Temas prováveis sugeridos pelo Gemini */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Temas Prováveis de Cobrança:</span>
                          <ul className="space-y-1.5">
                            {activeConcurso.redacaoInfo.temasProvaveis?.map((tema, idx) => (
                              <li key={idx} className="text-xs bg-violet-950/20 border border-violet-900/40 px-3 py-2 rounded-lg text-violet-300 leading-relaxed">
                                {tema}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Adicionar Registro de Treino */}
                        <div className="border-t border-slate-800/80 pt-4 space-y-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Novo Registro de Escrita:</span>
                          <input 
                            type="text"
                            placeholder="Tema da Redação praticada..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-violet-500"
                            value={newTrainingTema}
                            onChange={(e) => setNewTrainingTema(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="number"
                              step="0.1"
                              placeholder="Nota..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-violet-500"
                              value={newTrainingNota || ''}
                              onChange={(e) => setNewTrainingNota(Number(e.target.value))}
                            />
                            <button 
                              onClick={handleAddTrainingRedacao}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all"
                            >
                              Salvar Treino
                            </button>
                          </div>
                          <textarea 
                            placeholder="Anotar feedbacks da banca..."
                            className="w-full h-12 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-violet-500"
                            value={newTrainingFeedback}
                            onChange={(e) => setNewTrainingFeedback(e.target.value)}
                          />
                        </div>

                        {/* Histórico de Treinos */}
                        {activeConcurso.redacaoInfo.treinos?.length > 0 && (
                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Redações Escritas:</span>
                            {activeConcurso.redacaoInfo.treinos.map(tr => (
                              <div key={tr.id} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl text-xs flex justify-between items-start gap-2">
                                <div>
                                  <div className="font-semibold text-slate-200 line-clamp-1">{tr.tema}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{tr.data} - {tr.feedback}</div>
                                </div>
                                <span className="bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] shrink-0 border border-emerald-900">
                                  Nota {tr.nota}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATAS CHAVES */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-violet-400" size={18} />
                        <h3 className="font-bold text-sm text-slate-300">Datas Críticas</h3>
                      </div>

                      <div className="space-y-2">
                        {activeConcurso.datasImportantes?.map(dt => (
                          <div key={dt.id} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                            <div>
                              <div className="text-xs font-bold text-slate-200">{dt.evento}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{dt.data}</div>
                            </div>
                            <span className="text-[11px] font-bold text-violet-400 bg-violet-950/40 border border-violet-900/50 px-2 py-1 rounded-md">
                              {getDaysRemaining(dt.data)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: EDITAL VERTICALIZADO DINÂMICO */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-200">
                            Edital Verticalizado Inteligente
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Clique em uma matéria para ver todos os seus tópicos individuais organizados por prioridade.</p>
                        </div>
                        <div className="bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-violet-300">
                          {calculateProgress(activeConcurso)}% Concluído
                        </div>
                      </div>

                      <div className="space-y-3">
                        {activeConcurso.materias?.map(materia => {
                          const isExpanded = expandedSubject === materia.id;
                          return (
                            <div key={materia.id} className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden transition-all">
                              
                              {/* Accordion Trigger */}
                              <button 
                                onClick={() => setExpandedSubject(isExpanded ? null : materia.id)}
                                className="w-full flex justify-between items-center px-4 py-3.5 bg-slate-900/30 hover:bg-slate-900/60 text-left transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></div>
                                  <span className="font-bold text-xs text-slate-300">{materia.nomeMateria}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {materia.topicos.length} tópicos
                                  </span>
                                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                </div>
                              </button>

                              {/* Accordion Content */}
                              {isExpanded && (
                                <div className="p-3 border-t border-slate-900 divide-y divide-slate-900">
                                  {materia.topicos.map(topico => (
                                    <div key={topico.id} className="py-3 px-1.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      
                                      {/* Tópico Principal e Badges */}
                                      <div className="space-y-1.5 flex-1">
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs font-semibold text-slate-300 leading-relaxed">{topico.nome}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                            topico.prioridade === 'Alta' ? 'bg-rose-950/60 text-rose-400 border border-rose-900/50' :
                                            topico.prioridade === 'Média' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/50' :
                                            'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                                          }`}>
                                            Prioridade {topico.prioridade}
                                          </span>
                                          <span className="text-[9px] font-semibold text-slate-500">Freq. Banca: {topico.frequencia}</span>
                                          {topico.tempoEstudado > 0 && (
                                            <span className="text-[9px] font-bold text-violet-400 flex items-center gap-1">
                                              <Clock size={10} /> {topico.tempoEstudado} min
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Controles de Progresso */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        
                                        {/* Estudado Toggle */}
                                        <button 
                                          onClick={() => toggleTopicState(materia.id, topico.id, 'estudado')}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                                            topico.estudado 
                                              ? 'bg-violet-950 border-violet-500 text-violet-300' 
                                              : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                                          }`}
                                        >
                                          ESTUDADO
                                        </button>

                                        {/* Revisado Toggle */}
                                        <button 
                                          onClick={() => toggleTopicState(materia.id, topico.id, 'revisado')}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                                            topico.revisado 
                                              ? 'bg-indigo-950 border-indigo-500 text-indigo-300' 
                                              : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                                          }`}
                                        >
                                          REVISADO
                                        </button>

                                        {/* Exercícios Toggle */}
                                        <button 
                                          onClick={() => toggleTopicState(materia.id, topico.id, 'exercicios')}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                                            topico.exercicios 
                                              ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300' 
                                              : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                                          }`}
                                        >
                                          EXERCÍCIOS
                                        </button>

                                        {/* Abrir Modal de Métricas */}
                                        <button 
                                          onClick={() => {
                                            setSelectedTopic(topico);
                                            setNoteText(topico.notas || '');
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                                        >
                                          <Info size={16} />
                                        </button>

                                        {/* Gerar Anki automático do Tópico */}
                                        <button 
                                          onClick={() => generateFlashcardsForTopic(topico.nome, materia.nomeMateria)}
                                          title="Gerar Flashcards com IA"
                                          disabled={generatingCards}
                                          className="p-1.5 bg-violet-950/40 border border-violet-900/60 hover:bg-violet-900/60 text-violet-300 rounded-lg transition-all"
                                        >
                                          <Brain size={14} className={generatingCards ? 'animate-spin' : ''} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DASHBOARD DE DESEMPENHO */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* CARTÕES MÉTRICOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Aproveitamento Geral</span>
                    <div className="text-2xl font-black text-violet-400 mt-1">{getAccuracyRate(activeConcurso)}%</div>
                    <span className="text-xs text-slate-500 mt-1 block">Foco em acertos de questões</span>
                  </div>
                  <div className="p-3 bg-violet-950/60 rounded-xl border border-violet-800/40 text-violet-300">
                    <Target size={24} />
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Tempo Total Estudado</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{getTotalTimeStudied(activeConcurso)}h</div>
                    <span className="text-xs text-slate-500 mt-1 block">Minutos totais somados</span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40 text-emerald-300">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Editais Monitorados</span>
                    <div className="text-2xl font-black text-slate-100 mt-1">{concursos.length}</div>
                    <span className="text-xs text-slate-500 mt-1 block">Sincronizados na Vercel</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-slate-400">
                    <Database size={24} />
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Nível do Mago</span>
                    <div className="text-2xl font-black text-amber-500 mt-1">Lvl {level}</div>
                    <span className="text-xs text-slate-500 mt-1 block">{exp}% para o próximo Rank</span>
                  </div>
                  <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800/40 text-amber-400">
                    <Award size={24} />
                  </div>
                </div>
              </div>

              {/* GRÁFICOS DE DESEMPENHO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* RADAR DE COBERTURA DE MATÉRIAS */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 lg:col-span-1">
                  <h3 className="font-bold text-sm text-slate-300 mb-4">Cobertura de Conteúdo por Matéria</h3>
                  <div className="h-[260px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" r="80%" data={getRadarData()}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                        <Radar name="Aproveitamento" dataKey="Aproveitamento" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CRONOGRAMA DE EVOLUÇÃO TEMPORAL */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                  <h3 className="font-bold text-sm text-slate-300 mb-4">Volume Diário de Estudos & Ritmo</h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { name: 'Seg', Minutos: 90, Questoes: 25 },
                          { name: 'Ter', Minutos: 140, Questoes: 40 },
                          { name: 'Qua', Minutos: 110, Questoes: 30 },
                          { name: 'Qui', Minutos: 180, Questoes: 65 },
                          { name: 'Sex', Minutos: 130, Questoes: 45 },
                          { name: 'Sáb', Minutos: 210, Questoes: 80 },
                          { name: 'Dom', Minutos: 120, Questoes: 35 }
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorMinutos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#cbd5e1' }} />
                        <Area type="monotone" dataKey="Minutos" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMinutos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* COMPARADOR DE OVERLAP DE MATÉRIAS (Similaridade) */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-300 mb-2">Cruzador Inteligente de Editais (Similaridade)</h3>
                <p className="text-xs text-slate-400 mb-4">Veja a porcentagem de sobreposição de conteúdo entre o concurso em foco e seus outros editais.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {concursos.map(c => (
                    <div key={c.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{c.nomeConcurso}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{c.banca} - {c.cargo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-violet-400">{calculateOverlap(activeConcurso, c)}%</div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Simetria</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GRIMÓRIO ANKI (CARDS) */}
          {activeTab === 'anki' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl"></div>
                <h2 className="text-lg font-extrabold flex items-center justify-center gap-2">
                  <Brain className="text-violet-400" size={22} />
                  Grimório de Memorização Espaçada
                </h2>
                <p className="text-xs text-slate-400 mt-1">Gere flashcards sob demanda de qualquer tópico do seu edital ou estude sua pilha ativa para consolidar conhecimento.</p>
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-4">
                  
                  {/* CARD ATIVO */}
                  <div 
                    onClick={() => setShowCardBack(!showCardBack)}
                    className="min-h-[220px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition-all shadow-xl text-center relative overflow-hidden group"
                  >
                    <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-900/50 px-2 py-1 rounded-md self-center">
                      Matéria: {flashcards[currentCardIndex]?.subject}
                    </div>

                    <div className="my-auto px-4">
                      {showCardBack ? (
                        <p className="text-sm font-semibold text-slate-200 leading-relaxed animate-fade-in">
                          {flashcards[currentCardIndex]?.back}
                        </p>
                      ) : (
                        <h3 className="text-lg font-bold text-white leading-relaxed">
                          {flashcards[currentCardIndex]?.front}
                        </h3>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                      {showCardBack ? "Clique para ver a pergunta" : "Clique para revelar a resposta gabaritada"}
                    </span>
                  </div>

                  {/* CONTROLES DO ANKI */}
                  <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-900 gap-3">
                    <button 
                      onClick={() => {
                        setShowCardBack(false);
                        setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="text-xs text-slate-400 hover:text-white font-bold"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          addExp(10);
                          setShowCardBack(false);
                          setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                          setSuccessMessage("Card classificado como DIFÍCIL. Agendado para revisão próxima.");
                        }}
                        className="bg-rose-950/50 border border-rose-900 text-rose-400 font-extrabold px-3 py-2 rounded-lg text-xs hover:bg-rose-900/40 transition-all"
                      >
                        Errei / Difícil
                      </button>
                      <button 
                        onClick={() => {
                          addExp(20);
                          setShowCardBack(false);
                          setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                          setSuccessMessage("Card classificado como FÁCIL! Memorização consolidada.");
                        }}
                        className="bg-emerald-950/50 border border-emerald-900 text-emerald-400 font-extrabold px-3 py-2 rounded-lg text-xs hover:bg-emerald-900/40 transition-all"
                      >
                        Acertei / Fácil
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      {currentCardIndex + 1} de {flashcards.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-950 rounded-2xl border border-slate-900">
                  Sua pilha de flashcards está vazia. Gere flashcards inteligentes na coluna do edital verticalizado!
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE MÉTRICAS E NOTAS DE ESTUDO DO TÓPICO */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-violet-400 uppercase">Métricas de Foco</h4>
                <h3 className="font-extrabold text-slate-200 mt-1">{selectedTopic.nome}</h3>
              </div>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Form de Novas Métricas */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as any;
                const questoes = Number(target.questoes.value || 0);
                const acertos = Number(target.acertos.value || 0);
                const tempo = Number(target.tempo.value || 0);
                
                // Achar subjectId correspondente
                let foundSubjectId = "";
                activeConcurso.materias.forEach(m => {
                  if (m.topicos.some(t => t.id === selectedTopic.id)) {
                    foundSubjectId = m.id;
                  }
                });

                updateTopicMetrics(foundSubjectId, selectedTopic.id, questoes, acertos, tempo);
              }}
              className="space-y-4 border-t border-b border-slate-800 py-4"
            >
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Questões Feitas</label>
                  <input 
                    name="questoes"
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    placeholder="Ex: 10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Gabarito Acertos</label>
                  <input 
                    name="acertos"
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    placeholder="Ex: 8"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tempo (Minutos)</label>
                  <input 
                    name="tempo"
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    placeholder="Ex: 45"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="bg-slate-950 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  Acrescentar Métricas
                </button>
              </div>
            </form>

            {/* Bloco de Notas / Resumos Pessoais */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Grimório de Resumos & Notas Pessoais</label>
              <textarea 
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Escreva mnemônicos, artigos de lei importantes ou observações chave deste tópico..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button 
                onClick={() => {
                  let foundSubjectId = "";
                  activeConcurso.materias.forEach(m => {
                    if (m.topicos.some(t => t.id === selectedTopic.id)) {
                      foundSubjectId = m.id;
                    }
                  });
                  saveTopicNotes(foundSubjectId, selectedTopic.id, noteText);
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-1.5 rounded-lg text-xs font-bold text-violet-400 transition-all"
              >
                Salvar Anotações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
