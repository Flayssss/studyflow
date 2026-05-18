import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Sliders,
  Check,
  FileCheck
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

// --- CONFIGURAÇÃO DA API DO GEMINI ---
// A chave é fornecida pelo ambiente em tempo de execução
const apiKey = "";

// Função de retry com exponencial backoff para tolerância a falhas na API do Gemini
const fetchWithRetry = async (url: string, options: any, retries = 5, delay = 1000): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erro de rede: ${response.status} ${response.statusText}`);
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

// --- ESTRUTURAS DE DADOS (INTERFACES) ---
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

// Dados padrão estruturados para o edital SEDES-DF (Quadrix) como plano de contingência
const defaultConcursos: Concurso[] = [
  {
    id: "sedes-df-v3",
    nomeConcurso: "SEDES-DF (Edital Oficial)",
    orgao: "Secretaria de Estado de Desenvolvimento Social do Distrito Federal",
    cargo: "Especialista em Assistência Social",
    banca: "Instituto Quadrix",
    dataProva: "2026-11-20",
    periodoInscricao: "Inscrições Abertas",
    valorInscricao: "R$ 90,00",
    requisitos: "Diploma de Ensino Superior na área de actuação específica",
    vagas: "120 Vagas Directas + Cadastro Reserva",
    salario: "R$ 5.480,00",
    datasImportantes: [
      { id: "d1", evento: "Prova Escrita (Objectiva + Redacção)", data: "2026-11-20" },
      { id: "d2", evento: "Fim do Prazo de Inscrição", data: "2026-10-15" }
    ],
    redacaoInfo: {
      possuiRedacao: true,
      criterios: "Texto dissertativo-argumentativo de até 30 linhas focado em temas de Assistência Social e Directrizes do SUAS.",
      temasProvaveis: [
        "A relevância do Plano de Acção da Assistência Social no combate à pobreza",
        "Atendimento às famílias vulneráveis através dos CRAS e CREAS no DF",
        "O papel do Cadastro Único na consolidação da justiça social comunitária"
      ],
      estruturaExigida: "Texto em Prosa Dissertativo-Argumentativo técnico",
      peso: "20 Pontos",
      treinos: [
        { id: "t1", tema: "Atuação Intersectorial do SUAS e do SUS", data: "2026-05-12", nota: 19.0, feedback: "Muito bom uso dos conceitos normativos da LOAS. Cuidado com o limite máximo de 30 linhas." }
      ]
    },
    materias: [
      {
        id: "m_basics_pt",
        nomeMateria: "Conhecimentos Básicos - Língua Portuguesa",
        topicos: [
          { id: "t_pt1", nome: "Compreensão e interpretação de textos de géneros variados", prioridade: "Alta", frequencia: "94%", peso: 2, estudado: true, revisado: true, exercicios: true, questoesFeitas: 40, acertos: 38, tempoEstudado: 90, notas: "Focar na tipologia textual exigida pela Quadrix." },
          { id: "t_pt2", nome: "Domínio da estrutura morfossintática do período", prioridade: "Alta", frequencia: "87%", peso: 2, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" },
          { id: "t_pt3", nome: "Coesão textual e relações de coordenação/subordinação", prioridade: "Média", frequencia: "75%", peso: 1.5, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" }
        ]
      },
      {
        id: "m_basics_leg",
        nomeMateria: "Conhecimentos Básicos - Legislação Aplicável",
        topicos: [
          { id: "t_leg1", nome: "Lei Orgânica do Distrito Federal (LODF) - Títulos I, II e VII", prioridade: "Alta", frequencia: "92%", peso: 2.5, estudado: true, revisado: false, exercicios: true, questoesFeitas: 25, acertos: 21, tempoEstudado: 120, notas: "Dar atenção especial aos fundamentos e competências do DF." },
          { id: "t_leg2", nome: "Regime Jurídico dos Servidores Públicos do DF - Lei Complementar 840/2011", prioridade: "Alta", frequencia: "89%", peso: 2.5, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" }
        ]
      },
      {
        id: "m_especificas_assist",
        nomeMateria: "Conhecimentos Específicos - Assistência Social",
        topicos: [
          { id: "t_esp1", nome: "Lei Orgânica de Assistência Social (LOAS) - Lei Federal 8.742/1993", prioridade: "Alta", frequencia: "100%", peso: 3, estudado: true, revisado: true, exercicios: true, questoesFeitas: 110, acertos: 102, tempoEstudado: 240, notas: "Revisar com urgência as actualizações sobre os benefícios eventuais." },
          { id: "t_esp2", nome: "Sistema Único de Assistência Social (SUAS) e Norma Operacional Básica (NOB)", prioridade: "Alta", frequencia: "98%", peso: 3, estudado: true, revisado: false, exercicios: true, questoesFeitas: 60, acertos: 54, tempoEstudado: 180, notas: "Estudar detalhadamente a tipificação dos serviços de Protecção Social Básica." },
          { id: "t_esp3", nome: "Política Nacional de Assistência Social (PNAS)", prioridade: "Média", frequencia: "80%", peso: 2, estudado: false, revisado: false, exercicios: false, questoesFeitas: 0, acertos: 0, tempoEstudado: 0, notas: "" }
        ]
      }
    ]
  }
];

export default function App() {
  // --- PERSISTÊNCIA E ESTADOS GERAIS DO UTILIZADOR ---
  const [concursos, setConcursos] = useState<Concurso[]>(() => {
    const guardados = localStorage.getItem('studyflow_concursos_v4_pt');
    return guardados ? JSON.parse(guardados) : defaultConcursos;
  });

  const [selectedConcursoId, setSelectedConcursoId] = useState<string>(() => {
    const idGuardado = localStorage.getItem('studyflow_selected_id_v4_pt');
    return idGuardado && idGuardado !== 'undefined' ? idGuardado : (concursos[0]?.id || "sedes-df-v3");
  });

  const [activeTab, setActiveTab] = useState<'concursos' | 'dashboard' | 'anki'>('concursos');
  
  // Gamificação (Nível do Concurseiro)
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem('studyflow_level_pt') || '10'));
  const [exp, setExp] = useState<number>(() => Number(localStorage.getItem('studyflow_exp_pt') || '45'));
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem('studyflow_streak_pt') || '3'));

  // Estados de Carregamento e Processamento de Ficheiros
  const [pdfText, setPdfText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  
  // Notificações e Modais de Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accordions e Editores
  const [expandedSubject, setExpandedSubject] = useState<string | null>("m_especificas_assist");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  
  // Novo Treino de Redacção
  const [newTema, setNewTema] = useState<string>('');
  const [newNota, setNewNota] = useState<number>(0);
  const [newFeedback, setNewFeedback] = useState<string>('');

  // Pilha de Flashcards Inteligentes (Anki)
  const [flashcards, setFlashcards] = useState<{id: string, front: string, back: string, subject: string, ease: number}[]>(() => {
    const guardados = localStorage.getItem('studyflow_flashcards_pt');
    return guardados ? JSON.parse(guardados) : [
      { id: "fc1", front: "Como se define a assistência social segundo o artigo 1º da LOAS?", back: "É política de segurança social não contributiva, que provê os mínimos sociais, realizada através de um conjunto integrado de ações de iniciativa pública e da sociedade.", subject: "LOAS", ease: 2.5 },
      { id: "fc2", front: "Qual a diferença de actuação entre o CRAS e o CREAS no âmbito do SUAS?", back: "O CRAS atua na Protecção Social Básica (prevenção de riscos), enquanto o CREAS atua na Protecção Social Especial (famílias com direitos já violados).", subject: "SUAS", ease: 2.4 }
    ];
  });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardBack, setShowCardBack] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);

  // Sincronização automática com localStorage
  useEffect(() => {
    localStorage.setItem('studyflow_concursos_v4_pt', JSON.stringify(concursos));
  }, [concursos]);

  useEffect(() => {
    localStorage.setItem('studyflow_selected_id_v4_pt', selectedConcursoId);
  }, [selectedConcursoId]);

  useEffect(() => {
    localStorage.setItem('studyflow_level_pt', level.toString());
    localStorage.setItem('studyflow_exp_pt', exp.toString());
    localStorage.setItem('studyflow_streak_pt', streak.toString());
  }, [level, exp, streak]);

  useEffect(() => {
    localStorage.setItem('studyflow_flashcards_pt', JSON.stringify(flashcards));
  }, [flashcards]);

  // Carrega a biblioteca de renderização e análise de PDFs na inicialização
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

  // --- MECANISMO DE GAMIFICAÇÃO (SOMA DE EXPERIÊNCIA) ---
  const addExp = (pontos: number) => {
    let novosPontos = exp + pontos;
    let novoNivel = level;
    while (novosPontos >= 100) {
      novosPontos -= 100;
      novoNivel += 1;
      setSuccessMessage(`⭐ NÍVEL CONCLUÍDO! Alcançou o Nível ${novoNivel} no Mapeador de Estudos! ⭐`);
    }
    setExp(novosPontos);
    setLevel(novoNivel);
  };

  // --- LEITOR DE PDF E EXTRAÇÃO REAL DO FLUXO DE TEXTO ---
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!(window as any).pdfjsLib) {
      setErrorMessage("O decodificador de PDF em segundo plano ainda está a carregar. Tente novamente em alguns segundos.");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStatus("Iniciando leitura e abertura do ficheiro PDF...");
    setErrorMessage(null);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await (window as any).pdfjsLib.getDocument(typedarray).promise;
          
          setProcessingStatus(`Mapeando páginas do edital (Detectadas: ${pdf.numPages})...`);
          setProcessingProgress(40);
          
          let extractedText = "";
          // Lemos as primeiras 30 páginas para manter o fluxo rápido e não estourar os limites da API
          const pagesToRead = Math.min(pdf.numPages, 30);
          
          for (let i = 1; i <= pagesToRead; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
            setProcessingProgress(Math.floor(40 + (i / pagesToRead) * 30));
          }

          setPdfText(extractedText);
          setProcessingStatus("Processamento local concluído! Enviando dados ao motor de IA...");
          setProcessingProgress(75);
          
          await processEditalWithGemini(extractedText);
        } catch (err: any) {
          setErrorMessage(`Falha na extração interna das páginas: ${err.message}`);
          setIsProcessing(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      setErrorMessage(`Não foi possível abrir o arquivo: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // --- MOTOR DE IA DO GEMINI COM FORMATO JSON ESTRUTURADO ---
  const processEditalWithGemini = async (rawText: string, customPresetContext?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingProgress(80);
    setProcessingStatus("O Oráculo Gemini está a catalogar e a verticalizar o conteúdo...");

    const textToAnalyze = customPresetContext ? `DIRETRIZES: ${customPresetContext}\n\n${rawText.substring(0, 70000)}` : rawText.substring(0, 90000);

    const systemPrompt = `Você é o Oráculo de Editais do StudyFlow. Sua tarefa é analisar o edital fornecido e estruturar um plano de estudos de alta performance.
    
    DIRETRIZ DE PRECISÃO DO EDITAL SEDES-DF:
    - Se o edital ou texto fizer menção à assistência social do Distrito Federal (SEDES-DF), a banca organizadora é SEMPRE o INSTITUTO QUADRIX.
    - O cargo principal é Especialista em Assistência Social e o salário inicial base é R$ 5.480,00.
    - O plano de estudos DEVE mapear as disciplinas básicas (Língua Portuguesa, Raciocínio Lógico, LODF, Lei Complementar 840, Direito Administrativo, Direito Constitucional) e as específicas fundamentais (LOAS - Lei 8.742/93, SUAS, NOB-SUAS, PNAS, Tipificação Nacional de Serviços Socioassistenciais).
    - Mapeie pelo menos de 5 a 8 matérias principais para garantir um plano de estudos realista e completo.
    - Cada matéria deve incluir de 3 a 7 tópicos específicos organizados com prioridade ("Alta", "Média", "Baixa") e frequência estimada na banca organizadora.
    
    Retorne a resposta estritamente em formato JSON que obedeça ao esquema definido. Não insira blocos de texto ou explicações antes ou depois do JSON.`;

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
      contents: [{ parts: [{ text: `Efetue a análise rigorosa deste texto do edital:\n\n${textToAnalyze}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    try {
      const data = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      setProcessingProgress(95);
      setProcessingStatus("Populando banco de dados estruturado do usuário...");

      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) {
        throw new Error("A IA devolveu um resultado vazio ou ilegível.");
      }

      const parsed = JSON.parse(rawJson);

      // Formatação e atribuição de IDs únicos aos novos dados importados
      const formattedSubjects = parsed.materias.map((materia: any, mIdx: number) => ({
        id: `m_imported_${Date.now()}_${mIdx}`,
        nomeMateria: materia.nomeMateria,
        topicos: materia.topicos.map((topico: any, tIdx: number) => ({
          id: `t_imported_${Date.now()}_${mIdx}_${tIdx}`,
          nome: topico.nome,
          prioridade: topico.prioridade || 'Média',
          frequencia: topico.frequencia || 'Sem dados',
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

      const novoConcurso: Concurso = {
        id: `concurso_${Date.now()}`,
        nomeConcurso: parsed.nomeConcurso,
        orgao: parsed.orgao,
        cargo: parsed.cargo,
        banca: parsed.banca,
        dataProva: parsed.dataProva || "Definir",
        periodoInscricao: parsed.periodoInscricao || "Consultar Edital",
        valorInscricao: parsed.valorInscricao || "Consultar",
        requisitos: parsed.requisitos || "Consultar Edital",
        vagas: parsed.vagas || "Não descrita",
        salario: parsed.salario || "Não descrito",
        datasImportantes: parsed.datasImportantes.map((dt: any, idx: number) => ({
          id: `dt_${Date.now()}_${idx}`,
          evento: dt.evento,
          data: dt.data
        })),
        redacaoInfo: {
          possuiRedacao: parsed.redacaoInfo?.possuiRedacao || false,
          criterios: parsed.redacaoInfo?.criterios || "Sem detalhes da prova discursiva",
          temasProvaveis: parsed.redacaoInfo?.temasProvaveis || [],
          estruturaExigida: parsed.redacaoInfo?.estruturaExigida || "Dissertativa",
          peso: parsed.redacaoInfo?.peso || "0",
          treinos: []
        },
        materias: formattedSubjects
      };

      setConcursos(prev => [novoConcurso, ...prev]);
      setSelectedConcursoId(novoConcurso.id);
      addExp(50);
      setSuccessMessage(`🔮 Oráculo: O Edital do concurso ${novoConcurso.nomeConcurso} foi totalmente indexado!`);
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Ocorreu um erro no processamento cognitivo da IA: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // --- GERAÇÃO RÁPIDA DE DADOS POR ENCOMENDA DA IA ---
  const handleLoadPresetWithAI = async (nomePreset: string) => {
    let presetContext = "";
    if (nomePreset === 'SEDES') {
      presetContext = "Crie o edital completo da Secretaria de Desenvolvimento Social do Distrito Federal (SEDES-DF). A banca é o Instituto Quadrix. O cargo é de Especialista em Assistência Social. Crie matérias completas incluindo Português, LODF, Lei Complementar 840, Direito Administrativo, Constitucional, LOAS, SUAS e PNAS, todas com tópicos bem detalhados.";
    } else if (nomePreset === 'PCDF') {
      presetContext = "Crie o edital completo da Polícia Civil do Distrito Federal (PCDF) para o cargo de Agente de Polícia. A banca é o Cebraspe. O conteúdo programático deve incluir Português, Informática de alto nível, Raciocínio Lógico, Direito Constitucional, Administrativo, Penal, Processual Penal e Legislação Penal Especial.";
    } else {
      presetContext = "Crie o edital completo do Tribunal de Justiça do Distrito Federal e dos Territórios (TJDFT) para Técnico Judiciário da Área Administrativa. Banca FGV. Inclua Português, Direito Constitucional, Administrativo, Civil, Processual Civil, Processual Penal e Provimento Geral do TJDFT.";
    }

    await processEditalWithGemini("Geração acelerada de edital simulado de alto nível com base na base de conhecimento oficial do Gemini 2.5.", presetContext);
  };

  // --- MOTOR ANKI INTELECTUAL (FLASHCARDS POR TOPICO) ---
  const generateAnkiForTopic = async (nomeTopico: string, nomeMateria: string) => {
    setGeneratingCards(true);
    setErrorMessage(null);

    const prompt = `Gere exatamente 4 flashcards inteligentes de concurso público para o tópico "${nomeTopico}" da matéria "${nomeMateria}".
    Retorne a resposta estritamente em um array de objetos JSON válido, onde cada objeto tem os campos: "front" (pergunta objectiva e profunda) e "back" (resposta resumida de alto valor pedagógico).
    Evite introduções e respostas que fujam ao formato estruturado JSON.`;

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

      const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) throw new Error("Falta de retorno de dados do servidor do Gemini.");

      const novosCards = JSON.parse(jsonText).map((c: any, idx: number) => ({
        id: `fc_ai_${Date.now()}_${idx}`,
        front: c.front,
        back: c.back,
        subject: nomeMateria.replace("Conhecimentos Básicos - ", "").replace("Conhecimentos Específicos - ", ""),
        ease: 2.5
      }));

      setFlashcards(prev => [...novosCards, ...prev]);
      addExp(15);
      setSuccessMessage(`📚 Grimório Anki: 4 novos flashcards de fixação gerados para o tópico "${nomeTopico}"!`);
    } catch (err: any) {
      setErrorMessage(`Ocorreu uma falha ao fabricar os flashcards: ${err.message}`);
    } finally {
      setGeneratingCards(false);
    }
  };

  // --- OPERAÇÕES DO CONTROLE DE PROGRESSO ---
  const toggleTopicMark = (subjectId: string, topicId: string, flag: 'estudado' | 'revisado' | 'exercicios') => {
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
              const nextVal = !t[flag];
              if (nextVal) addExp(5); // Soma XP por acção concluída
              return { ...t, [flag]: nextVal };
            })
          };
        })
      };
    }));
  };

  const addTopicMetrics = (subjectId: string, topicId: string, feitas: number, acertos: number, tempo: number) => {
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
                questoesFeitas: t.questoesFeitas + feitas,
                acertos: t.acertos + acertos,
                tempoEstudado: t.tempoEstudado + tempo
              };
            })
          };
        })
      };
    }));
    setSelectedTopic(null);
    setSuccessMessage("Métricas de estudo e desempenho contabilizadas no seu perfil!");
  };

  const saveTopicNotes = (subjectId: string, topicId: string, notes: string) => {
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
              return { ...t, notas: notes };
            })
          };
        })
      };
    }));
    setSuccessMessage("Suas anotações pessoais foram guardadas com sucesso no edital.");
  };

  // --- TREINO DE REDAÇÃO ---
  const handleSaveTreinoRedacao = () => {
    if (!newTema) return;
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
              tema: newTema,
              data: new Date().toLocaleDateString('pt-PT'),
              nota: newNota,
              feedback: newFeedback
            }
          ]
        }
      };
    }));
    setNewTema('');
    setNewNota(0);
    setNewFeedback('');
    addExp(20);
    setSuccessMessage("Resultado de treino de redação anotado no histórico oficial!");
  };

  // --- EXCLUSÃO DE CONCURSO ---
  const handleRemoveConcurso = (idToRemove: string) => {
    if (concursos.length <= 1) {
      setErrorMessage("Você precisa manter ao menos 1 edital ativo para estudos.");
      return;
    }
    const actual = concursos.filter(c => c.id !== idToRemove);
    setConcursos(actual);
    setSelectedConcursoId(actual[0].id);
    setSuccessMessage("O Edital foi removido das suas bases locais com sucesso.");
  };

  // --- MÉTRICAS DE CÁLCULO GERAIS ---
  const getOverallProgress = (concurso: Concurso) => {
    let total = 0;
    let checked = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        total += 3;
        if (t.estudado) checked++;
        if (t.revisado) checked++;
        if (t.exercicios) checked++;
      });
    });
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  };

  const getOverallAccuracy = (concurso: Concurso) => {
    let resolvidas = 0;
    let acertos = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        resolvidas += t.questoesFeitas;
        acertos += t.acertos;
      });
    });
    return resolvidas > 0 ? Math.round((acertos / resolvidas) * 100) : 0;
  };

  const getHoursStudied = (concurso: Concurso) => {
    let totalMins = 0;
    concurso.materias.forEach(m => {
      m.topicos.forEach(t => {
        totalMins += t.tempoEstudado;
      });
    });
    return Math.round(totalMins / 60);
  };

  const getRadarMetrics = () => {
    return activeConcurso.materias.map(m => {
      let total = m.topicos.length * 3;
      let check = 0;
      m.topicos.forEach(t => {
        if (t.estudado) check++;
        if (t.revisado) check++;
        if (t.exercicios) check++;
      });
      return {
        subject: m.nomeMateria.length > 20 ? m.nomeMateria.substring(0, 18) + "..." : m.nomeMateria,
        Aproveitamento: total > 0 ? Math.round((check / total) * 100) : 0,
        fullMark: 100
      };
    });
  };

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr || dateStr === "Definir" || dateStr === "Previsto") return "Por Definir";
    const examDate = new Date(dateStr);
    const today = new Date();
    const diff = examDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} dias` : "Fim do Prazo!";
  };

  const getOverlapPercentage = (cRef: Concurso, cComp: Concurso) => {
    if (cRef.id === cComp.id) return 100;
    let hits = 0;
    const sRef = cRef.materias.map(m => m.nomeMateria.toLowerCase()).join(" ");
    const sComp = cComp.materias.map(m => m.nomeMateria.toLowerCase()).join(" ");
    
    const keyTerms = ["portugues", "direito", "administrativo", "constitucional", "raciocinio", "social", "loas", "suas", "legislacao"];
    keyTerms.forEach(term => {
      if (sRef.includes(term) && sComp.includes(term)) hits++;
    });
    return Math.round((hits / keyTerms.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* ALERTA FLUTUANTE DE SUCESSO OU ERRO */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-violet-900/90 border border-violet-500 text-violet-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <Sparkles className="text-yellow-400 animate-pulse" size={18} />
          <span className="text-xs font-semibold">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-violet-300 hover:text-white ml-2">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-950/90 border border-rose-500 text-rose-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="text-rose-400" size={18} />
          <span className="text-xs font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-rose-300 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* PAINEL DE CABEÇALHO GAMIFICADO */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-75 blur animate-pulse"></div>
            <div className="relative bg-slate-950 p-2 rounded-full border border-violet-500/40">
              <Brain className="text-violet-400" size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
              StudyFlow <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-900/50 border border-violet-500/30 text-violet-300">Archmage Edition v3</span>
            </h1>
            <p className="text-[10px] text-slate-400">Inteligência Estruturada para Concursos Públicos</p>
          </div>
        </div>

        {/* STATUS DE DESEMPENHO E GAMIFICAÇÃO */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-1.5">
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={18} />
            <div>
              <div className="text-xs font-extrabold text-slate-100">{streak} dias</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">Ritmo</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-violet-950/40">
              {level}
            </div>
            <div>
              <div className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Mago dos Estudos</div>
              <div className="w-24 bg-slate-950 h-1.5 rounded-full border border-slate-800 mt-1 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${exp}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA DE TRABALHO PRINCIPAL */}
      <div className="flex flex-1 flex-col lg:flex-row">
        
        {/* BARRA DE NAVEGAÇÃO LATERAL */}
        <aside className="w-full lg:w-64 bg-slate-950 border-r border-slate-900 p-4 flex flex-col gap-2">
          <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase px-3 mb-2">Módulos</div>
          
          <button 
            onClick={() => setActiveTab('concursos')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'concursos' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
          >
            <BookOpen size={16} />
            Central de Concursos
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
          >
            <TrendingUp size={16} />
            Métricas de Evolução
          </button>

          <button 
            onClick={() => setActiveTab('anki')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'anki' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
          >
            <Brain size={16} />
            Grimório Anki
          </button>

          <div className="mt-6 pt-6 border-t border-slate-900">
            <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase px-3 mb-2">Edital Ativo</div>
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-violet-300 font-bold focus:outline-none focus:border-violet-500"
                value={selectedConcursoId}
                onChange={(e) => setSelectedConcursoId(e.target.value)}
              >
                {concursos.map(c => (
                  <option key={c.id} value={c.id}>{c.nomeConcurso}</option>
                ))}
              </select>
              <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Total de Editais:</span>
                <span className="font-bold text-slate-300">{concursos.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTAINER DO FLUXO DE ABAS */}
        <main className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full">
          
          {/* ABA: CENTRAL DE CONCURSOS */}
          {activeTab === 'concursos' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* COMPONENTE: SCANNER INTELIGENTE COM IA */}
              <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-md font-extrabold flex items-center gap-2">
                      <Sparkles className="text-violet-400" size={18} />
                      Scanner Cognitivo de Editais
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Carregue o edital em formato PDF para análise real ou utilize presets integrados da inteligência do Gemini.
                    </p>
                  </div>

                  {/* PRESETS DE IMPORTAÇÃO RÁPIDA */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Atalhos IA:</span>
                    <button 
                      onClick={() => handleLoadPresetWithAI('SEDES')}
                      className="text-[10px] font-bold bg-violet-950/60 hover:bg-violet-900 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-lg transition-all"
                    >
                      SEDES-DF (Quadrix)
                    </button>
                    <button 
                      onClick={() => handleLoadPresetWithAI('PCDF')}
                      className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition-all"
                    >
                      PCDF (Cebraspe)
                    </button>
                    <button 
                      onClick={() => handleLoadPresetWithAI('TJDFT')}
                      className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition-all"
                    >
                      TJDFT (FGV)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DROPZONE DE ARQUIVO */}
                  <div className="border-2 border-dashed border-slate-800 hover:border-violet-500/50 bg-slate-950/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative transition-all group">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="text-slate-500 group-hover:text-violet-400 transition-colors mb-2" size={28} />
                    <h3 className="text-xs font-bold text-slate-300">Escolher ou Arrastar arquivo PDF</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Até 30 páginas processadas e verticalizadas automaticamente pela IA</p>
                  </div>

                  {/* MONITOR E ENVIADOR DE TEXTO */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between h-[140px]">
                    {isProcessing ? (
                      <div className="space-y-3 my-auto">
                        <div className="flex justify-between items-center text-[10px] text-violet-400 font-bold animate-pulse">
                          <span>{processingStatus}</span>
                          <span>{processingProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-350"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <textarea 
                          className="w-full h-full bg-transparent resize-none text-[10px] text-slate-400 placeholder-slate-600 focus:outline-none"
                          placeholder="Cole o texto de regulamentos ou ementas específicas para mapear individualmente..."
                          value={pdfText}
                          onChange={(e) => setPdfText(e.target.value)}
                        />
                        <button 
                          onClick={() => pdfText && processEditalWithGemini(pdfText)}
                          disabled={!pdfText}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${pdfText ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
                        >
                          <Brain size={12} />
                          Mapear Texto com Oráculo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* COMPONENTE: INFORMAÇÕES DETALHADAS DO EDITAL ATIVO */}
              {activeConcurso && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* CARD DE INFORMAÇÕES E PROVAS DISCURSIVAS */}
                  <div className="space-y-6 lg:col-span-1">
                    
                    {/* INFOS BÁSICAS DO EDITAL */}
                    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Ficha Informativa</h3>
                        <button 
                          onClick={() => handleRemoveConcurso(activeConcurso.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-950/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase">Órgão e Certame</div>
                          <div className="font-bold text-slate-200">{activeConcurso.nomeConcurso}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase">Banca</div>
                            <div className="font-bold text-slate-300">{activeConcurso.banca}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase">Vencimento</div>
                            <div className="font-bold text-emerald-400">{activeConcurso.salario}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase">Regime Vagas</div>
                            <div className="font-bold text-slate-300">{activeConcurso.vagas}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase">Inscrição</div>
                            <div className="font-bold text-slate-300">{activeConcurso.valorInscricao}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] text-slate-500 uppercase">Requisitos Exigidos</div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{activeConcurso.requisitos}</p>
                        </div>
                      </div>
                    </div>

                    {/* REDAÇÃO E PROVA DISCURSIVA */}
                    {activeConcurso.redacaoInfo?.possuiRedacao && (
                      <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-fuchsia-400" size={16} />
                          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Análise de Redacção</h3>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-[11px] space-y-2">
                          <div>
                            <span className="text-slate-500">Formato:</span> <span className="font-bold text-slate-300">{activeConcurso.redacaoInfo.estruturaExigida}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Critério de Avaliação:</span>
                            <p className="text-slate-400 leading-relaxed mt-0.5">{activeConcurso.redacaoInfo.criterios}</p>
                          </div>
                        </div>

                        {/* TEMAS PROVÁVEIS MAIS RELEVANTES */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Temas Prováveis de Cobrança:</span>
                          <ul className="space-y-1">
                            {activeConcurso.redacaoInfo.temasProvaveis?.map((t, idx) => (
                              <li key={idx} className="text-xs bg-violet-950/20 border border-violet-900/30 text-violet-300 px-2.5 py-1.5 rounded-lg leading-relaxed">
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* REGISTRO DE SIMULADO DE REDAÇÃO */}
                        <div className="pt-3 border-t border-slate-900/80 space-y-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Novo Registro de Redacção:</span>
                          <input 
                            type="text" 
                            placeholder="Tema redigido..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] text-slate-250 focus:outline-none focus:border-violet-500"
                            value={newTema}
                            onChange={(e) => setNewTema(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="number" 
                              step="0.1"
                              placeholder="Nota obtida"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] text-slate-250 focus:outline-none focus:border-violet-500"
                              value={newNota || ''}
                              onChange={(e) => setNewNota(Number(e.target.value))}
                            />
                            <button 
                              onClick={handleSaveTreinoRedacao}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-1 rounded-lg text-xs transition-all"
                            >
                              Anunciar Treino
                            </button>
                          </div>
                          <textarea 
                            placeholder="Anotações ou feedback de correcção..."
                            className="w-full h-12 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 focus:outline-none focus:border-violet-500 resize-none"
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                          />
                        </div>

                        {/* HISTÓRICO DE TREINOS */}
                        {activeConcurso.redacaoInfo.treinos?.length > 0 && (
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Treinos Praticados:</span>
                            {activeConcurso.redacaoInfo.treinos.map(tr => (
                              <div key={tr.id} className="bg-slate-950 border border-slate-900 p-2 flex justify-between items-center text-[10px]">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-200 truncate max-w-[150px]">{tr.tema}</div>
                                  <div className="text-[9px] text-slate-500">{tr.data} - {tr.feedback}</div>
                                </div>
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded">
                                  {tr.nota} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATAS E CRONOGRAMA REVERSIVO */}
                    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-violet-400" size={16} />
                        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Cronograma de Prazos</h3>
                      </div>

                      <div className="space-y-2">
                        {activeConcurso.datasImportantes?.map(dt => (
                          <div key={dt.id} className="flex justify-between items-center bg-slate-950 border border-slate-900 p-2.5 rounded-lg">
                            <div className="text-xs">
                              <div className="font-bold text-slate-200">{dt.evento}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{dt.data}</div>
                            </div>
                            <span className="text-[10px] font-extrabold text-violet-400 bg-violet-950 border border-violet-900 px-2.5 py-1 rounded-md">
                              {getDaysLeft(dt.data)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* EDITAL VERTICALIZADO DINÂMICO */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div>
                          <h3 className="font-black text-md text-slate-200">Plano Verticalizado Dinâmico</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Marque a conclusão das tarefas ou use a IA do Grimório para obter resumos profundos de cada matéria.</p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-xs font-black text-violet-300">
                          {getOverallProgress(activeConcurso)}% Coberto
                        </div>
                      </div>

                      <div className="space-y-3">
                        {activeConcurso.materias?.map(materia => {
                          const isExpanded = expandedSubject === materia.id;
                          return (
                            <div key={materia.id} className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                              
                              {/* TRIGGER DO ACCORDION DE MATÉRIA */}
                              <button 
                                onClick={() => setExpandedSubject(isExpanded ? null : materia.id)}
                                className="w-full flex justify-between items-center px-4 py-3.5 bg-slate-900/10 hover:bg-slate-900/30 text-left transition-all"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></div>
                                  <span className="font-bold text-xs text-slate-300">{materia.nomeMateria}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500 font-semibold">{materia.topicos.length} Tópicos</span>
                                  {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                </div>
                              </button>

                              {/* TÓPICOS VERTICALIZADOS DA MATÉRIA */}
                              {isExpanded && (
                                <div className="p-3 border-t border-slate-900 divide-y divide-slate-900/60">
                                  {materia.topicos.map(topico => (
                                    <div key={topico.id} className="py-3 px-1.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      
                                      {/* Título e Badges de Prioridade */}
                                      <div className="space-y-1.5 flex-1">
                                        <span className="text-xs font-semibold text-slate-300 leading-relaxed block">{topico.nome}</span>
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                            topico.prioridade === 'Alta' ? 'bg-rose-950/60 text-rose-400 border border-rose-900/50' :
                                            topico.prioridade === 'Média' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/50' :
                                            'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                                          }`}>
                                            Prioridade {topico.prioridade}
                                          </span>
                                          <span className="text-[9px] text-slate-500">Cobrança: {topico.frequencia}</span>
                                          {topico.tempoEstudado > 0 && (
                                            <span className="text-[9px] text-violet-400 font-semibold flex items-center gap-1">
                                              <Clock size={10} /> {topico.tempoEstudado} min
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* BOTÕES DE PROGRESSO DO ALUNO */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button 
                                          onClick={() => toggleTopicMark(materia.id, topico.id, 'estudado')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${topico.estudado ? 'bg-violet-950 border-violet-500 text-violet-300' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                                        >
                                          ESTUDADO
                                        </button>
                                        <button 
                                          onClick={() => toggleTopicMark(materia.id, topico.id, 'revisado')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${topico.revisado ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                                        >
                                          REVISADO
                                        </button>
                                        <button 
                                          onClick={() => toggleTopicMark(materia.id, topico.id, 'exercicios')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${topico.exercicios ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                                        >
                                          EXERCÍCIOS
                                        </button>

                                        {/* INFORMAÇÕES ADICIONAIS */}
                                        <button 
                                          onClick={() => {
                                            setSelectedTopic(topico);
                                            setNoteText(topico.notas || '');
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                                        >
                                          <Info size={14} />
                                        </button>

                                        {/* GERAR ANKI AUTOMÁTICO DO TÓPICO COM O GEMINI */}
                                        <button 
                                          onClick={() => generateAnkiForTopic(topico.nome, materia.nomeMateria)}
                                          disabled={generatingCards}
                                          title="Gerar 4 Flashcards com IA"
                                          className="p-1.5 bg-violet-950/40 border border-violet-900/50 hover:bg-violet-900/60 rounded-lg text-violet-300 transition-all disabled:opacity-40"
                                        >
                                          <Brain size={12} className={generatingCards ? 'animate-spin' : ''} />
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

          {/* ABA: PAINEL DE DESEMPENHO E ESTATÍSTICAS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* CARTÕES DE STATUS DA CENTRAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Aproveitamento Geral</span>
                    <div className="text-xl font-black text-violet-400 mt-1">{getOverallAccuracy(activeConcurso)}%</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Acertos consolidados</span>
                  </div>
                  <div className="p-2.5 bg-violet-950/50 rounded-xl border border-violet-800/30 text-violet-300">
                    <Target size={20} />
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Tempo Acumulado</span>
                    <div className="text-xl font-black text-emerald-400 mt-1">{getHoursStudied(activeConcurso)}h</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Soma total de foco</span>
                  </div>
                  <div className="p-2.5 bg-emerald-950/50 rounded-xl border border-emerald-800/30 text-emerald-300">
                    <Clock size={20} />
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Editais Salvos</span>
                    <div className="text-xl font-black text-slate-100 mt-1">{concursos.length}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Gravados no LocalStorage</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-slate-400">
                    <Database size={20} />
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Patamar Mágico</span>
                    <div className="text-xl font-black text-amber-500 mt-1">Lvl {level}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{exp}% de progresso</span>
                  </div>
                  <div className="p-2.5 bg-amber-950/50 rounded-xl border border-amber-800/30 text-amber-400">
                    <Award size={20} />
                  </div>
                </div>
              </div>

              {/* GRÁFICOS INTERACTIVOS (RECHARTS) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GRÁFICO DE COBERTURA (RADAR) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 lg:col-span-1">
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Matérias Dominadas</h3>
                  <div className="h-[240px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarMetrics()}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                        <Radar name="Aproveitamento" dataKey="Aproveitamento" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRÁFICO DE DESEMPENHO DIÁRIO (AREA) */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 lg:col-span-2">
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Estatísticas Semanais de Estudo</h3>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { name: 'Seg', Minutos: 90 },
                          { name: 'Ter', Minutos: 150 },
                          { name: 'Qua', Minutos: 120 },
                          { name: 'Qui', Minutos: 190 },
                          { name: 'Sex', Minutos: 140 },
                          { name: 'Sáb', Minutos: 220 },
                          { name: 'Dom', Minutos: 100 }
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#cbd5e1', fontSize: '11px' }} />
                        <Area type="monotone" dataKey="Minutos" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMin)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* SIMETRIA E REAPROVEITAMENTO (OVERLAP) */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Mapeador de Sobreposição de Conteúdo</h3>
                <p className="text-[10px] text-slate-500 mb-4">Calcule matematicamente quais matérias básicas e específicas você pode reaproveitar entre concursos públicos.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {concursos.map(c => (
                    <div key={c.id} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{c.nomeConcurso}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{c.banca} - {c.cargo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-md font-black text-violet-400">{getOverlapPercentage(activeConcurso, c)}%</div>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Simetria</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: GRIMÓRIO ANKI */}
          {activeTab === 'anki' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl"></div>
                <h2 className="text-sm font-black flex items-center justify-center gap-2">
                  <Brain className="text-violet-400" size={18} />
                  Revisão Ativa e Repetição Espaçada
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">Estimule a memorização de longo prazo avaliando conceitos-chave extraídos por IA.</p>
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-4">
                  {/* CARTÃO SELECIONADO */}
                  <div 
                    onClick={() => setShowCardBack(!showCardBack)}
                    className="min-h-[200px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all shadow-lg text-center"
                  >
                    <span className="text-[8px] font-extrabold text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-900/40 px-2 py-0.5 rounded self-center">
                      Assunto: {flashcards[currentCardIndex]?.subject}
                    </span>

                    <div className="my-auto px-2">
                      {showCardBack ? (
                        <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                          {flashcards[currentCardIndex]?.back}
                        </p>
                      ) : (
                        <h3 className="text-sm font-extrabold text-slate-100 leading-relaxed">
                          {flashcards[currentCardIndex]?.front}
                        </h3>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500">
                      {showCardBack ? "Clique para reverter à pergunta" : "Clique em qualquer lugar para ler a resposta"}
                    </span>
                  </div>

                  {/* CONTROLES DE REVISÃO */}
                  <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-900 gap-3">
                    <button 
                      onClick={() => {
                        setShowCardBack(false);
                        setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-300"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          addExp(10);
                          setShowCardBack(false);
                          setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                          setSuccessMessage("Prioridade de revisão elevada para este conceito.");
                        }}
                        className="bg-rose-950/40 border border-rose-900/50 text-rose-400 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-rose-900/40"
                      >
                        Errei / Difícil
                      </button>
                      <button 
                        onClick={() => {
                          addExp(20);
                          setShowCardBack(false);
                          setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                          setSuccessMessage("Conceito fixado com êxito na memória!");
                        }}
                        className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-emerald-900/40"
                      >
                        Acertei / Fácil
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 font-bold">
                      {currentCardIndex + 1} de {flashcards.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 bg-slate-950 rounded-2xl border border-slate-900 text-xs">
                  A sua pilha de flashcards está vazia de momento. Use o ícone de IA no edital para gerar cartões.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDIÇÃO DE MÉTRICAS E ANOTAÇÕES DE TÓPICO */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Mapeamento de Desempenho</h4>
                <h3 className="font-extrabold text-sm text-slate-200 mt-0.5">{selectedTopic.nome}</h3>
              </div>
              <button onClick={() => setSelectedTopic(null)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            {/* FORMULÁRIO DE MÉTRICAS */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as any;
                const feitas = Number(target.questoes.value || 0);
                const acertos = Number(target.acertos.value || 0);
                const tempo = Number(target.tempo.value || 0);
                
                let sId = "";
                activeConcurso.materias.forEach(m => {
                  if (m.topicos.some(t => t.id === selectedTopic.id)) sId = m.id;
                });

                addTopicMetrics(sId, selectedTopic.id, feitas, acertos, tempo);
              }}
              className="space-y-4 border-t border-b border-slate-800/60 py-4"
            >
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Ques. Feitas</label>
                  <input name="questoes" type="number" className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:border-violet-500" placeholder="Ex: 20" />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Acertos</label>
                  <input name="acertos" type="number" className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:border-violet-500" placeholder="Ex: 17" />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Minutos</label>
                  <input name="tempo" type="number" className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:border-violet-500" placeholder="Ex: 40" />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setSelectedTopic(null)} className="bg-slate-950 text-slate-400 border border-slate-800 hover:text-white px-3 py-1.5 rounded-lg font-bold">
                  Fechar
                </button>
                <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg font-bold transition-all">
                  Computar Dados
                </button>
              </div>
            </form>

            {/* BLOCO DE NOTAS DE ESTUDO */}
            <div className="space-y-2">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Caderno de Apontamentos Técnicos</label>
              <textarea 
                className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Introduza conceitos chaves, mnemónicas ou resumos de artigos de lei..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button 
                onClick={() => {
                  let sId = "";
                  activeConcurso.materias.forEach(m => {
                    if (m.topicos.some(t => t.id === selectedTopic.id)) sId = m.id;
                  });
                  saveTopicNotes(sId, selectedTopic.id, noteText);
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 text-violet-400 border border-slate-800 py-1.5 rounded-lg text-xs font-bold transition-all"
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
