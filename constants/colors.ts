// Color schemes untuk Light dan Dark Mode

export interface ColorScheme {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Borders & Dividers
  border: string;
  divider: string;
  
  // Primary colors (brand colors - tetap sama)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  error: string;
  errorLight: string;
  warning: string;
  info: string;
  
  // Specific UI elements
  inputBackground: string;
  chipBackground: string;
  chipBackgroundActive: string;
  iconBackground: string;
  
  // Expense/Income colors (tetap sama)
  expense: string;
  expenseLight: string;
  income: string;
  incomeLight: string;
  
  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  // Header
  headerBackground: string;
  headerBorder: string;
  
  // Modal
  modalBackground: string;
  modalOverlay: string;
  
  // Shadow
  shadowColor: string;
}

// Light Mode Colors
export const lightColors: ColorScheme = {
  background: '#f8fafc',
  surface: '#fff',
  card: '#fff',
  
  text: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  
  border: '#e2e8f0',
  divider: '#f1f5f9',
  
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  primaryDark: '#1e40af',
  
  success: '#10b981',
  error: '#ef4444',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  inputBackground: '#f8fafc',
  chipBackground: '#f1f5f9',
  chipBackgroundActive: '#2563eb',
  iconBackground: '#f1f5f9',
  
  expense: '#ef4444',
  expenseLight: '#fee2e2',
  income: '#10b981',
  incomeLight: '#dcfce7',
  
  tabBarBackground: '#fff',
  tabBarBorder: '#f1f5f9',
  tabBarActive: '#2563eb',
  tabBarInactive: '#94a3b8',
  
  headerBackground: '#fff',
  headerBorder: '#f1f5f9',
  
  modalBackground: '#fff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  
  shadowColor: '#000',
};

// Dark Mode Colors
export const darkColors: ColorScheme = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  
  border: '#334155',
  divider: '#1e293b',
  
  primary: '#2563eb',
  primaryLight: '#1e3a8a',
  primaryDark: '#1e40af',
  
  success: '#10b981',
  error: '#ef4444',
  errorLight: '#7f1d1d',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  inputBackground: '#1e293b',
  chipBackground: '#334155',
  chipBackgroundActive: '#2563eb',
  iconBackground: '#334155',
  
  expense: '#ef4444',
  expenseLight: '#7f1d1d',
  income: '#10b981',
  incomeLight: '#064e3b',
  
  tabBarBackground: '#1e293b',
  tabBarBorder: '#334155',
  tabBarActive: '#60a5fa',
  tabBarInactive: '#64748b',
  
  headerBackground: '#1e293b',
  headerBorder: '#334155',
  
  modalBackground: '#1e293b',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  
  shadowColor: '#000',
};

// Helper function untuk get colors berdasarkan mode
export const getColors = (isDark: boolean): ColorScheme => {
  return isDark ? darkColors : lightColors;
};

