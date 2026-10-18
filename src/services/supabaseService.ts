import { supabase } from '../lib/supabase.ts';
import { CatalogItem, Budget } from '../types/index.ts';

export const supabaseService = {
  async getCatalog() {
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching catalog:', error);
      return null;
    }
    return data as CatalogItem[];
  },

  async saveCatalog(items: CatalogItem[]) {
    // Supabase upsert requires a unique constraint or primary key
    // We'll delete and re-insert or use upsert if IDs are consistent
    const { error } = await supabase
      .from('catalog')
      .upsert(items);

    if (error) {
      console.error('Error saving catalog:', error);
      throw error;
    }
  },

  async getBudgets() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return null;
    }
    return data as Budget[];
  },

  async saveBudget(budget: Budget) {
    const { error } = await supabase
      .from('budgets')
      .upsert(budget);

    if (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
  },

  async deleteBudget(budgetId: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }
};
