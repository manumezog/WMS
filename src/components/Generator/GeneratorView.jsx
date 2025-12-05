import { useState } from 'react';
import JsBarcode from 'jsbarcode';
import { getRandomProduct, getRandomInStockProduct, getProductByGtin } from '../../services/firebaseService';
import './Generator.css';

const GeneratorView = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualGtin, setManualGtin] = useState('');

  const generateBarcode = (gtin) => {
    try {
      const canvas = document.createElement('canvas');
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
      console.error('Barcode generation error:', err);
      return null;
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
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
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
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h2 {
              margin: 1rem 0;
            }
            @media print {
              body {
                padding: 20px;
              }
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
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
            <div className="barcode-actions">
              <button onClick={handleDownload} className="action-btn download">
                <span>💾</span> Download
              </button>
              <button onClick={handlePrint} className="action-btn print">
                <span>🖨️</span> Print
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
    </div>
  );
};

export default GeneratorView;
