// Firebase Firestore service functions
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection references
const productsRef = collection(db, 'products');
const inventoryRef = collection(db, 'inventory');
const transactionsRef = collection(db, 'transactions');

// ============ PRODUCT FUNCTIONS ============

/**
 * Get product by GTIN
 */
export const getProductByGtin = async (gtin) => {
  try {
    const docRef = doc(productsRef, gtin);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Get random product from collection
 */
export const getRandomProduct = async () => {
  try {
    // Get total count first
    const snapshot = await getDocs(query(productsRef, limit(100)));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (products.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  } catch (error) {
    console.error('Error fetching random product:', error);
    throw error;
  }
};

/**
 * Get total products count
 */
export const getProductsCount = async () => {
  try {
    const snapshot = await getCountFromServer(productsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting products count:', error);
    throw error;
  }
};

// ============ INVENTORY FUNCTIONS ============

/**
 * Get inventory for a product
 */
export const getInventoryByGtin = async (gtin) => {
  try {
    const docRef = doc(inventoryRef, gtin);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return { id: gtin, currentQuantity: 0, lastUpdated: null };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

/**
 * Update inventory quantity (receive or remove)
 */
export const updateInventory = async (gtin, quantityChange, type) => {
  try {
    const docRef = doc(inventoryRef, gtin);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentQty = docSnap.data().currentQuantity || 0;
      const newQty = type === 'receive' 
        ? currentQty + quantityChange 
        : Math.max(0, currentQty - quantityChange);
      
      await updateDoc(docRef, {
        currentQuantity: newQty,
        lastUpdated: serverTimestamp()
      });
      
      return newQty;
    } else {
      // Create new inventory record
      const newQty = type === 'receive' ? quantityChange : 0;
      await setDoc(docRef, {
        gtin,
        currentQuantity: newQty,
        lastUpdated: serverTimestamp()
      });
      
      return newQty;
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

/**
 * Get all inventory items with stock
 */
export const getInventoryWithStock = async () => {
  try {
    const q = query(inventoryRef, where('currentQuantity', '>', 0));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching inventory with stock:', error);
    throw error;
  }
};

/**
 * Get random product with stock
 */
export const getRandomInStockProduct = async () => {
  try {
    const inventoryItems = await getInventoryWithStock();
    
    if (inventoryItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * inventoryItems.length);
    const inventoryItem = inventoryItems[randomIndex];
    
    // Get product details
    const product = await getProductByGtin(inventoryItem.gtin);
    
    return product ? { ...product, currentQuantity: inventoryItem.currentQuantity } : null;
  } catch (error) {
    console.error('Error fetching random in-stock product:', error);
    throw error;
  }
};

/**
 * Get top products by quantity
 */
export const getTopProductsByQuantity = async (limitCount = 10) => {
  try {
    const q = query(
      inventoryRef, 
      where('currentQuantity', '>', 0),
      orderBy('currentQuantity', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const inventoryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch product details for each inventory item
    const productsWithQuantity = await Promise.all(
      inventoryItems.map(async (item) => {
        const product = await getProductByGtin(item.gtin);
        return {
          ...product,
          currentQuantity: item.currentQuantity
        };
      })
    );
    
    return productsWithQuantity.filter(p => p.productName);
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Get inventory statistics
 */
export const getInventoryStats = async () => {
  try {
    const snapshot = await getDocs(inventoryRef);
    const items = snapshot.docs.map(doc => doc.data());
    
    const totalUnits = items.reduce((sum, item) => sum + (item.currentQuantity || 0), 0);
    const productsWithStock = items.filter(item => (item.currentQuantity || 0) > 0).length;
    const lowStockCount = items.filter(item => 
      (item.currentQuantity || 0) > 0 && (item.currentQuantity || 0) < 5
    ).length;
    
    return {
      totalUnits,
      productsWithStock,
      lowStockCount
    };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    throw error;
  }
};

// ============ TRANSACTION FUNCTIONS ============

/**
 * Record a transaction
 */
export const recordTransaction = async (gtin, productName, type, quantity) => {
  try {
    const transaction = {
      gtin,
      productName: productName || 'Unknown Product',
      type,
      quantity,
      timestamp: serverTimestamp(),
      userId: 'anonymous' // For future auth integration
    };
    
    const docRef = await addDoc(transactionsRef, transaction);
    return { id: docRef.id, ...transaction };
  } catch (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (limitCount = 20) => {
  try {
    const q = query(
      transactionsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};

/**
 * Get transactions by type
 */
export const getTransactionsByType = async (type, limitCount = 50) => {
  try {
    const q = query(
      transactionsRef,
      where('type', '==', type),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching transactions by type:', error);
    throw error;
  }
};

// ============ DASHBOARD FUNCTIONS ============

/**
 * Get all dashboard data
 */
export const getDashboardData = async () => {
  try {
    const [productsCount, inventoryStats, recentTx, topProducts] = await Promise.all([
      getProductsCount(),
      getInventoryStats(),
      getRecentTransactions(20),
      getTopProductsByQuantity(10)
    ]);
    
    return {
      totalProducts: productsCount,
      ...inventoryStats,
      recentTransactions: recentTx,
      topProducts
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
