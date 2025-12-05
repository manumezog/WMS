import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import useStore from '../../store/useStore';
import { getRandomProduct, getRandomInStockProduct, getProductByGtin } from '../../services/firebaseService';
import warehouseHero from '../../assets/images/warehouse-robots.jpg';
import stockImage from '../../assets/images/warehouse-stock-4.png';
import './Generator.css';

const GeneratorView = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { 
    setIsLoading, 
    setError, 
    setSuccessMessage, 
    isLoading 
  } = useStore();
  
  const barcodeRef = useRef(null);
  const fullscreenRef = useRef(null);

  // Effect to render barcode when data changes
  useEffect(() => {
    if (barcodeData && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeData.gtin, {
          format: "EAN13",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 18,
          margin: 10,
          background: "#ffffff"
        });
      } catch (e) {
        console.warn("EAN13 failed, trying CODE128", e);
        JsBarcode(barcodeRef.current, barcodeData.gtin, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 18,
          margin: 10,
          background: "#ffffff"
        });
      }
    }
  }, [barcodeData]);

  // Effect for fullscreen render
  useEffect(() => {
    if (isFullscreen && barcodeData && fullscreenRef.current) {
       try {
        JsBarcode(fullscreenRef.current, barcodeData.gtin, {
          format: "EAN13",
          width: 4,
          height: 300,
          displayValue: true,
          fontSize: 40,
          background: "#ffffff",
          margin: 40
        });
      } catch (e) {
         JsBarcode(fullscreenRef.current, barcodeData.gtin, {
          format: "CODE128",
          width: 3,
          height: 300,
          displayValue: true,
          background: "#ffffff",
          margin: 40
        });
      }
    }
  }, [isFullscreen, barcodeData]);

  const generateBarcode = (product) => {
    setBarcodeData(product);
    setSuccessMessage(`Generated barcode for ${product.productName}`);
    // Scroll to top to see result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomProduct = async () => {
    setIsLoading(true);
    try {
      const product = await getRandomProduct();
      if (product) {
        generateBarcode(product);
      } else {
        setError('No products found in database');
      }
    } catch (err) {
      setError('Failed to fetch random product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomInStock = async () => {
    setIsLoading(true);
    try {
      const product = await getRandomInStockProduct();
      if (product) {
        generateBarcode(product);
      } else {
        setError('No in-stock products found');
      }
    } catch (err) {
      setError('Failed to fetch in-stock product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    setIsLoading(true);
    try {
      const gtin = manualInput.trim();
      const product = await getProductByGtin(gtin);
      
      if (product) {
        generateBarcode(product);
      } else {
        // Generate temporary object for unknown products
        generateBarcode({
          gtin: gtin,
          productName: 'Custom Barcode',
          brand: 'Manual Entry',
          category: 'N/A'
        });
      }
      setManualInput('');
    } catch (err) {
      setError('Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBarcode = async () => {
    if (!barcodeRef.current) return;
    try {
      const element = document.querySelector('.ticket-card');
      const canvas = await html2canvas(element, { borderRadius: 24, backgroundColor: null });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `barcode-${barcodeData.gtin}.png`;
      link.href = url;
      link.click();
      setSuccessMessage('Barcode image downloaded');
    } catch (err) {
      console.error(err);
      setError('Failed to download image');
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (isFullscreen && barcodeData) {
    return (
      <div className="fullscreen-barcode" onClick={closeFullscreen}>
        <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
          <button className="fullscreen-close" onClick={closeFullscreen}>×</button>
          <div className="fullscreen-canvas-wrapper">
             <canvas ref={fullscreenRef}></canvas>
          </div>
          <div className="fullscreen-info">
            <h2>{barcodeData.productName}</h2>
            <p>{barcodeData.gtin}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generator-view">
      <div className="generator-header">
        <h1>⚡ Generator</h1>
      </div>

      <div className="hero-banner">
         <img src={warehouseHero} alt="Warehouse Generator" className="hero-image" />
         <div className="hero-overlay"></div>
      </div>

      <div className="generator-content">
        
        {/* Result Area */}
        {barcodeData && (
          <div className="result-section">
            <div className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-punch"></span>
              </div>
              <div className="ticket-body">
                <h3>{barcodeData.productName}</h3>
                <p className="ticket-brand">{barcodeData.brand || 'Unknown Brand'}</p>
                <div className="barcode-display">
                  <canvas ref={barcodeRef}></canvas>
                </div>
                <p className="ticket-gtin">{barcodeData.gtin}</p>
              </div>
            </div>
            
            <div className="result-actions">
              <button onClick={() => setIsFullscreen(true)} className="action-pill primary">
                 <span>📱</span> Full Screen
              </button>
              <button onClick={downloadBarcode} className="action-pill secondary">
                 <span>💾</span> Save Image
              </button>
            </div>

            <button className="clear-result-btn" onClick={() => setBarcodeData(null)}>
              Creating New Label...
            </button>
          </div>
        )}

        {/* Feature Cards Grid */}
        {!barcodeData && (
          <div className="feature-grid">
            
            <div className="feature-card primary-gradient" onClick={handleRandomProduct}>
              <div className="card-icon-large">🎲</div>
              <div className="card-content">
                <h3>Random Product</h3>
                <p>Generate from database</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            <div className="feature-card image-bg" onClick={handleRandomInStock} style={{backgroundImage: `url(${stockImage})`}}>
              <div className="card-overlay"></div>
              <div className="card-content">
                <div className="card-icon-large">📦</div>
                <h3>In Stock Only</h3>
                <p>Available inventory</p>
              </div>
            </div>

            <div className="manual-section-card">
              <h3>Manual Entry</h3>
              <form onSubmit={handleManualGenerate} className="manual-form">
                <input
                  type="text"
                  placeholder="Enter GTIN..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="manual-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button type="submit" className="manual-submit-btn" disabled={!manualInput.trim() || isLoading}>
                  GENERATE
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GeneratorView;
