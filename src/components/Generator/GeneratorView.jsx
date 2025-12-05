import { useState } from 'react';
import JsBarcode from 'jsbarcode';
import { getRandomProduct, getRandomInStockProduct, getProductByGtin } from '../../services/firebaseService';
import './Generator.css';

// Import assets
import bgStock1 from '../../assets/images/warehouse-stock-1.png';
import bgStock2 from '../../assets/images/warehouse-stock-2.png';
import bgStock3 from '../../assets/images/warehouse-stock-3.jpg';

const GeneratorView = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualGtin, setManualGtin] = useState('');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const generateBarcode = (gtin) => {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, gtin, {
        format: 'EAN13',
        width: 3,
        height: 120,
        displayValue: true,
        fontSize: 18,
        margin: 10,
        background: '#ffffff'
      });
      return canvas.toDataURL('image/png');
    } catch {
      try {
        console.warn(`EAN13 generation failed for ${gtin}, falling back to CODE128`);
        JsBarcode(canvas, gtin, {
          format: 'CODE128',
          width: 3,
          height: 120,
          displayValue: true,
          fontSize: 18,
          margin: 10,
          background: '#ffffff'
        });
        return canvas.toDataURL('image/png');
      } catch (err2) {
        console.error('Barcode generation error:', err2);
        return null;
      }
    }
  };

  const handleRandomProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const product = await getRandomProduct();
      if (!product) { setError('No products found'); return; }
      updateBarcodeState(product, product.gtin || product.id, 'random');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleRandomInStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const product = await getRandomInStockProduct();
      if (!product) { setError('No in-stock products found'); return; }
      updateBarcodeState(product, product.gtin || product.id, 'in-stock', product.currentQuantity);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const updateBarcodeState = (product, gtin, type, quantity = 0) => {
    const barcodeImage = generateBarcode(gtin);
    if (!barcodeImage) { setError('Failed to generate barcode'); return; }
    
    setBarcodeData({
      product,
      gtin,
      barcodeImage,
      type,
      quantity
    });
    
    // Auto-scroll to result
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    if (!manualGtin.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const gtin = manualGtin.trim();
      const product = await getProductByGtin(gtin);
      
      const barcodeDataObj = {
          product: product || { productName: 'Manual Entry Product', gtin },
          gtin,
          type: 'manual',
          exists: !!product
      };
      
      updateBarcodeState(barcodeDataObj.product, gtin, 'manual');
      setManualGtin('');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="generator-view">
      <div className="generator-header">
        <h1>Barcode Tools</h1>
        <p className="subtitle">Generate & Print Labels</p>
      </div>

      <div className="feature-grid">
        {/* Random Product Card */}
        <button 
          className="feature-card" 
          onClick={handleRandomProduct} 
          disabled={loading}
          style={{ backgroundImage: `url(${bgStock1})` }}
        >
          <div className="card-overlay"></div>
          <div className="card-content">
            <span className="card-icon">🎲</span>
            <h3>Random Product</h3>
            <p>Generate barcode for any database item</p>
          </div>
        </button>

        {/* In-Stock Product Card */}
        <button 
          className="feature-card" 
          onClick={handleRandomInStock} 
          disabled={loading}
          style={{ backgroundImage: `url(${bgStock2})` }}
        >
          <div className="card-overlay success"></div>
          <div className="card-content">
            <span className="card-icon">📦</span>
            <h3>In-Stock Only</h3>
            <p>Generate for available inventory</p>
          </div>
        </button>
      </div>

      {/* Manual Entry Section */}
      <div className="manual-section">
        <div className="manual-card">
           <div className="manual-header">
             <span className="icon">⌨️</span>
             <h3>Manual Entry</h3>
           </div>
           <form onSubmit={handleManualGenerate} className="manual-form-row">
             <input
                type="text"
                value={manualGtin}
                onChange={(e) => setManualGtin(e.target.value)}
                placeholder="Enter GTIN..."
                className="manual-input-modern"
             />
             <button type="submit" className="manual-btn-modern" disabled={loading}>
                Generate
             </button>
           </form>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && <div className="loading-spinner"></div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Result Card */}
      {barcodeData && (
        <div id="result-section" className="result-container">
          <div className="barcode-ticket">
            {/* Ticket Header */}
             <div className="ticket-header">
                <h2>{barcodeData.product.productName}</h2>
                {barcodeData.type === 'in-stock' && (
                    <span className="ticket-badge success">In Stock: {barcodeData.quantity}</span>
                )}
             </div>

            {/* Generated Image */}
            <div className="ticket-body">
               <img src={barcodeData.barcodeImage} alt="Barcode" className="generated-barcode" />
               <div className="gtin-display">{barcodeData.gtin}</div>
            </div>

            {/* Actions */}
            <div className="ticket-actions">
               <button className="icon-btn" onClick={() => setShowFullScreen(true)} title="View Fullscreen">
                  👁️ View
               </button>
               <button className="icon-btn primary" title="Print Label">
                  🖨️ Print
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      {showFullScreen && barcodeData && (
        <div className="fullscreen-modal" onClick={() => setShowFullScreen(false)}>
            <div className="fullscreen-barcode-container">
               <img src={barcodeData.barcodeImage} alt="Fullscreen Barcode" />
               <p>{barcodeData.gtin}</p>
               <h1>{barcodeData.product.productName}</h1>
            </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorView;
