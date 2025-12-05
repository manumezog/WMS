import { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import ZXingScanner from './ZXingScanner';
import ProductCard from './ProductCard';
import ActionPanel from './ActionPanel';
import QuickStart from '../QuickStart/QuickStart';
import useStore from '../../store/useStore';
import { getProductByGtin, getInventoryByGtin } from '../../services/firebaseService';
import './Scanner.css';
import { BrowserMultiFormatReader } from '@zxing/library';

const ScannerView = () => {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showQuickStart, setShowQuickStart] = useState(false);
  
  const { 
    setError, 
    setIsLoading,
    successMessage,
    clearSuccessMessage,
    error,
    clearError,
    addToScanHistory,
    resetQuantity
  } = useStore();

  useEffect(() => {
    // Clear success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        clearSuccessMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleScan = async (gtin) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch product data
      const product = await getProductByGtin(gtin);
      
      if (!product) {
        setError(`Product not found for GTIN: ${gtin}. Please import product data first.`);
        setIsLoading(false);
        // Don't set scannedProduct to null - let user try scanning again
        // Auto-clear error after 4 seconds
        setTimeout(() => {
          clearError();
        }, 4000);
        return;
      }

      // Fetch inventory data
      const inventoryData = await getInventoryByGtin(gtin);
      
      setScannedProduct(product);
      setInventory(inventoryData);
      
      // Add to scan history
      addToScanHistory({
        gtin,
        productName: product.productName,
        timestamp: new Date().toISOString()
      });
      
      // Vibrate on successful scan
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      setError(`Error scanning product: ${err.message}`);
      // Auto-clear error after 4 seconds
      setTimeout(() => {
        clearError();
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
      setManualMode(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const codeReader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      
      if (result) {
        handleScan(result.getText());
      }
    } catch (err) {
      console.error('Failed to scan image:', err);
      setError('No barcode detected in image');
      setTimeout(() => clearError(), 4000);
    }
  };

  const handleRescan = () => {
    setScannedProduct(null);
    setInventory(null);
    resetQuantity();
    clearError();
    clearSuccessMessage();
  };

  const handleActionComplete = async () => {
    // Refresh inventory data
    if (scannedProduct) {
      const updatedInventory = await getInventoryByGtin(scannedProduct.gtin || scannedProduct.id);
      setInventory(updatedInventory);
    }
  };

  return (
    <div className="scanner-view">
      {/* Status Messages */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#22c55e',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out',
          maxWidth: '90%',
          textAlign: 'center',
          fontWeight: 500
        }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out',
          maxWidth: '90%',
          textAlign: 'center',
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* Scanner or Manual Input */}
      {!scannedProduct ? (
        <>
          {!manualMode ? (
            <BarcodeScanner onScan={handleScan} />
          ) : (
            <div style={{
              height: '50vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}>
              <form onSubmit={handleManualSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
                  Enter Barcode Manually
                </h3>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter GTIN/EAN number"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '18px',
                    borderRadius: '12px',
                    border: 'none',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '2px solid white',
                      background: 'transparent',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'white',
                      color: '#667eea',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Scan
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Manual Entry Toggle */}
          <div style={{
            padding: '1rem',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            background: 'white'
          }}>
            <button
              onClick={() => setManualMode(!manualMode)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}
            >
              <span>{manualMode ? '📷' : '⌨️'}</span>
              {manualMode ? 'Use Camera' : 'Manual Entry'}
            </button>
            
            <label
              htmlFor="photo-upload"
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}
            >
              <span>📁</span>
              Upload Photo
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            
            
            <button
              onClick={() => setShowQuickStart(true)}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Add test products to database"
            >
              <span>⚡</span>
              Setup
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Scanned Product Display */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            paddingBottom: '1rem'
          }}>
            <ProductCard product={scannedProduct} inventory={inventory} />
            <ActionPanel 
              product={scannedProduct} 
              onActionComplete={handleActionComplete}
            />
            
            {/* Rescan Button */}
            <div style={{ padding: '0 1rem 100px 1rem' }}>
              <button
                onClick={handleRescan}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: '#667eea',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span>🔄</span> Scan Another Product
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* QuickStart Modal */}
      {showQuickStart && (
        <QuickStart onClose={() => setShowQuickStart(false)} />
      )}
    </div>
  );
};

export default ScannerView;
