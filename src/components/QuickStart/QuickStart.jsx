import { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const QuickStart = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const testProducts = [
    {
      gtin: '5000112576009',
      productName: 'Test Product - Coca Cola',
      brand: 'Coca-Cola',
      category: 'Beverages'
    },
    {
      gtin: '4006809087906',
      productName: 'Test Product - Nivea Cream',
      brand: 'Nivea',
      category: 'Personal Care'
    },
    {
      gtin: '8076809514118',
      productName: 'Test Product - Nutella',
      brand: 'Ferrero',
      category: 'Food'
    },
    {
      gtin: '5449000000996',
      productName: 'Test Product - Coca Cola Zero',
      brand: 'Coca-Cola',
      category: 'Beverages'
    },
    {
      gtin: '3017620422003',
      productName: 'Test Product - Nutella 750g',
      brand: 'Ferrero',
      category: 'Food'
    }
  ];

  const addTestData = async () => {
    setLoading(true);
    setStatus('Adding test products...');

    try {
      for (const product of testProducts) {
        await setDoc(doc(db, 'products', product.gtin), product);
        setStatus(`Added: ${product.productName}`);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setStatus('✅ All test products added successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adding products:', error);
      setStatus(`❌ Error: ${error.message || error.toString()}\n\nTry refreshing the page and clicking Setup again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Quick Start Setup</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Add {testProducts.length} test products to your database to start testing the app.
        </p>

        <div style={{ 
          background: '#f7fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#4a5568', textTransform: 'uppercase' }}>
            Test GTINs:
          </h4>
          {testProducts.map(p => (
            <div key={p.gtin} style={{ fontSize: '12px', color: '#718096', marginBottom: '4px', fontFamily: 'monospace' }}>
              {p.gtin} - {p.productName}
            </div>
          ))}
        </div>

        {status && (
          <div style={{
            padding: '0.75rem',
            background: status.includes('✅') ? '#d4edda' : status.includes('❌') ? '#f8d7da' : '#cfe2ff',
            color: status.includes('✅') ? '#155724' : status.includes('❌') ? '#721c24' : '#084298',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '14px',
            whiteSpace: 'pre-wrap'
          }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e2e8f0',
              background: 'white',
              color: '#4a5568',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={addTestData}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Test Products'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
