// Zustand store for global state management
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Current scanned product
  currentProduct: null,
  setCurrentProduct: (product) => set({ currentProduct: product }),
  clearCurrentProduct: () => set({ currentProduct: null }),

  // Scan history (last 5 scans)
  scanHistory: [],
  addToScanHistory: (scan) => set((state) => ({
    scanHistory: [scan, ...state.scanHistory].slice(0, 5)
  })),
  clearScanHistory: () => set({ scanHistory: [] }),

  // Current quantity for actions
  quantity: 1,
  setQuantity: (qty) => set({ quantity: Math.max(1, Math.min(100, qty)) }),
  incrementQuantity: () => set((state) => ({ 
    quantity: Math.min(100, state.quantity + 1) 
  })),
  decrementQuantity: () => set((state) => ({ 
    quantity: Math.max(1, state.quantity - 1) 
  })),
  resetQuantity: () => set({ quantity: 1 }),

  // Scanner state
  isScanning: true,
  setIsScanning: (value) => set({ isScanning: value }),
  
  // Camera permission state
  cameraPermission: 'prompt', // 'prompt', 'granted', 'denied'
  setCameraPermission: (status) => set({ cameraPermission: status }),

  // Loading states
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),

  // Error state
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Success message state
  successMessage: null,
  setSuccessMessage: (message) => set({ successMessage: message }),
  clearSuccessMessage: () => set({ successMessage: null }),

  // Dashboard data
  dashboardData: {
    totalProducts: 0,
    totalUnits: 0,
    productsWithStock: 0,
    lowStockCount: 0
  },
  setDashboardData: (data) => set({ dashboardData: data }),

  // Recent transactions
  recentTransactions: [],
  setRecentTransactions: (transactions) => set({ recentTransactions: transactions }),

  // Top products by quantity
  topProducts: [],
  setTopProducts: (products) => set({ topProducts: products }),

  // Active navigation tab
  activeTab: 'scanner',
  setActiveTab: (tab) => set({ activeTab: tab })
}));

export default useStore;
