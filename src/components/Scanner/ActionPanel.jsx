import { useState } from 'react';
import useStore from '../../store/useStore';
import { updateInventory, recordTransaction, getInventoryByGtin } from '../../services/firebaseService';
import './Scanner.css';

const ActionPanel = ({ product, onActionComplete }) => {
  const { 
    quantity, 
    setQuantity, 
    incrementQuantity, 
    decrementQuantity,
    setIsLoading,
    setError,
    setSuccessMessage,
    resetQuantity
  } = useStore();
  
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultData, setConsultData] = useState(null);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(value);
  };

  const handleAction = async (actionType) => {
    if (!product) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (actionType === 'consult') {
        const inventory = await getInventoryByGtin(product.gtin || product.id);
        setConsultData({
          product,
          inventory
        });
        setShowConsultModal(true);
        
        // Record consult transaction
        await recordTransaction(
          product.gtin || product.id,
          product.productName,
          'consult',
          0
        );
      } else {
        // Update inventory
        const newQuantity = await updateInventory(
          product.gtin || product.id,
          quantity,
          actionType
        );
        
        // Record transaction
        await recordTransaction(
          product.gtin || product.id,
          product.productName,
          actionType,
          quantity
        );
        
        const actionText = actionType === 'receive' ? 'added to' : 'removed from';
        setSuccessMessage(`${quantity} unit${quantity > 1 ? 's' : ''} ${actionText} inventory. New total: ${newQuantity}`);
        
        // Vibrate if available (haptic feedback)
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        
        resetQuantity();
        
        if (onActionComplete) {
          onActionComplete(actionType, newQuantity);
        }
      }
    } catch (error) {
      setError(`Failed to ${actionType}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="action-panel">
        <div className="quantity-section">
          <label className="quantity-label">Quantity</label>
          <div className="quantity-controls">
            <button 
              className="qty-btn minus"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              −
            </button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="100"
            />
            <button 
              className="qty-btn plus"
              onClick={incrementQuantity}
              disabled={quantity >= 100}
            >
              +
            </button>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="action-btn receive"
            onClick={() => handleAction('receive')}
          >
            <span className="action-icon">📥</span>
            <span className="action-text">RECEIVE</span>
          </button>
          
          <button 
            className="action-btn remove"
            onClick={() => handleAction('remove')}
          >
            <span className="action-icon">📤</span>
            <span className="action-text">REMOVE</span>
          </button>
          
          <button 
            className="action-btn consult"
            onClick={() => handleAction('consult')}
          >
            <span className="action-icon">🔍</span>
            <span className="action-text">CONSULT</span>
          </button>
        </div>
      </div>

      {/* Consult Modal */}
      {showConsultModal && consultData && (
        <div className="modal-overlay" onClick={() => setShowConsultModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inventory Status</h3>
              <button 
                className="modal-close"
                onClick={() => setShowConsultModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <h4>{consultData.product.productName}</h4>
              {consultData.product.brand && (
                <p className="modal-brand">{consultData.product.brand}</p>
              )}
              <div className="modal-stock">
                <span className="stock-label">Current Inventory</span>
                <span className="stock-value">
                  {consultData.inventory?.currentQuantity || 0} units
                </span>
              </div>
              <p className="modal-gtin">
                GTIN: {consultData.product.gtin || consultData.product.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionPanel;
