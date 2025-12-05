import { useState } from 'react';
import JsBarcode from 'jsbarcode';
import { getRandomProduct, getRandomInStockProduct, getProductByGtin } from '../../services/firebaseService';
import './Generator.css';

const GeneratorView = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualGtin, setManualGtin] = useState('');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const generateBarcode = (gtin) => {
    const canvas = document.createElement('canvas');
    
    try {
      // Try EAN13 first (standard for retail products)
      JsBarcode(canvas, gtin, {
        format: 'EAN13',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        margin: 10
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      // If EAN13 fails (e.g. invalid checksum or length), fallback to CODE128
      // CODE128 can encode almost any ASCII string
      try {
        console.warn(`EAN13 generation failed for ${gtin}, falling back to CODE128`);
        JsBarcode(canvas, gtin, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10
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
      
      if (!product) {
        setError('No products found in database');
        return;
      }

      const gtin = product.gtin || product.id;
      const barcodeImage = generateBarcode(gtin);
      
      if (!barcodeImage) {
        setError('Failed to generate barcode image');
        return;
      }

      setBarcodeData({
        product,
        gtin,
        barcodeImage,
        type: 'random'
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomInStock = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await getRandomInStockProduct();
      
      if (!product) {
        setError('No in-stock products found');
        return;
      }

      const gtin = product.gtin || product.id;
      const barcodeImage = generateBarcode(gtin);
      
      if (!barcodeImage) {
        setError('Failed to generate barcode image');
        return;
      }

      setBarcodeData({
        product,
        gtin,
        barcodeImage,
        type: 'in-stock',
        quantity: product.currentQuantity
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    
    if (!manualGtin.trim()) {
      setError('Please enter a GTIN number');
      return;
    }

    // Validate EAN-13 format (13 digits)
    if (!/^\d{13}$/.test(manualGtin.trim())) {
      setError('Invalid GTIN format. Please enter 13 digits');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const gtin = manualGtin.trim();
      const product = await getProductByGtin(gtin);
      
      const barcodeImage = generateBarcode(gtin);
      
      if (!barcodeImage) {
        setError('Failed to generate barcode image');
        return;
      }

      setBarcodeData({
        product: product || { productName: 'Unknown Product', gtin },
        gtin,
        barcodeImage,
        type: 'manual',
        exists: !!product
      });
      
      setManualGtin('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!barcodeData) return;
    
    const link = document.createElement('a');
    link.download = `barcode-${barcodeData.gtin}.png`;
    link.href = barcodeData.barcodeImage;
    link.click();
  };

  const handlePrint = () => {
    if (!barcodeData) return;
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    // Write content to the iframe
    const printDoc = iframe.contentWindow.document;
    printDoc.open();
    printDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${barcodeData.gtin}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            h2 {
              margin: 1rem 0;
              text-align: center;
              font-size: 24px;
            }
            p {
              text-align: center;
              font-size: 16px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <h2>${barcodeData.product.productName}</h2>
          ${barcodeData.product.brand ? `<p><strong>${barcodeData.product.brand}</strong></p>` : ''}
          <img src="${barcodeData.barcodeImage}" alt="Barcode ${barcodeData.gtin}" />
          <p>GTIN: ${barcodeData.gtin}</p>
        </body>
      </html>
    `);
    printDoc.close();

    // Trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print error:', err);
        setError('Printing failed on this device');
      } finally {
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }
    }, 500);
  };

  return (
    <div className="generator-view">
      <div className="generator-header">
        <h1>🏷️ Barcode Generator</h1>
      </div>

      {/* Generation Options */}
      <div className="generator-options">
        <button 
          onClick={handleRandomProduct}
          disabled={loading}
          className="gen-btn primary"
        >
          <span className="btn-icon">🎲</span>
          <span className="btn-text">Random Product</span>
        </button>

        <button 
          onClick={handleRandomInStock}
          disabled={loading}
          className="gen-btn success"
        >
          <span className="btn-icon">📦</span>
          <span className="btn-text">Random In-Stock</span>
        </button>

        <form onSubmit={handleManualGenerate} className="manual-form">
          <input
            type="text"
            value={manualGtin}
            onChange={(e) => setManualGtin(e.target.value)}
            placeholder="Enter 13-digit GTIN"
            className="manual-input"
            maxLength="13"
            pattern="\d{13}"
          />
          <button 
            type="submit"
            disabled={loading}
            className="gen-btn secondary"
            style={{ width: '100%' }}
          >
            <span className="btn-icon">✏️</span>
            <span className="btn-text">Generate</span>
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating barcode...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Barcode Display */}
      {barcodeData && !loading && (
        <div className="barcode-display">
          <div className="barcode-card">
            {/* Product Info */}
            <div className="barcode-product-info">
              <h2 className="barcode-product-name">
                {barcodeData.product.productName}
              </h2>
              
              {barcodeData.product.brand && (
                <p className="barcode-product-brand">{barcodeData.product.brand}</p>
              )}
              
              {barcodeData.type === 'in-stock' && (
                <div className="stock-info">
                  <span className="stock-badge">In Stock</span>
                  <span className="stock-qty">{barcodeData.quantity} units</span>
                </div>
              )}
              
              {barcodeData.type === 'manual' && !barcodeData.exists && (
                <div className="not-found-badge">
                  Product not in database
                </div>
              )}
            </div>

            {/* Barcode Image */}
            <div className="barcode-image-container">
              <img 
                src={barcodeData.barcodeImage} 
                alt={`Barcode ${barcodeData.gtin}`}
                className="barcode-image"
              />
            </div>

            {/* Barcode Actions */}
            <div className="barcode-actions" style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '1.5rem',
              justifyContent: 'center'
            }}>
              <button 
                onClick={handleDownload} 
                className="action-btn" 
                style={{ 
                  flex: 1, 
                  padding: '12px 8px', 
                  fontSize: '12px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span style={{ fontSize: '24px' }}>💾</span>
                <span>Save</span>
              </button>
              
              <button 
                onClick={handlePrint} 
                className="action-btn" 
                style={{ 
                  flex: 1, 
                  padding: '12px 8px', 
                  fontSize: '12px', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span style={{ fontSize: '24px' }}>🖨️</span>
                <span>Print</span>
              </button>
              
              <button 
                onClick={() => setShowFullScreen(true)} 
                className="action-btn" 
                style={{ 
                  flex: 1, 
                  padding: '12px 8px', 
                  fontSize: '12px', 
                  background: '#8b5cf6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span style={{ fontSize: '24px' }}>👁️</span>
                <span>View</span>
              </button>
            </div>

            {/* Additional Product Details */}
            {barcodeData.product.category && (
              <div className="product-details-grid">
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{barcodeData.product.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Full Screen Modal */}
      {showFullScreen && barcodeData && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowFullScreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div 
            className="fullscreen-content" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '20px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowFullScreen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ margin: 0, textAlign: 'center' }}>{barcodeData.product.productName}</h2>
            
            <img 
              src={barcodeData.barcodeImage} 
              alt="Full Screen Barcode"
              style={{
                maxWidth: '100%',
                maxHeight: '50vh',
                objectFit: 'contain'
              }} 
            />
            
            <p style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', margin: 0 }}>
              {barcodeData.gtin}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorView;
