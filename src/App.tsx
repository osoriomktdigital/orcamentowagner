/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Utensils, Beer, Users, FileCheck, 
  ChevronRight, ChevronLeft, Plus, Minus, Check, 
  Database, Printer, RotateCcw, Sparkles, AlertCircle,
  Search, X, UserCircle, MessageCircle, Mail,
  QrCode, CreditCard, Wallet, Landmark,
  LayoutDashboard, FileText, Calendar, 
  TrendingUp, Bell, LogOut, Menu, ArrowUpRight, ArrowDownRight,
  Settings, Edit2, Download, Trash2, CheckCircle, Eye
} from 'lucide-react';
import { Button, Card, Input, Badge, cn } from './components/UI';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabaseService } from './services/supabaseService.ts';

// ==========================================
// 1. TIPAGEM E BANCO DE DADOS INICIAL (41 ITENS)
// ==========================================
export interface CatalogItem {
  id: number;
  codigo_ref: string;
  categoria: 'ESPAÇOS' | 'ALIMENTAÇÃO' | 'BEBIDAS' | 'EQUIPE';
  subcategoria: string | null;
  nome_item: string;
  qtd_base: number;
  preco_unitario: number;
  flag_obs: string;
  descricao_detalhada?: string;
}

const INITIAL_CATALOG: CatalogItem[] = [
  // 1. ESPAÇOS
  { id: 1, codigo_ref: 'ESP-001', categoria: 'ESPAÇOS', subcategoria: null, nome_item: 'Salão Imperial: Sábado ou Feriado', qtd_base: 1, preco_unitario: 12000.00, flag_obs: 'Valor Base', descricao_detalhada: 'Uso exclusivo do Salão Imperial em dias de pico. Inclui climatização central, iluminação cênica básica e gerador de emergência.' },
  { id: 2, codigo_ref: 'ESP-002', categoria: 'ESPAÇOS', subcategoria: null, nome_item: 'Salão Imperial: Sexta ou Domingo', qtd_base: 1, preco_unitario: 10000.00, flag_obs: 'Desconto Dia', descricao_detalhada: 'Tarifa reduzida para eventos realizados em sextas ou domingos. Mesma infraestrutura do pacote de sábado.' },
  { id: 3, codigo_ref: 'ESP-003', categoria: 'ESPAÇOS', subcategoria: null, nome_item: 'Salão Imperial: Meio de Semana', qtd_base: 1, preco_unitario: 8000.00, flag_obs: 'Desconto Dia', descricao_detalhada: 'Condições especiais para eventos corporativos ou sociais de segunda a quinta-feira.' },
  { id: 4, codigo_ref: 'ESP-004', categoria: 'ESPAÇOS', subcategoria: null, nome_item: 'Área Kids 2º Piso', qtd_base: 1, preco_unitario: 1000.00, flag_obs: 'Adicional', descricao_detalhada: 'Espaço recreativo completo no mezanino com brinquedão, piscina de bolinhas, games e monitoria inclusa.' },

  // 2.1 ALIMENTAÇÃO - Principal
  { id: 5, codigo_ref: 'ALI-PRI-001', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Churrasco + Pratos Quentes + Saladas', qtd_base: 1, preco_unitario: 141.00, flag_obs: 'Por Pessoa' },
  { id: 6, codigo_ref: 'ALI-PRI-002', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Galeto + Pratos Quentes + Saladas', qtd_base: 1, preco_unitario: 127.56, flag_obs: 'Por Pessoa' },
  { id: 7, codigo_ref: 'ALI-PRI-003', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Jantar com Pratos Quentes + Saladas', qtd_base: 1, preco_unitario: 118.12, flag_obs: 'Por Pessoa' },
  { id: 8, codigo_ref: 'ALI-PRI-004', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Convidados Crianças (5-10) - ref. Jantar', qtd_base: 1, preco_unitario: 59.06, flag_obs: 'Por Criança' },
  { id: 9, codigo_ref: 'ALI-PRI-005', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Finger-Food (Mini Porções) + Saladas', qtd_base: 1, preco_unitario: 88.62, flag_obs: 'Por Pessoa' },
  { id: 10, codigo_ref: 'ALI-PRI-006', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Convidados Crianças (5-10) - ref. Finger-Food', qtd_base: 1, preco_unitario: 44.31, flag_obs: 'Por Criança' },
  { id: 11, codigo_ref: 'ALI-PRI-007', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Coquetel de Salgados (Assados e Fritos)', qtd_base: 1, preco_unitario: 68.38, flag_obs: 'Por Pessoa' },
  { id: 12, codigo_ref: 'ALI-PRI-008', categoria: 'ALIMENTAÇÃO', subcategoria: 'Principal', nome_item: 'Convidados Crianças (6-10) - ref. Coquetel', qtd_base: 1, preco_unitario: 34.19, flag_obs: 'Por Criança' },

  // 2.2 ALIMENTAÇÃO - Complementar
  { id: 13, codigo_ref: 'ALI-SAL-001', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Entrada de Salgados (Assados e Fritos)', qtd_base: 1, preco_unitario: 0.00, flag_obs: 'Cortesia' },
  { id: 14, codigo_ref: 'ALI-SAL-002', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Entradas (Canapés e Barquetes)', qtd_base: 1, preco_unitario: 0.00, flag_obs: 'Cortesia' },
  { id: 15, codigo_ref: 'ALI-SAL-003', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Lanche da Madrugada (Batata Frita)', qtd_base: 1, preco_unitario: 0.00, flag_obs: 'Cortesia' },
  { id: 16, codigo_ref: 'ALI-SAL-004', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Mini Hambúrguer', qtd_base: 1, preco_unitario: 4.00, flag_obs: 'Por Unidade' },
  { id: 17, codigo_ref: 'ALI-SAL-005', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Mesa de Antepastos', qtd_base: 1, preco_unitario: 2500.00, flag_obs: 'Adicional Fixo' },
  { id: 18, codigo_ref: 'ALI-DOC-001', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: '300 Doces Finos', qtd_base: 1, preco_unitario: 0.00, flag_obs: 'Cortesia' },
  { id: 19, codigo_ref: 'ALI-DOC-002', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: '300 Doces Gourmet', qtd_base: 1, preco_unitario: 0.00, flag_obs: 'Cortesia' },
  { id: 20, codigo_ref: 'ALI-DOC-003', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Sobremesas Torta com Sorvete', qtd_base: 1, preco_unitario: 15.00, flag_obs: 'Por Pessoa' },
  { id: 21, codigo_ref: 'ALI-DOC-004', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Sobremesas Mousse/Pudim', qtd_base: 1, preco_unitario: 12.00, flag_obs: 'Por Pessoa' },
  { id: 22, codigo_ref: 'ALI-DOC-005', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Bolo de Corte', qtd_base: 1, preco_unitario: 7.20, flag_obs: 'Por Pessoa' },
  { id: 23, codigo_ref: 'ALI-DOC-006', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Bolo de Corte (Gourmet)', qtd_base: 1, preco_unitario: 12.00, flag_obs: 'Por Pessoa' },
  { id: 24, codigo_ref: 'ALI-DOC-007', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Personalização do Bolo', qtd_base: 1, preco_unitario: 150.00, flag_obs: 'Adicional Fixo' },
  { id: 25, codigo_ref: 'ALI-DOC-008', categoria: 'ALIMENTAÇÃO', subcategoria: 'Complementar', nome_item: 'Adicional Unidade Doce Fino', qtd_base: 1, preco_unitario: 1.20, flag_obs: 'Por Unidade' },

  // 3. BEBIDAS
  { id: 26, codigo_ref: 'BEB-001', categoria: 'BEBIDAS', subcategoria: 'Refrescos', nome_item: 'Bebidas (Refri linha Coca, águas)', qtd_base: 1, preco_unitario: 12.00, flag_obs: 'Por Pessoa' },
  { id: 27, codigo_ref: 'BEB-002', categoria: 'BEBIDAS', subcategoria: 'Adicionais', nome_item: 'Cerveja Nacional (600ml)', qtd_base: 1, preco_unitario: 16.00, flag_obs: 'Adicional' },
  { id: 28, codigo_ref: 'BEB-003', categoria: 'BEBIDAS', subcategoria: 'Adicionais', nome_item: 'Cerveja Importada (600ml)', qtd_base: 1, preco_unitario: 19.00, flag_obs: 'Adicional' },
  { id: 29, codigo_ref: 'BEB-004', categoria: 'BEBIDAS', subcategoria: 'Chopp', nome_item: 'Chopp 30 Litros', qtd_base: 30, preco_unitario: 13.50, flag_obs: 'Barril 30L' },
  { id: 30, codigo_ref: 'BEB-005', categoria: 'BEBIDAS', subcategoria: 'Chopp', nome_item: 'Chopp 50 Litros', qtd_base: 50, preco_unitario: 13.50, flag_obs: 'Barril 50L' },

  // 4. EQUIPE
  { id: 31, codigo_ref: 'EQU-001', categoria: 'EQUIPE', subcategoria: 'Staff', nome_item: 'Gerente de Festa', qtd_base: 1, preco_unitario: 650.00, flag_obs: 'Equipe Base' },
  { id: 32, codigo_ref: 'EQU-002', categoria: 'EQUIPE', subcategoria: 'Staff', nome_item: 'Cerimonialista', qtd_base: 1, preco_unitario: 650.00, flag_obs: 'Equipe Base' },
  { id: 33, codigo_ref: 'EQU-003', categoria: 'EQUIPE', subcategoria: 'Staff', nome_item: 'DJ e Sonoplasta', qtd_base: 1, preco_unitario: 600.00, flag_obs: 'Equipe Base' },
  { id: 34, codigo_ref: 'EQU-004', categoria: 'EQUIPE', subcategoria: 'Operação', nome_item: 'Equipe de Cozinha (Chef + Auxiliar)', qtd_base: 1, preco_unitario: 400.00, flag_obs: 'Base' },
  { id: 35, codigo_ref: 'EQU-005', categoria: 'EQUIPE', subcategoria: 'Operação', nome_item: 'Segurança Patrimonial', qtd_base: 1, preco_unitario: 200.00, flag_obs: 'Base' },
  { id: 36, codigo_ref: 'EQU-006', categoria: 'EQUIPE', subcategoria: 'Operação', nome_item: 'Higienista (Banheiros/Salão)', qtd_base: 1, preco_unitario: 180.00, flag_obs: 'Base' },
  { id: 37, codigo_ref: 'EQU-007', categoria: 'EQUIPE', subcategoria: 'Staff', nome_item: 'Recepcionista', qtd_base: 1, preco_unitario: 120.00, flag_obs: 'Base' },
  { id: 38, codigo_ref: 'EQU-008', categoria: 'EQUIPE', subcategoria: 'Serviço', nome_item: 'Garçom para Buffet (Base)', qtd_base: 1, preco_unitario: 200.00, flag_obs: 'Base' },
  { id: 39, codigo_ref: 'EQU-009', categoria: 'EQUIPE', subcategoria: 'Serviço', nome_item: 'Garçons Extras (Serviço Volante)', qtd_base: 1, preco_unitario: 200.00, flag_obs: 'Extra' },
  { id: 40, codigo_ref: 'EQU-010', categoria: 'EQUIPE', subcategoria: 'Operação', nome_item: 'Copeiras para Limpeza Louça', qtd_base: 1, preco_unitario: 200.00, flag_obs: 'Base' },
  { id: 41, codigo_ref: 'EQU-011', categoria: 'EQUIPE', subcategoria: 'Serviço', nome_item: 'Assador para Churrasco', qtd_base: 1, preco_unitario: 500.00, flag_obs: 'Extra' },
  { id: 42, codigo_ref: 'EQU-012', categoria: 'EQUIPE', subcategoria: 'Serviço', nome_item: 'Monitor de Buffet', qtd_base: 1, preco_unitario: 180.00, flag_obs: 'Extra' },
  { id: 43, codigo_ref: 'EQU-013', categoria: 'EQUIPE', subcategoria: 'Serviço', nome_item: 'Recreador Infantil Adicional', qtd_base: 1, preco_unitario: 250.00, flag_obs: 'Extra' },
  { id: 44, codigo_ref: 'EQU-014', categoria: 'EQUIPE', subcategoria: 'Operação', nome_item: 'Equipe de Limpeza Pós-Evento', qtd_base: 1, preco_unitario: 350.00, flag_obs: 'Extra' },
  { id: 45, codigo_ref: 'EQU-015', categoria: 'EQUIPE', subcategoria: 'Opcional', nome_item: 'Bartender (Serviço de Drinks)', qtd_base: 1, preco_unitario: 800.00, flag_obs: 'Extra' },
  { id: 46, codigo_ref: 'EQU-016', categoria: 'EQUIPE', subcategoria: 'Opcional', nome_item: 'Mestre de Cerimônias', qtd_base: 1, preco_unitario: 500.00, flag_obs: 'Extra' },
];

const MAIN_SECTIONS = [
  { id: 'TOOL', label: 'Novo Orçamento', icon: Plus },
  { 
    id: 'GESTÃO', 
    label: 'Gestão', 
    icon: Database,
    subItems: [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ORCAMENTOS', label: 'Orçamentos', icon: FileText },
      { id: 'LEADS', label: 'Leads', icon: Users },
    ]
  },
  { 
    id: 'CONFIG', 
    label: 'Configurações', 
    icon: Settings,
    subItems: [
      { id: 'CATALOG_EDIT', label: 'Itens do Orçamento', icon: Database }
    ]
  },
] as const;

const BUDGET_STEPS = [
  { id: 'CADASTRO', label: '0. Cadastro', icon: UserCircle },
  { id: 'ESPAÇOS', label: '1. Espaços', icon: Building2 },
  { id: 'ALIMENTAÇÃO', label: '2. Alimentação', icon: Utensils },
  { id: 'BEBIDAS', label: '3. Bebidas', icon: Beer },
  { id: 'EQUIPE', label: '4. Equipe', icon: Users },
  { id: 'RESUMO', label: '5. Fechamento', icon: FileCheck },
  { id: 'CONTRATO', label: '6. Contrato', icon: FileText },
  { id: 'AJUSTES', label: '7. Ajustes', icon: Sparkles },
] as const;

type SectionId = 'TOOL' | 'DASHBOARD' | 'ORCAMENTOS' | 'LEADS' | 'CONFIG' | 'CATALOG_EDIT' | 'CONTRATO_VIEW';
type StepId = typeof BUDGET_STEPS[number]['id'];

interface Budget {
  id: string;
  clienteNome: string;
  clienteWhats: string;
  clienteEmail?: string;
  dataEvento: string;
  numConvidados: number;
  totalFinal: number;
  subtotal: number;
  status: 'ENVIADO' | 'CONTRATADO';
  createdAt: string;
  selectedItems: Record<number, number>;
  activeDiscounts: number[];
  paymentMethod: string;
  installments: number;
  itens?: any[];
  tipoEvento?: string;
  horarioEvento?: string;
  duracaoEvento?: string;
  contractorData?: {
    cpfCnpj: string;
    rg: string;
    endereco: string;
    cidade: string;
    estadoCivil: string;
    profissao: string;
  };
}

const Modal = ({ isOpen, onClose, item }: { isOpen: boolean, onClose: () => void, item: CatalogItem | null }) => {
  if (!isOpen || !item) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl scale-in-center">
        <div className="bg-[#2B343B] p-6 text-white flex justify-between items-center">
          <div>
            <Badge variant="warning" className="mb-2">{item.codigo_ref}</Badge>
            <h3 className="text-xl font-bold">{item.nome_item}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-[#D4A373] pl-4 py-2 bg-gray-50 rounded-r-lg">
            "{item.descricao_detalhada || 'Descrição detalhada em processo de atualização para este item.'}"
          </p>
          <div className="pt-4 border-t flex justify-between items-center text-xs font-bold text-gray-400">
            <span>Categoria: {item.categoria}</span>
            <span className="text-[#D4A373] uppercase tracking-widest">{item.flag_obs}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [currentSection, setCurrentSection] = useState<SectionId>('DASHBOARD');
  const [activeStep, setActiveStep] = useState<StepId>('CADASTRO');
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhats, setClienteWhats] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [numConvidados, setNumConvidados] = useState<number>(50);
  const [activeDiscounts, setActiveDiscounts] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'VISTA' | 'CREDITO' | 'PIX_EVENTO'>('PIX_EVENTO');
  const [installments, setInstallments] = useState<number>(1);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<CatalogItem | null>(null);
  const [contractBudget, setContractBudget] = useState<Budget | null>(null);
  const [contractorData, setContractorData] = useState({
    cpfCnpj: '',
    rg: '',
    endereco: '',
    cidade: 'Gravataí/RS',
    estadoCivil: '',
    profissao: ''
  });
  const [tipoEvento, setTipoEvento] = useState('');
  const [horarioEvento, setHorarioEvento] = useState('20:00');
  const [duracaoEvento, setDuracaoEvento] = useState('5');
  const [showFullContract, setShowFullContract] = useState(false);

  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    const local = localStorage.getItem('imperial_catalog_v1');
    if (local) {
      const parsed = JSON.parse(local);
      const existingIds = new Set(parsed.map((i: any) => i.id));
      const newItems = INITIAL_CATALOG.filter(i => !existingIds.has(i.id));
      if (newItems.length > 0) {
        const merged = [...parsed, ...newItems];
        localStorage.setItem('imperial_catalog_v1', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return INITIAL_CATALOG;
  });

  const [backups, setBackups] = useState<{ id: string, date: string, data: CatalogItem[] }[]>(() => {
    const local = localStorage.getItem('imperial_catalog_backups');
    return local ? JSON.parse(local) : [];
  });

  const saveCatalogWithBackup = async () => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const newBackup = { id: `BK-${Date.now()}`, date: timestamp, data: [...catalog] };
    const updatedBackups = [newBackup, ...backups].slice(0, 5);
    setBackups(updatedBackups);
    localStorage.setItem('imperial_catalog_v1', JSON.stringify(catalog));
    localStorage.setItem('imperial_catalog_backups', JSON.stringify(updatedBackups));
    
    try {
      await supabaseService.saveCatalog(catalog);
    } catch (err) {
      console.error('Falha ao salvar no Supabase:', err);
    }
    
    alert(`Alterações salvas no catálogo!\nBackup criado: ${timestamp}`);
  };

  const restoreBackup = (backupData: CatalogItem[]) => {
    if (confirm('Deseja restaurar esta versão do catálogo? As alterações atuais serão perdidas.')) {
      setCatalog(backupData);
      localStorage.setItem('imperial_catalog_v1', JSON.stringify(backupData));
      alert('Catálogo restaurado!');
    }
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const resumoFinanceiro = useMemo(() => {
    let subtotal = 0;
    const porCategoria: Record<string, number> = { 'ESPAÇOS': 0, 'ALIMENTAÇÃO': 0, 'BEBIDAS': 0, 'EQUIPE': 0 };
    
    const itensDetalhados = catalog
      .filter((item) => selectedItems[item.id] !== undefined)
      .map((item) => {
        const quantidade = selectedItems[item.id];
        const totalItem = quantidade * item.preco_unitario;
        subtotal += totalItem;
        porCategoria[item.categoria] += totalItem;
        return { ...item, quantidade, totalItem };
      });

    const percDescontoAjuste = activeDiscounts.length * 0.10;
    const valorDescontoAjuste = subtotal * percDescontoAjuste;
    let totalPosAjuste = subtotal - valorDescontoAjuste;
    let totalFinal = totalPosAjuste;
    
    if (paymentMethod === 'VISTA') totalFinal = totalPosAjuste * 0.84;
    else if (paymentMethod === 'CREDITO') totalFinal = totalPosAjuste * Math.pow(1.029, installments);
    
    const valorSinal = 1000.00;
    const saldoRestante = Math.max(0, totalFinal - valorSinal);
    
    return { 
      subtotal, valorDescontoAjuste, totalPosAjuste, totalFinal, 
      itensDetalhados, valorSinal, saldoRestante, porCategoria 
    };
  }, [catalog, selectedItems, activeDiscounts, paymentMethod, installments]);

  const [savedBudgets, setSavedBudgets] = useState<Budget[]>(() => {
    const local = localStorage.getItem('imperial_budgets_v2');
    return local ? JSON.parse(local) : [];
  });

  const fetchInitialData = async () => {
    try {
      const supabaseCatalog = await supabaseService.getCatalog();
      if (supabaseCatalog && supabaseCatalog.length > 0) {
        setCatalog(supabaseCatalog);
        localStorage.setItem('imperial_catalog_v1', JSON.stringify(supabaseCatalog));
      }

      const supabaseBudgets = await supabaseService.getBudgets();
      if (supabaseBudgets) {
        setSavedBudgets(supabaseBudgets);
        localStorage.setItem('imperial_budgets_v2', JSON.stringify(supabaseBudgets));
      }
    } catch (err) {
      console.warn('Supabase não disponível ou erro na conexão, usando dados locais');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('imperial_budgets_v2', JSON.stringify(savedBudgets));
  }, [savedBudgets]);

  const handleSaveBudget = (status: 'ENVIADO' | 'CONTRATADO') => {
    const budget: Budget = {
      id: editingBudgetId || `ORC-${Math.floor(1000 + Math.random() * 9000)}`,
      clienteNome, clienteWhats, clienteEmail, dataEvento, numConvidados,
      totalFinal: resumoFinanceiro.totalFinal, subtotal: resumoFinanceiro.subtotal,
      status, createdAt: new Date().toISOString(), selectedItems, activeDiscounts, 
      paymentMethod, installments, itens: resumoFinanceiro.itensDetalhados,
      contractorData, tipoEvento, horarioEvento, duracaoEvento
    };
    const updated = editingBudgetId ? savedBudgets.map(b => b.id === editingBudgetId ? budget : b) : [...savedBudgets, budget];
    setSavedBudgets(updated);
    
    supabaseService.saveBudget(budget).catch(err => {
      console.error('Erro ao salvar orçamento no Supabase:', err);
    });

    alert(status === 'CONTRATADO' ? 'Pagamento Confirmado! Evento salvo.' : 'Orçamento salvo no painel.');
    resetTool();
    setCurrentSection('ORCAMENTOS');
  };

  const resetTool = () => {
    setClienteNome(''); setClienteWhats(''); setClienteEmail('');
    setDataEvento(''); setNumConvidados(50); setSelectedItems({});
    setActiveDiscounts([]); setPaymentMethod('PIX_EVENTO');
    setInstallments(1); setEditingBudgetId(null); setActiveStep('CADASTRO');
    setTipoEvento('');
    setHorarioEvento('20:00');
    setDuracaoEvento('5');
    setContractorData({ cpfCnpj: '', rg: '', endereco: '', cidade: 'Gravataí/RS', estadoCivil: '', profissao: '' });
  };

  const loadForEdit = (budget: Budget) => {
    setClienteNome(budget.clienteNome); setClienteWhats(budget.clienteWhats);
    setClienteEmail(budget.clienteEmail || ''); setDataEvento(budget.dataEvento);
    setNumConvidados(budget.numConvidados); setSelectedItems(budget.selectedItems);
    setActiveDiscounts(budget.activeDiscounts); setPaymentMethod(budget.paymentMethod as any);
    setInstallments(budget.installments); setEditingBudgetId(budget.id);
    setTipoEvento(budget.tipoEvento || '');
    setHorarioEvento(budget.horarioEvento || '20:00');
    setDuracaoEvento(budget.duracaoEvento || '5');
    setContractorData(budget.contractorData || { cpfCnpj: '', rg: '', endereco: '', cidade: 'Gravataí/RS', estadoCivil: '', profissao: '' });
    setCurrentSection('TOOL'); setActiveStep('CADASTRO');
  };

  const generateContractPDF = (budget: Budget) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 30;

    const checkPage = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addTitle = (text: string) => {
      checkPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(text, pageWidth / 2, y, { align: 'center' });
      y += 10;
    };

    const addText = (text: string, isBold = false, indent = 0, fontSize = 10) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      checkPage(lines.length * 5 + 2);
      doc.text(lines, margin + indent, y);
      y += (lines.length * 5) + 2;
    };

    const addSection = (text: string) => {
      y += 5;
      addText(text, true, 0, 10);
    };

    // Header
    addTitle('CONTRATO DE PRESTAÇÃO DE SERVIÇOS');
    
    addText('Pelo presente instrumento particular de prestação de serviços, de um lado:');
    addText('CONTRATADA: Floreali Eventos, inscrita no CNPJ nº 57.508.630/0001-99, representada por Wagner F. Barcellos, com endereço na RS 020, nº 4287, Gravataí/RS.', true);
    
    const cData = budget.contractorData || { cpfCnpj: '', rg: '', endereco: '', cidade: '', estadoCivil: '', profissao: '' };
    addText(`CONTRATANTE(s): Nome: ${budget.clienteNome || '________________'}, inscrito(s) no(s) CPF(s): ${cData.cpfCnpj || '________________'}, residente no endereço: ${cData.endereco || '________________'}, Cidade de ${cData.cidade || '________________'}, Celular: ${budget.clienteWhats || '________________'}, Email: ${budget.clienteEmail || '________________'}.`, true);
    
    addText('As partes acima identificadas têm entre si justo e contratado o presente contrato de prestação de serviços, que será regido pelas cláusulas e condições seguintes:');

    const hEv = budget.horarioEvento || horarioEvento;
    const dEv = budget.duracaoEvento || duracaoEvento;
    addSection(`Cláusula 1 – Detalhes do Evento para ${budget.numConvidados} Pessoas.`);
    addText(`1.1. Evento: ${budget.tipoEvento || '________________'}`);
    addText(`1.2. Data: ${budget.dataEvento ? new Date(budget.dataEvento).toLocaleDateString('pt-BR') : '__/__/____'}`);
    addText(`1.3. Horário do evento: Das ${hEv}H`);
    addText(`1.4. Horas de festa contratados (a contar do horário do convite): ${dEv} Horas`);

    addSection('Cláusula 2 – Objeto');
    addText('2.1. O presente contrato tem por objeto a locação de espaço para festas e eventos, bem como a disponibilização dos seguintes itens e serviços:');
    addText('Salão para Evento no Térreo + Área Kids', true);
    
    addText('Estrutura da casa:', true);
    addText('- Um lustre de 3,5 metros de largura e dois lustres menores para mesa dos doces');
    addText('- Camarim');
    addText('- Escada Iluminada com acesso entre pista de dança e camarim');
    addText('- Sonorização e iluminação de pista, Projetor e Telão.');
    addText('- Cozinha e seus utensílios, Refrigerador e Freezer.');
    addText('- Mesas, Cadeiras, Toalhas, Copos e Taças de vidro e Talheres.');

    addText('Decoração da casa com seguintes opções:', true);
    addText('- Um pergolado de madeira, Duas árvores de cerejeiras, Mesa quadrada, Mesas rústicas, Mesa espelhada ou sinuosa.');
    addText('- Bolo fake, suporte dos doces, arranjos de flores artificiais.');
    addText('- Toalhas Lisas ou Brocadas, Guardanapos de Tecido.');
    addText('- Centros de mesa variados.');

    addText('Alimentação:', true);
    const hasAlimentacao = budget.itens?.some(i => i.categoria === 'ALIMENTAÇÃO');
    if (hasAlimentacao) {
      addText('- Entradas: Canapés, barquetes e salgados variados.');
      addText('- Lanche da balada: Polenta e batata frita.');
      addText('- Principal: Finger-Food ou Jantar conforme orçamento detalhado.');
    } else {
      addText('- Conforme orçamento detalhado em anexo.');
    }

    addText('Bebidas:', true);
    addText('- Refrigerantes, águas (com e sem gás).');
    addText('- Bar de Drink (opcional conforme orçamento).');

    addText('Equipe:', true);
    addText('2.2. A equipe da casa (cerimonialista, DJ, garçons, copeira, segurança, higienista, recepção, gerente de festa, assador, cozinheira, auxiliar de cozinha) é disponibilizada conforme necessidades do evento.');

    addSection('Cláusula 3 – Valores e Condições de Pagamento');
    addText(`3.1. O valor total do presente contrato é de ${formatCurrency(budget.totalFinal)}, a ser pago pelo CONTRATANTE por meio de transferência bancária, PIX ou outro meio previamente acordado entre as partes.`);
    addText('3.2. No ato da assinatura deste contrato, o CONTRATANTE pagará o valor de R$ 1.000,00 (mil reais), a título de sinal inicial, o qual integra e compõe o montante total das arras penitenciais.');
    addText('Parágrafo único. As partes ajustam que o valor total das arras penitenciais corresponderá a 40% (quarenta por cento) do valor do contrato.');
    addText(`3.4. O valor restante será quitado no máximo, 45 dias antes da data do evento.`);

    addSection('Cláusula 4 – Cancelamento e Multas');
    addText('4.1. O cancelamento por parte do CONTRATANTE reterá 40% do valor total a título de cláusula penal.');
    addText('4.2. Multas adicionais aplicam-se conforme antecedência:');
    addText('• Superior a 180 dias: retenção de 50% sobre o saldo restante;');
    addText('• Entre 179 e 91 dias: retenção de 70% sobre o saldo restante;');
    addText('• Entre 90 e 61 dias: retenção de 90% sobre o saldo restante;');
    addText('• 60 dias ou menos: retenção de 100% sobre o saldo restante.');

    addSection('Cláusula 7 – Uso de Imagem');
    addText('7.1. O contratante autoriza, de forma gratuita, o uso de sua imagem e de seus convidados para fins comerciais e marketing (LGPD).');

    addSection('Cláusula 10 – Proibição de Bebidas e Gastronomia');
    addText('10.1. É proibido o fornecimento de bebidas alcoólicas para menores de 18 anos.');
    addText('11.1. É proibido o ingresso de serviços de gastronomia externa sem autorização prévia.');

    addSection('Cláusula 12 – Foro');
    addText('12.1. As partes elegem o foro da Comarca de Gravataí – RS.');

    y += 20;
    addText(`Gravataí, ${new Date().toLocaleDateString('pt-BR')}`, true);
    
    y += 25;
    checkPage(20);
    doc.line(margin, y, margin + 80, y);
    doc.line(pageWidth - margin - 80, y, pageWidth - margin, y);
    doc.text('Wagner F. Barcellos', margin + 40, y + 5, { align: 'center' });
    doc.text('CONTRATANTE', pageWidth - margin - 40, y + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.text('(CONTRATADA - Floreali Eventos)', margin + 40, y + 10, { align: 'center' });

    window.open(doc.output('bloburl'), '_blank');
  };

  const generatePDF = (targetBudget?: any) => {
    const budgetData = targetBudget || {
      clienteNome, clienteWhats, dataEvento, numConvidados,
      totalFinal: resumoFinanceiro.totalFinal,
      subtotal: resumoFinanceiro.subtotal,
      itens: resumoFinanceiro.itensDetalhados
    };
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Orçamento Salão Imperial', 10, 20);
    doc.setFontSize(11);
    doc.text(`Cliente: ${budgetData.clienteNome} | Data: ${budgetData.dataEvento ? budgetData.dataEvento.split('-').reverse().join('/') : ''}`, 10, 32);
    const rawItens = budgetData.itens || [];
    const tableData = rawItens.map((i: any) => [i.nome_item, i.quantidade, formatCurrency(i.preco_unitario), formatCurrency(i.totalItem)]);
    autoTable(doc, { startY: 40, head: [['Item', 'Qtd', 'Unitário', 'Total']], body: tableData });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${formatCurrency(budgetData.subtotal)}`, 10, finalY);
    doc.text(`Total Final: ${formatCurrency(budgetData.totalFinal)}`, 10, finalY + 7);
    window.open(doc.output('bloburl'), '_blank');
  };

  const [shareModal, setShareModal] = useState<{ isOpen: boolean, budget: Budget | null, type: 'ORCAMENTO' | 'CONTRATO' }>({
    isOpen: false, budget: null, type: 'ORCAMENTO'
  });

  const sendToWhatsApp = (budget: Budget, type: 'ORCAMENTO' | 'CONTRATO') => {
    const phone = '55' + budget.clienteWhats.replace(/\D/g, '');
    const message = `Olá ${budget.clienteNome}! Segue o seu ${type === 'ORCAMENTO' ? 'Orçamento' : 'Contrato'} do Salão Imperial.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const ShareModal = () => {
    if (!shareModal.isOpen || !shareModal.budget) return null;
    const { budget, type } = shareModal;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl scale-in-center text-center">
          <div className="bg-[#2B343B] p-6 text-white flex justify-between items-center text-left">
            <h3 className="text-lg font-bold">Enviar {type === 'ORCAMENTO' ? 'Orçamento' : 'Contrato'}</h3>
            <button onClick={() => setShareModal({ ...shareModal, isOpen: false })} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="w-16 h-16 bg-[#D4A373]/10 rounded-full flex items-center justify-center mx-auto">
               <FileText className="w-8 h-8 text-[#D4A373]" />
            </div>
            <p className="text-sm font-bold text-[#2B343B]">Documento pronto para envio!</p>
            <div className="space-y-3">
               <Button onClick={() => type === 'ORCAMENTO' ? generatePDF(budget) : generateContractPDF(budget)} variant="outline" className="w-full">Visualizar Novamente</Button>
               <Button onClick={() => sendToWhatsApp(budget, type)} className="w-full bg-[#25D366] hover:bg-[#128C7E] border-none text-white gap-2"><MessageCircle className="w-4 h-4" /> Enviar WhatsApp</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-[#D4A373] shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Faturamento Bruto</p>
          <h3 className="text-2xl font-black text-[#2B343B]">{formatCurrency(savedBudgets.reduce((acc, curr) => acc + curr.totalFinal, 0))}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-emerald-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eventos Fechados (Ano)</p>
          <h3 className="text-2xl font-black text-[#2B343B]">{savedBudgets.filter(b => b.status === 'CONTRATADO').length}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-blue-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Leads</p>
          <h3 className="text-2xl font-black text-[#2B343B]">{Array.from(new Set(savedBudgets.map(b => b.clienteWhats))).length}</h3>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#D4A373]" /> Desempenho Mensal</h3>
        <div className="h-48 flex items-end gap-2 px-4">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
             const count = savedBudgets.filter(b => b.status === 'CONTRATADO' && new Date(b.createdAt).getMonth() + 1 === m).length;
             const height = count * 30;
             return (
               <div key={m} className="flex-1 flex flex-col items-center gap-2 group relative">
                 <div className="w-full bg-[#D4A373]/10 rounded-t-sm group-hover:bg-[#D4A373]/20 transition-all cursor-help" style={{ height: `${Math.max(4, height)}px` }}>
                   {count > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#2B343B] text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{count}</div>}
                 </div>
                 <span className="text-[8px] font-bold text-gray-400">{m}</span>
               </div>
             )
           })}
        </div>
      </Card>
    </div>
  );

  const renderBudgets = () => (
    <Card className="p-0 overflow-hidden shadow-sm">
      <div className="p-6 border-b flex justify-between items-center"><h2 className="font-bold text-xl text-[#2B343B]">Gestão de Orçamentos</h2><Button onClick={() => setCurrentSection('TOOL')} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Novo</Button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-400"><tr><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Data</th><th className="px-6 py-4">Total</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y">{savedBudgets.map(b => (<tr key={b.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold text-[#2B343B]">{b.clienteNome}</td><td className="px-6 py-4">{b.dataEvento ? b.dataEvento.split('-').reverse().join('/') : ''}</td><td className="px-6 py-4 font-bold">{formatCurrency(b.totalFinal)}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => loadForEdit(b)} className="p-1.5 text-gray-400 hover:text-[#D4A373] transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button><button onClick={() => { setContractorData(b.contractorData || { cpfCnpj: '', rg: '', endereco: '', cidade: 'Gravataí/RS', estadoCivil: '', profissao: '' }); generateContractPDF(b); }} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors" title="Ver Contrato"><Eye className="w-4 h-4" /></button><button onClick={async () => { if(confirm('Excluir?')) { setSavedBudgets(savedBudgets.filter(x => x.id !== b.id)); await supabaseService.deleteBudget(b.id).catch(err => console.error('Erro ao excluir no Supabase:', err)); } }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
    </Card>
  );

  const renderLeads = () => (
    <Card className="p-0 overflow-hidden shadow-sm">
      <div className="p-6 border-b flex items-center justify-between"><h2 className="font-bold text-xl text-[#2B343B]">Lista de Leads</h2><Badge variant="neutral">{Array.from(new Set(savedBudgets.map(b => b.clienteWhats))).length} contatos</Badge></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-400"><tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">WhatsApp</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y">{Array.from(new Set(savedBudgets.map(b => b.clienteWhats))).map(whats => { const lead = savedBudgets.find(b => b.clienteWhats === whats)!; return (<tr key={whats} className="hover:bg-gray-50"><td className="px-6 py-4 font-bold text-[#2B343B]">{lead.clienteNome}</td><td className="px-6 py-4 font-mono">{lead.clienteWhats}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => loadForEdit(lead)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Editar Orçamento"><Edit2 className="w-4 h-4" /></button><button onClick={() => { setShareModal({ isOpen: true, budget: lead, type: 'ORCAMENTO' }); generatePDF(lead); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Orçamento PDF"><FileText className="w-4 h-4" /></button><button onClick={() => { setContractorData(lead.contractorData || { cpfCnpj: '', rg: '', endereco: '', cidade: 'Gravataí/RS', estadoCivil: '', profissao: '' }); generateContractPDF(lead); }} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Visualizar Contrato PDF"><Eye className="w-4 h-4" /></button><button onClick={() => { setContractBudget(lead); setContractorData(lead.contractorData || { cpfCnpj: '', rg: '', endereco: '', cidade: 'Gravataí/RS', estadoCivil: '', profissao: '' }); setCurrentSection('CONTRATO_VIEW'); }} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Editar Dados do Contrato"><FileCheck className="w-4 h-4" /></button></td></tr>); })}</tbody></table></div>
    </Card>
  );

  const renderCatalogEdit = () => (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-6 border-b flex justify-between items-center flex-wrap gap-4"><h2 className="font-bold text-lg text-[#2B343B]">Itens do Orçamento</h2><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setCatalog(INITIAL_CATALOG)} className="gap-2"><RotateCcw className="w-3 h-3" /> Resetar</Button><Button size="sm" variant="accent" onClick={saveCatalogWithBackup} className="gap-2"><Database className="w-3 h-3" /> Salvar Alterações</Button></div></div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase"><tr><th className="px-6 py-4">Nomenclatura do Item</th><th className="px-6 py-4">Valor (R$)</th></tr></thead>
              <tbody className="divide-y">{catalog.map((item, idx) => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-3"><Input value={item.nome_item} onChange={e => { const nc = [...catalog]; nc[idx] = {...item, nome_item: e.target.value}; setCatalog(nc); }} className="h-9 text-sm" /></td><td className="px-6 py-3"><Input type="number" value={item.preco_unitario} onChange={e => { const nc = [...catalog]; nc[idx] = {...item, preco_unitario: Number(e.target.value)}; setCatalog(nc); }} className="h-9 w-28 text-sm font-bold text-[#D4A373]" /></td></tr>))}</tbody>
           </table>
        </div>
      </Card>
      {backups.length > 0 && <Card className="p-6"><h3 className="font-bold mb-4 text-[#2B343B]">Restaurar Backups</h3><div className="flex flex-wrap gap-3">{backups.map(bk => (<Button key={bk.id} size="sm" variant="outline" onClick={() => restoreBackup(bk.data)} className="text-[10px]">{bk.date}</Button>))}</div></Card>}
    </div>
  );

  const renderContractView = () => {
    if (!contractBudget) return null;
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setCurrentSection('LEADS')} size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar para Leads
          </Button>
          <h2 className="text-2xl font-black text-[#2B343B]">Gerar Contrato: {contractBudget.clienteNome}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-[#D4A373] uppercase text-xs tracking-widest flex items-center gap-2">
              <UserCircle className="w-4 h-4" /> Conferência de Dados
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Contratante *</label>
                <Input 
                  value={contractBudget.clienteNome} 
                  onChange={e => setContractBudget({...contractBudget, clienteNome: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp *</label>
                <Input 
                  value={contractBudget.clienteWhats} 
                  onChange={e => setContractBudget({...contractBudget, clienteWhats: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail *</label>
                <Input 
                  value={contractBudget.clienteEmail || ''} 
                  onChange={e => setContractBudget({...contractBudget, clienteEmail: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data do Evento *</label>
                <Input 
                  type="date"
                  value={contractBudget.dataEvento} 
                  onChange={e => setContractBudget({...contractBudget, dataEvento: e.target.value})} 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário Início *</label>
                  <Input type="time" value={horarioEvento} onChange={e => setHorarioEvento(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duração (Horas) *</label>
                  <Input type="number" value={duracaoEvento} onChange={e => setDuracaoEvento(e.target.value)} required />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6 border-[#D4A373]/20">
            <h3 className="font-bold text-[#D4A373] uppercase text-xs tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Dados Faltantes (Contratante)
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF ou CNPJ *</label>
                <Input 
                  value={contractorData.cpfCnpj} 
                  onChange={e => setContractorData({...contractorData, cpfCnpj: e.target.value})} 
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Evento *</label>
                <Input 
                  value={contractBudget.tipoEvento || ''} 
                  onChange={e => setContractBudget({...contractBudget, tipoEvento: e.target.value})} 
                  placeholder="Ex: 15 Anos, Casamento, Formatura"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade de Realização *</label>
                <Input 
                  value={contractorData.cidade} 
                  onChange={e => setContractorData({...contractorData, cidade: e.target.value})} 
                  placeholder="Cachoeirinha / Gravataí / RS"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RG *</label>
                <Input 
                  value={contractorData.rg} 
                  onChange={e => setContractorData({...contractorData, rg: e.target.value})} 
                  placeholder="000000000"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço Completo *</label>
                <Input 
                  value={contractorData.endereco} 
                  onChange={e => setContractorData({...contractorData, endereco: e.target.value})} 
                  placeholder="Rua, Número, Bairro, Cidade"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado Civil *</label>
                  <Input 
                    value={contractorData.estadoCivil} 
                    onChange={e => setContractorData({...contractorData, estadoCivil: e.target.value})} 
                    placeholder="Solteiro/Casado"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profissão *</label>
                  <Input 
                    value={contractorData.profissao} 
                    onChange={e => setContractorData({...contractorData, profissao: e.target.value})} 
                    placeholder="Ex: Engenheiro"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => setShowFullContract(!showFullContract)} 
            variant="outline" 
            className="gap-2 border-[#D4A373] text-[#D4A373] hover:bg-[#D4A373]/5"
          >
            <Eye className="w-4 h-4" /> 
            {showFullContract ? 'Ocultar Contrato' : 'Visualizar Contrato Inteiro'}
          </Button>
        </div>

        {showFullContract && (
          <Card className="p-8 bg-white border shadow-lg overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2B343B]"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="font-black text-xl text-[#2B343B]">Minuta do Contrato</h4>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Visualização Prévia</p>
              </div>
              <div className="text-right">
                <Badge variant="warning">SALÃO IMPERIAL</Badge>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-600 text-[11px] leading-relaxed space-y-4 font-serif border p-6 rounded bg-gray-50/50">
              <p className="font-bold text-center text-sm border-b pb-2 mb-4">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE EVENTOS</p>
              
              <p>
                <strong>CONTRATADA:</strong> FLOREALI EVENTOS, pessoa jurídica de direito privado, inscrita no CNPJ nº 57.508.630/0001-99, com sede em Gravataí/RS, doravante denominada apenas CONTRATADA.
              </p>

              <p>
                <strong>CONTRATANTE:</strong> {contractBudget.clienteNome || '__________________________________'}, 
                inscrito no CPF/CNPJ sob nº {contractorData.cpfCnpj || '________________'}, 
                RG {contractorData.rg || '________________'}, 
                residente e domiciliado em {contractorData.endereco || '__________________________________'},
                Estado Civil: {contractorData.estadoCivil || '________________'}, 
                Profissão: {contractorData.profissao || '________________'},
                doravante denominado apenas CONTRATANTE.
              </p>

              <p><strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> Locação de espaço e buffet para o evento {contractBudget.tipoEvento || '________________'} a ser realizado no dia {contractBudget.dataEvento ? contractBudget.dataEvento.split('-').reverse().join('/') : '__/__/____'}, com início às {horarioEvento}h e duração de {duracaoEvento} horas, para aproximadamente {contractBudget.numConvidados} convidados.</p>
              
              <p><strong>CLÁUSULA SEGUNDA - DO VALOR:</strong> Pela prestação dos serviços ora contratados, o CONTRATANTE pagará à CONTRATADA o valor total de {formatCurrency(contractBudget.totalFinal)}.</p>
              
              <p><strong>CLÁUSULA TERCEIRA - DO SINAL:</strong> Para reserva da data, será pago um sinal no valor de R$ 1.000,00 (um mil reais) no ato da assinatura.</p>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="outline" 
                className="gap-2 border-gray-200"
                onClick={() => generateContractPDF(contractBudget)}
              >
                <Download className="w-4 h-4" /> Gerar PDF
              </Button>
              <Button 
                className="bg-[#25D366] hover:bg-[#128C7E] border-none text-white gap-2 shadow-lg shadow-emerald-200"
                onClick={() => sendToWhatsApp(contractBudget, 'CONTRATO')}
              >
                <MessageCircle className="w-4 h-4" /> Enviar p/ WhatsApp
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderToolStep = () => {
    const isAjustes = activeStep === 'AJUSTES';
    const currentCategoryTotal = resumoFinanceiro.itensDetalhados
      .filter(i => i.categoria === activeStep)
      .reduce((acc, curr) => acc + curr.totalItem, 0);

    return (
      <div className={cn("grid grid-cols-1 gap-8", isAjustes ? "max-w-4xl mx-auto" : "lg:grid-cols-3")}>
        <div className={cn(isAjustes ? "col-span-1" : "lg:col-span-2")}>
          {(() => {
            switch(activeStep) {
              case 'CADASTRO':
                return (
                  <div className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
                    <h3 className="text-xl font-bold font-display text-[#2B343B]">Cadastro do Lead</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo *</label><Input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Ex: Maria Silva" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp *</label><Input value={clienteWhats} onChange={e => setClienteWhats(e.target.value)} placeholder="(51) 99999-9999" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</label><Input value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="contato@exemplo.com" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data do Evento</label><Input type="date" value={dataEvento} onChange={e => setDataEvento(e.target.value)} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nº Convidados</label><Input type="number" value={numConvidados} onChange={e => setNumConvidados(Number(e.target.value))} /></div>
                    </div>
                  </div>
                );
              case 'ESPAÇOS':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catalog.filter(i => i.categoria === 'ESPAÇOS').map(item => {
                      const isSelected = selectedItems[item.id] !== undefined;
                      return (<div key={item.id} onClick={() => setSelectedItems(prev => { const next = {...prev}; if(isSelected) delete next[item.id]; else { if(item.codigo_ref.startsWith('ESP-00') && item.codigo_ref !== 'ESP-004') [1, 2, 3].forEach(id => delete next[id]); next[item.id] = 1; } return next; })} className={cn("p-6 rounded-xl border-2 cursor-pointer transition-all relative group h-full flex flex-col justify-between", isSelected ? "border-[#D4A373] bg-[#D4A373]/5 shadow-md" : "bg-white border-gray-100 hover:border-gray-300")}><div className="mb-4"><h4 className="font-bold text-[#2B343B] text-sm leading-tight">{item.nome_item}</h4><p className="text-[10px] text-gray-400 mt-2 line-clamp-2">{item.descricao_detalhada}</p></div><div className="pt-4 border-t border-gray-50 flex justify-between items-center"><span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-tighter">{item.flag_obs}</span><span className="text-lg font-black text-[#2B343B]">{formatCurrency(item.preco_unitario)}</span></div>{isSelected && <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4A373] text-white rounded-full flex items-center justify-center shadow-lg"><Check className="w-3 h-3 stroke-[4]" /></div>}</div>);
                    })}
                  </div>
                );
              case 'ALIMENTAÇÃO':
                return (
                  <div className="space-y-8">
                    {Array.from(new Set(catalog.filter(i => i.categoria === 'ALIMENTAÇÃO').map(i => i.subcategoria || 'Geral'))).map(sub => (
                      <div key={sub} className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="h-px bg-gray-100 flex-1"></div>
                          {sub}
                          <div className="h-px bg-gray-100 flex-1"></div>
                        </h4>
                        <div className="space-y-3">
                          {catalog.filter(i => i.categoria === 'ALIMENTAÇÃO' && (i.subcategoria === sub || (!i.subcategoria && sub === 'Geral'))).map(item => {
                            const isSelected = selectedItems[item.id] !== undefined;
                            return (
                              <div key={item.id} className={cn("p-5 bg-white border-2 rounded-2xl flex justify-between items-center transition-all", isSelected ? "border-[#D4A373] shadow-sm" : "border-gray-100")}>
                                <div className="flex items-center gap-4">
                                  <button onClick={() => setSelectedItems(prev => { const next = {...prev}; if(isSelected) delete next[item.id]; else next[item.id] = numConvidados; return next; })} className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-colors", isSelected ? "bg-[#D4A373] border-[#D4A373] text-white" : "border-gray-200")}>{isSelected && <Check className="w-4 h-4" />}</button>
                                  <div>
                                    <span className="font-bold block text-sm text-[#2B343B]">{item.nome_item}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{formatCurrency(item.preco_unitario)} / pax</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl">
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedItems(prev => ({...prev, [item.id]: Math.max(1, (prev[item.id] || 0) - 1)}))} className="h-8 w-8 p-0 text-gray-400 hover:text-[#2B343B]"><Minus className="w-3 h-3" /></Button>
                                  <span className="font-bold text-sm w-10 text-center">{selectedItems[item.id] || 0}</span>
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedItems(prev => ({...prev, [item.id]: (prev[item.id] || 0) + 1}))} className="h-8 w-8 p-0 text-gray-400 hover:text-[#2B343B]"><Plus className="w-3 h-3" /></Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              case 'BEBIDAS':
                return (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[29, 30].map(id => { const item = catalog.find(i => i.id === id)!; const isSelected = selectedItems[id] !== undefined; return (<div key={id} onClick={() => setSelectedItems(prev => { const next = {...prev}; delete next[29]; delete next[30]; next[id] = item.qtd_base; return next; })} className={cn("p-5 bg-white border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center", isSelected ? "border-[#D4A373] ring-4 ring-[#D4A373]/10" : "border-gray-100 hover:border-gray-300")}><div><span className="font-bold block text-[#2B343B]">{item.nome_item}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Barril {item.qtd_base}L</span></div><span className="font-black text-lg text-[#2B343B]">{formatCurrency(item.preco_unitario * item.qtd_base)}</span></div>); })}
                    </div>
                    <div className="space-y-3 pt-8 border-t">
                      <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cervejas e Refrescos (Estimativa POA: 1.5 un/pax)</h5>
                      {catalog.filter(i => i.categoria === 'BEBIDAS' && i.id < 29).map(item => { const isSelected = selectedItems[item.id] !== undefined; const suggested = Math.ceil(numConvidados * 1.5); return (<div key={item.id} className={cn("p-4 bg-white border-2 rounded-xl flex justify-between items-center transition-all", isSelected ? "border-[#D4A373]" : "border-gray-100")}><div className="flex items-center gap-4"><button onClick={() => setSelectedItems(prev => { const next = {...prev}; if(isSelected) delete next[item.id]; else next[item.id] = suggested; return next; })} className={cn("w-5 h-5 rounded border-2 transition-colors", isSelected ? "bg-[#2B343B] border-[#2B343B] text-white" : "border-gray-200")}>{isSelected && <Check className="w-3 h-3" />}</button><span className="font-bold text-sm text-[#2B343B]">{item.nome_item}</span></div>{isSelected && (<div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg"><Button size="sm" variant="ghost" onClick={() => setSelectedItems({...selectedItems, [item.id]: suggested})} className="text-[10px] font-bold text-[#D4A373] hover:bg-white px-2">Sugestão ({suggested}un)</Button><Input type="number" value={selectedItems[item.id]} onChange={e => setSelectedItems({...selectedItems, [item.id]: Number(e.target.value)})} className="h-8 w-16 text-center text-sm font-bold bg-white" /></div>)}</div>); })}
                    </div>
                  </div>
                );
              case 'EQUIPE':
                return (
                  <div className="space-y-8">
                    {Array.from(new Set(catalog.filter(i => i.categoria === 'EQUIPE').map(i => i.subcategoria || 'Geral'))).map(sub => (
                      <div key={sub} className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="h-px bg-gray-100 flex-1"></div>
                          {sub}
                          <div className="h-px bg-gray-100 flex-1"></div>
                        </h4>
                        <div className="space-y-3">
                          {catalog.filter(i => i.categoria === 'EQUIPE' && (i.subcategoria === sub || (!i.subcategoria && sub === 'Geral'))).map(item => {
                            const isSelected = selectedItems[item.id] !== undefined;
                            return (
                              <div key={item.id} className={cn("p-4 bg-white border-2 rounded-xl flex justify-between items-center transition-all", isSelected ? "border-[#D4A373]" : "border-gray-100")}>
                                <div className="flex items-center gap-4">
                                  <button onClick={() => setSelectedItems(prev => { const next = {...prev}; if(isSelected) delete next[item.id]; else next[item.id] = item.qtd_base; return next; })} className={cn("w-5 h-5 rounded border-2 transition-colors", isSelected ? "bg-[#2B343B] border-[#2B343B] text-white" : "border-gray-200")}>{isSelected && <Check className="w-3 h-3" />}</button>
                                  <div>
                                    <span className="font-bold text-sm text-[#2B343B]">{item.nome_item}</span>
                                    <span className="text-[10px] text-gray-400 font-bold block">Base: {item.qtd_base} pax</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {isSelected && (
                                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                                      <Button size="sm" variant="ghost" onClick={() => setSelectedItems({...selectedItems, [item.id]: Math.max(1, (selectedItems[item.id] || 0) - 1)})} className="h-6 w-6 p-0"><Minus className="w-2 h-2" /></Button>
                                      <span className="text-xs font-bold w-6 text-center">{selectedItems[item.id]}</span>
                                      <Button size="sm" variant="ghost" onClick={() => setSelectedItems({...selectedItems, [item.id]: (selectedItems[item.id] || 0) + 1})} className="h-6 w-6 p-0"><Plus className="w-2 h-2" /></Button>
                                    </div>
                                  )}
                                  <span className="font-bold text-[#D4A373] text-sm">{formatCurrency(item.preco_unitario * (selectedItems[item.id] || 0))}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              case 'RESUMO':
                return (
                  <div className="space-y-8 bg-white p-8 rounded-2xl border shadow-sm">
                    <h4 className="font-bold text-lg text-[#2B343B] flex items-center gap-2"><FileText className="w-5 h-5 text-[#D4A373]" /> Detalhamento do Orçamento</h4>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {resumoFinanceiro.itensDetalhados.map(i => (
                        <div key={i.id} className="flex justify-between py-3">
                          <div><span className="font-bold text-sm text-[#2B343B]">{i.nome_item}</span><span className="text-xs text-gray-400 ml-2">x{i.quantidade}</span></div>
                          <span className="font-bold text-[#2B343B] text-sm">{formatCurrency(i.totalItem)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opções de Pagamento</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button onClick={() => setPaymentMethod('VISTA')} className={cn("p-4 border-2 rounded-xl text-left transition-all", paymentMethod === 'VISTA' ? "border-[#D4A373] bg-[#D4A373]/5" : "border-gray-100 hover:border-gray-300")}>
                          <Wallet className="w-5 h-5 mb-2 text-[#D4A373]" />
                          <span className="block font-bold text-sm">À Vista</span>
                          <span className="text-[10px] text-emerald-600 font-bold">16% de Desconto</span>
                        </button>
                        <button onClick={() => setPaymentMethod('CREDITO')} className={cn("p-4 border-2 rounded-xl text-left transition-all", paymentMethod === 'CREDITO' ? "border-[#D4A373] bg-[#D4A373]/5" : "border-gray-100 hover:border-gray-300")}>
                          <CreditCard className="w-5 h-5 mb-2 text-[#D4A373]" />
                          <span className="block font-bold text-sm">Cartão</span>
                          <span className="text-[10px] text-gray-400">2,9% juros a.m.</span>
                        </button>
                        <button onClick={() => setPaymentMethod('PIX_EVENTO')} className={cn("p-4 border-2 rounded-xl text-left transition-all", paymentMethod === 'PIX_EVENTO' ? "border-[#D4A373] bg-[#D4A373]/5" : "border-gray-100 hover:border-gray-300")}>
                          <QrCode className="w-5 h-5 mb-2 text-[#D4A373]" />
                          <span className="block font-bold text-sm">PIX até Evento</span>
                          <span className="text-[10px] text-gray-400">Valor Integral</span>
                        </button>
                      </div>
                      
                      {paymentMethod === 'CREDITO' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Quantidade de Vezes</label>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 10, 12].map(v => (
                              <button key={v} onClick={() => setInstallments(v)} className={cn("w-10 h-10 rounded-lg font-bold text-sm transition-all", installments === v ? "bg-[#2B343B] text-white shadow-md" : "bg-white border border-gray-200 text-gray-400 hover:border-gray-400")}>{v}x</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t flex flex-col items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 text-center">
                        <QRCodeSVG value="pix:salaoimperial" size={140} />
                        <p className="text-[10px] font-black text-center mt-3 text-[#D4A373] uppercase tracking-widest">Sinal de Reserva: R$ 1.000,00</p>
                      </div>
                      <div className="flex gap-4 w-full">
                        <Button variant="outline" onClick={() => generatePDF()} className="flex-1">Ver PDF</Button>
                      </div>
                    </div>
                  </div>
                );
              case 'CONTRATO':
                return (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 space-y-6">
                        <h3 className="font-bold text-[#D4A373] uppercase text-xs tracking-widest flex items-center gap-2">
                          <UserCircle className="w-4 h-4" /> Conferência de Dados
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Contratante *</label>
                            <Input value={clienteNome} onChange={e => setClienteNome(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp *</label>
                            <Input value={clienteWhats} onChange={e => setClienteWhats(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail *</label>
                            <Input value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data do Evento *</label>
                            <Input type="date" value={dataEvento} onChange={e => setDataEvento(e.target.value)} required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário Início *</label>
                              <Input type="time" value={horarioEvento} onChange={e => setHorarioEvento(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duração (Horas) *</label>
                              <Input type="number" value={duracaoEvento} onChange={e => setDuracaoEvento(e.target.value)} required />
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 space-y-6 border-[#D4A373]/20">
                        <h3 className="font-bold text-[#D4A373] uppercase text-xs tracking-widest flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Dados Faltantes (Contratante)
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF ou CNPJ *</label>
                            <Input 
                              value={contractorData.cpfCnpj} 
                              onChange={e => setContractorData({...contractorData, cpfCnpj: e.target.value})} 
                              placeholder="000.000.000-00"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Evento *</label>
                            <Input value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} placeholder="Ex: 15 Anos, Casamento, Formatura" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade de Realização *</label>
                            <Input value={contractorData.cidade} onChange={e => setContractorData({...contractorData, cidade: e.target.value})} placeholder="Cachoeirinha / Gravataí / RS" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RG *</label>
                            <Input 
                              value={contractorData.rg} 
                              onChange={e => setContractorData({...contractorData, rg: e.target.value})} 
                              placeholder="000000000"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço Completo *</label>
                            <Input 
                              value={contractorData.endereco} 
                              onChange={e => setContractorData({...contractorData, endereco: e.target.value})} 
                              placeholder="Rua, Número, Bairro, Cidade"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado Civil *</label>
                              <Input 
                                value={contractorData.estadoCivil} 
                                onChange={e => setContractorData({...contractorData, estadoCivil: e.target.value})} 
                                placeholder="Solteiro/Casado"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profissão *</label>
                              <Input 
                                value={contractorData.profissao} 
                                onChange={e => setContractorData({...contractorData, profissao: e.target.value})} 
                                placeholder="Ex: Engenheiro"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-4">
                      <Button 
                        onClick={() => setShowFullContract(!showFullContract)} 
                        variant="outline" 
                        className="gap-2 border-[#D4A373] text-[#D4A373] hover:bg-[#D4A373]/5"
                      >
                        <Eye className="w-4 h-4" /> 
                        {showFullContract ? 'Ocultar Contrato' : 'Visualizar Contrato Inteiro'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 border-gray-200"
                        onClick={() => generateContractPDF({
                          id: editingBudgetId || Date.now(),
                          clienteNome, clienteWhats, clienteEmail,
                          dataEvento, numConvidados,
                          totalFinal: resumoFinanceiro.totalFinal,
                          contractorData,
                          tipoEvento, horarioEvento, duracaoEvento,
                          status: 'ORCAMENTO',
                          createdAt: new Date().toISOString(),
                          activeDiscounts: [],
                          paymentMethod: 'VISTA',
                          installments: 1,
                          selectedItems: {}
                        } as any)}
                      >
                        <Download className="w-4 h-4" /> Gerar PDF
                      </Button>
                      <Button 
                        onClick={() => handleSaveBudget('CONTRATADO')}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-100"
                      >
                        <CheckCircle className="w-4 h-4" /> Finalizar e Salvar
                      </Button>
                    </div>

                    {showFullContract && (
                      <Card className="p-8 bg-white border shadow-lg overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#2B343B]"></div>
                        <div className="prose prose-sm max-w-none text-gray-600 text-[10px] leading-relaxed space-y-3 font-serif border p-6 rounded bg-gray-50/50">
                          <p className="font-bold text-center text-xs border-b pb-2 mb-4 uppercase">Contrato de Prestação de Serviços</p>
                          <p><strong>CONTRATADA:</strong> FLOREALI EVENTOS (Salão Imperial Premium), Gravataí/RS.</p>
                          <p><strong>CONTRATANTE:</strong> {clienteNome || '________________'}, CPF/CNPJ {contractorData.cpfCnpj || '________________'}, residente em {contractorData.endereco || '________________'}, Cidade: {contractorData.cidade || '________________'}.</p>
                          <p><strong>CLÁUSULA 1 - EVENTO:</strong> {tipoEvento || '________________'} para {numConvidados} pessoas, no dia {dataEvento ? dataEvento.split('-').reverse().join('/') : '__/__/____'}, com início às {horarioEvento}h e duração de {duracaoEvento} horas.</p>
                          <p><strong>CLÁUSULA 2 - OBJETO:</strong> Prestação de serviços de locação e buffet conforme orçamento detalhado.</p>
                          <p><strong>CLÁUSULA 3 - VALOR:</strong> O valor total contratado é de {formatCurrency(resumoFinanceiro.totalFinal)}, com sinal de reserva de R$ 1.000,00.</p>
                          <p className="text-[9px] text-gray-400 mt-4 italic">* Este documento é uma visualização prévia. O PDF oficial contém todas as cláusulas jurídicas e técnicas.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                );
              case 'AJUSTES':
                return (
                  <div className="space-y-6 max-w-xl mx-auto"><div className="bg-white p-8 rounded-2xl border shadow-sm"><h3 className="font-bold text-xl mb-4 text-[#2B343B]">Ajustes Gerenciais</h3><div className="space-y-3">{[1, 2, 3].map(id => (<button key={id} onClick={() => setActiveDiscounts(prev => activeDiscounts.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} className={cn("w-full p-4 border-2 rounded-xl flex justify-between items-center transition-all", activeDiscounts.includes(id) ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:bg-gray-50")}><div className="flex items-center gap-3"><div className={cn("w-5 h-5 rounded flex items-center justify-center", activeDiscounts.includes(id) ? "bg-emerald-500 text-white" : "bg-gray-100")}>{activeDiscounts.includes(id) && <Check className="w-3 h-3" />}</div><span className="font-bold text-[#2B343B]">Desconto Gerência 0{id}</span></div><span className="text-emerald-600 font-bold">-10%</span></button>))}</div><div className="mt-8 pt-8 border-t text-center space-y-2"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor Final Estimado</p><h4 className="text-4xl font-black text-emerald-600">{formatCurrency(resumoFinanceiro.totalPosAjuste)}</h4><Button onClick={() => handleSaveBudget('ENVIADO')} className="w-full mt-4 h-12 text-lg">Salvar e Concluir</Button></div></div></div>
                );
              default: return null;
            }
          })()}
        </div>
        {!isAjustes && (
          <aside className="lg:col-span-1">
            <div className="sticky top-[100px] space-y-6">
              <Card className="p-6 bg-[#2B343B] text-white border-none shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4">Resumo da Categoria</h4>
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-xs font-bold text-white/60 mb-1">{activeStep}</p>
                    <h3 className="text-2xl font-black">{formatCurrency(currentCategoryTotal)}</h3>
                  </div>
                  <Badge variant="warning" className="bg-[#D4A373] text-white border-none">Parcial</Badge>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/40 uppercase tracking-tighter">Subtotal Geral</span>
                    <span>{formatCurrency(resumoFinanceiro.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#D4A373]">
                    <span className="uppercase text-white/40 tracking-tighter">Sinal Reserva</span>
                    <span>{formatCurrency(1000)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-400">
                    <span className="uppercase text-white/40 tracking-tighter">Saldo Restante</span>
                    <span>{formatCurrency(resumoFinanceiro.saldoRestante)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </aside>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2B343B] flex font-body">
      <aside className="w-64 bg-[#2B343B] text-white flex flex-col fixed h-full z-50 shadow-2xl">
        <div className="p-8 flex items-center gap-3 bg-white/5"><div className="p-2 bg-[#D4A373] rounded-lg"><Sparkles className="text-white w-5 h-5" /></div><h1 className="font-bold text-lg font-display tracking-tight text-white">Orçamento<span className="text-[#D4A373]">Lindo</span></h1></div>
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {MAIN_SECTIONS.map((s: any) => (
            <div key={s.id} className="space-y-2">
              <div className="px-4 text-[10px] font-black text-white/20 uppercase tracking-widest">{s.label}</div>
              {s.subItems ? s.subItems.map((sub: any) => (
                <button key={sub.id} onClick={() => { setCurrentSection(sub.id as any); setShowFullContract(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all", currentSection === sub.id ? "bg-[#D4A373] text-white shadow-lg shadow-[#D4A373]/20" : "text-white/40 hover:text-white hover:bg-white/5")}>
                  <sub.icon className="w-4 h-4" /><span>{sub.label}</span>
                </button>
              )) : (
                <button onClick={() => { setCurrentSection(s.id as any); setShowFullContract(false); if(s.id === 'TOOL' && !editingBudgetId) resetTool(); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all", currentSection === s.id ? "bg-[#D4A373] text-white shadow-lg shadow-[#D4A373]/20" : "text-white/40 hover:text-white hover:bg-white/5")}>
                  <s.icon className="w-4 h-4" /><span>{s.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <ShareModal />
        <Modal isOpen={!!modalItem} onClose={() => setModalItem(null)} item={modalItem} />
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
             <h2 className="text-2xl font-black text-[#2B343B] font-display">
               {currentSection === 'CONTRATO_VIEW' ? 'Contrato de Evento' : 
                MAIN_SECTIONS.find(s => s.id === currentSection)?.label || 'Painel de Gestão'}
             </h2>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Salão Imperial Premium</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-2 pr-4 rounded-full border">
             <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center text-white shadow-md shadow-[#D4A373]/30"><UserCircle className="w-6 h-6" /></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Acesso</p>
                <p className="text-xs font-bold text-[#2B343B]">Administrador</p>
             </div>
          </div>
        </header>
        {currentSection === 'DASHBOARD' && renderDashboard()}
        {currentSection === 'ORCAMENTOS' && renderBudgets()}
        {currentSection === 'LEADS' && renderLeads()}
        {currentSection === 'CATALOG_EDIT' && renderCatalogEdit()}
        {currentSection === 'CONTRATO_VIEW' && renderContractView()}
        {currentSection === 'TOOL' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 mb-10 bg-white p-2 rounded-2xl border shadow-sm overflow-x-auto scrollbar-hide">
              {BUDGET_STEPS.map(s => {
                const isStepActive = activeStep === s.id;
                const stepTotal = resumoFinanceiro.porCategoria[s.id] || 0;
                return (
                  <button key={s.id} onClick={() => { setActiveStep(s.id); setShowFullContract(false); }} className={cn("flex flex-col items-center min-w-[120px] px-4 py-3 rounded-xl transition-all", isStepActive ? "bg-[#2B343B] text-white shadow-xl" : "text-gray-400 hover:bg-gray-50")}>
                    <div className="flex items-center gap-2">
                       <s.icon className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{s.label.split('. ')[1] || s.label}</span>
                    </div>
                    {stepTotal > 0 && <span className="text-[9px] font-bold text-[#D4A373] mt-1">{formatCurrency(stepTotal)}</span>}
                  </button>
                );
              })}
            </div>
            {renderToolStep()}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
              <Button variant="outline" onClick={() => { const idx = BUDGET_STEPS.findIndex(s=>s.id===activeStep); if(idx>0) { setActiveStep(BUDGET_STEPS[idx-1].id); setShowFullContract(false); } }} disabled={activeStep === 'CADASTRO'} className="gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</Button>
              {activeStep !== 'AJUSTES' && <Button onClick={() => { const idx = BUDGET_STEPS.findIndex(s=>s.id===activeStep); if(idx<BUDGET_STEPS.length-1) { setActiveStep(BUDGET_STEPS[idx+1].id); setShowFullContract(false); } }} className="gap-2 bg-[#2B343B] text-white">Próximo <ChevronRight className="w-4 h-4" /></Button>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
