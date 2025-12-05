import { useEffect, useState, useCallback } from 'react';
import { getDashboardData } from '../../services/firebaseService';
import useStore from '../../store/useStore';
import warehouseHero from '../../assets/images/warehouse-robots.jpg';
import './Dashboard.css';

const DashboardView = () => {
  const [loading, setLoading] = useState(true);
  const { dashboardData, setDashboardData, recentTransactions, setRecentTransactions, topProducts, setTopProducts } = useStore();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      setDashboardData({
        totalProducts: data.totalProducts,
        totalUnits: data.totalUnits,
        productsWithStock: data.productsWithStock,
        lowStockCount: data.lowStockCount
      });
      setRecentTransactions(data.recentTransactions || []);
      setTopProducts(data.topProducts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [setDashboardData, setRecentTransactions, setTopProducts]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'receive': return '📥';
      case 'remove': return '📤';
      case 'consult': return '🔍';
      default: return '•';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'receive': return 'badge-receive';
      case 'remove': return 'badge-remove';
      case 'consult': return 'badge-consult';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-view">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button onClick={loadDashboardData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="hero-banner">
         <img src={warehouseHero} alt="Warehouse Overview" className="hero-image" />
         <div className="hero-overlay"></div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <div className="kpi-value">{dashboardData.totalProducts.toLocaleString()}</div>
            <div className="kpi-label">Total Products</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <div className="kpi-value">{dashboardData.totalUnits.toLocaleString()}</div>
            <div className="kpi-label">Total Units</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <div className="kpi-value">{dashboardData.productsWithStock.toLocaleString()}</div>
            <div className="kpi-label">In Stock</div>
          </div>
        </div>

        <div className="kpi-card alert">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <div className="kpi-value">{dashboardData.lowStockCount.toLocaleString()}</div>
            <div className="kpi-label">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">Top Products by Quantity</h2>
          <div className="top-products-grid">
            {topProducts.map((product, index) => (
              <div key={product.gtin || product.id} className="top-product-card">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h3>{product.productName || 'Unknown Product'}</h3>
                  {product.brand && <p className="product-brand">{product.brand}</p>}
                </div>
                <div className="product-quantity">
                  <span className="quantity-value">{product.currentQuantity}</span>
                  <span className="quantity-label">units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No transactions yet</p>
            <small>Start scanning products to see transactions here</small>
          </div>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {getTypeIcon(transaction.type)}
                </div>
                <div className="transaction-content">
                  <div className="transaction-product">
                    {transaction.productName || 'Unknown Product'}
                  </div>
                  <div className="transaction-meta">
                    <span className={`transaction-badge ${getTypeBadgeClass(transaction.type)}`}>
                      {transaction.type}
                    </span>
                    {transaction.type !== 'consult' && (
                      <span className="transaction-qty">
                        {transaction.quantity} units
                      </span>
                    )}
                  </div>
                </div>
                <div className="transaction-time">
                  {formatTimestamp(transaction.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
