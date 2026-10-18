/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface Budget {
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
