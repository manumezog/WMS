import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import useStore from '../../store/useStore';
import './Scanner.css';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isScanning, setIsScanning, setCameraPermission, cameraPermission } = useStore();

  useEffect(() => {
    const initScanner = async () => {
      if (!scannerRef.current || html5QrCodeRef.current) return;

      try {
        html5QrCodeRef.current = new Html5Qrcode("barcode-scanner");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          // Supported formats: ALL (by not specifying formatsToSupport)
        };

        // Use 'environment' for rear camera on mobile
        const cameraConfig = { facingMode: "environment" };

        await html5QrCodeRef.current.start(
          cameraConfig,
          config,
          (decodedText) => {
            if (onScan) {
              onScan(decodedText);
            }
          },
          () => {
            // Scan error - ignore
          }
        );

        console.log('✅ Camera started successfully');
        setCameraPermission('granted');
        setIsInitialized(true);
      } catch (err) {
        console.error('❌ Scanner initialization error:', err);
        if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
          setCameraPermission('denied');
        }
      }
    };

    if (isScanning) {
      initScanner();
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, onScan, setCameraPermission]);

  if (cameraPermission === 'denied') {
    return (
      <div className="scanner-permission-denied">
        <div className="permission-icon">📷</div>
        <h3>Camera Access Required</h3>
        <p>Please enable camera access in your browser settings to scan barcodes.</p>
        <button 
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="barcode-scanner-container">
      <div id="barcode-scanner" ref={scannerRef} className="scanner-viewport"></div>
      <div className="scanner-overlay">
        <div className="scanner-frame">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          <div className="scan-line"></div>
        </div>
      </div>
      <p className="scanner-hint">Position barcode within the frame</p>
    </div>
  );
};

export default BarcodeScanner;
