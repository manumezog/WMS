import { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import ProductCard from './ProductCard';
import ActionPanel from './ActionPanel';
import QuickStart from '../QuickStart/QuickStart';
import useStore from '../../store/useStore';
import { getProductByGtin, getInventoryByGtin } from '../../services/firebaseService';
import './Scanner.css';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

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
    resetQuantity,
    setIsScanning
  } = useStore();

  // Ensure scanning stops when component unmounts
  useEffect(() => {
    setIsScanning(true);
    return () => setIsScanning(false);
  }, [setIsScanning]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => clearSuccessMessage(), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleScan = async (gtin) => {
    // If we already have a product open, ignore new scans until cleared
    if (scannedProduct) return;

    setIsLoading(true);
    setError(null);
    
    try {
      if (navigator.vibrate) navigator.vibrate(50);

      // Fetch product data
      const product = await getProductByGtin(gtin);
      
      if (!product) {
        setError(`Product not found: ${gtin}`);
        setIsLoading(false);
        // Don't set scannedProduct to null - let user try scanning again
        return;
      }

      // Fetch inventory data
      const inventoryData = await getInventoryByGtin(gtin);
      
      setScannedProduct(product);
      setInventory(inventoryData);
      setManualMode(false); // Close manual mode if open
      
      addToScanHistory({
        gtin,
        productName: product.productName,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const hints = new Map();
      const formats = [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        BarcodeFormat.QR_CODE, BarcodeFormat.ITF
      ];
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const codeReader = new BrowserMultiFormatReader(hints);
      const imageUrl = URL.createObjectURL(file);
      
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      
      if (result) {
        handleScan(result.getText());
      }
    } catch (err) {
      console.error('Failed to scan image:', err);
      setError('No barcode detected');
    }
  };

  const handleCloseProduct = () => {
    setScannedProduct(null);
    setInventory(null);
    resetQuantity();
    clearError();
    clearSuccessMessage();
  };

  const handleActionComplete = async () => {
    if (scannedProduct) {
      const updatedInventory = await getInventoryByGtin(scannedProduct.gtin || scannedProduct.id);
      setInventory(updatedInventory);
    }
  };

  return (
    <div className="scanner-view">
      {/* 1. Full Screen Camera Background */}
      <BarcodeScanner onScan={handleScan} />

      {/* 2. Messages/Alerts */}
      {successMessage && (
        <div className="message-pill success">
          <span>✅</span> {successMessage}
        </div>
      )}
      {error && (
        <div className="message-pill error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* 3. Bottom Controls Ribbon (Visible when no product is selected) */}
      {!scannedProduct && (
        <div className="scanner-controls-ribbon">
          <button className="control-btn" onClick={() => setManualMode(true)}>
            <span className="btn-icon">⌨️</span>
            <span className="btn-label">Enter Code</span>
          </button>
          
          <label className="control-btn">
            <span className="btn-icon">📁</span>
            <span className="btn-label">Upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>

          <button className="control-btn" onClick={() => setShowQuickStart(true)}>
            <span className="btn-icon">⚡</span>
            <span className="btn-label">Setup</span>
          </button>
        </div>
      )}

      {/* 4. Manual Entry Modal */}
      {manualMode && (
        <div className="manual-entry-overlay" onClick={() => setManualMode(false)}>
          <div className="manual-entry-card" onClick={e => e.stopPropagation()}>
            <h3>Enter Barcode</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="manual-input-large"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="123456789"
                autoFocus
              />
              <div className="manual-actions">
                <button type="button" className="action-btn remove" onClick={() => setManualMode(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn receive">
                  Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Product Result Overlay (Slide up) */}
      {scannedProduct && (
        <div className="product-result-overlay">
          <div className="result-content">
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '5px', background: '#cbd5e1', borderRadius: '3px' }}></div>
             </div>
            <ProductCard product={scannedProduct} inventory={inventory} />
            <ActionPanel 
              product={scannedProduct} 
              onActionComplete={handleActionComplete}
            />
            <button 
              className="action-btn remove" 
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={handleCloseProduct}
            >
              Scan Next Product
            </button>
          </div>
        </div>
      )}

      {/* QuickStart Modal */}
      {showQuickStart && (
         <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
             <QuickStart onClose={() => setShowQuickStart(false)} />
         </div>
      )}
    </div>
  );
};

export default ScannerView;
