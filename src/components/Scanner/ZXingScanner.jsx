import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import useStore from '../../store/useStore';
import './Scanner.css';

const ZXingScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const { isScanning, setIsScanning, setCameraPermission, cameraPermission } = useStore();
  const lastScanRef = useRef('');
  const scanCooldownRef = useRef(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current || codeReaderRef.current) return;

      console.log('🎥 Starting camera initialization...');
      setInitError(null);

      try {
        codeReaderRef.current = new BrowserMultiFormatReader();
        console.log('📷 Requesting camera devices...');
        
        const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
        console.log('📷 Found devices:', videoInputDevices.length);
        
        if (videoInputDevices.length === 0) {
          throw new Error('No camera devices found');
        }

        const rearCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );

        const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoInputDevices[0].deviceId;
        console.log('📷 Using device:', selectedDeviceId);

        await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const barcode = result.getText();
              
              if (barcode !== lastScanRef.current && !scanCooldownRef.current) {
                console.log('✅ ZXing detected:', barcode);
                lastScanRef.current = barcode;
                scanCooldownRef.current = true;
                
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }
                
                if (onScan) {
                  onScan(barcode);
                }
                
                setTimeout(() => {
                  scanCooldownRef.current = false;
                  lastScanRef.current = '';
                }, 2000);
              }
            }
          }
        );

        console.log('✅ Camera initialized successfully');
        setCameraPermission('granted');
        setIsScanning(true);
      } catch (err) {
        console.error('❌ Scanner initialization error:', err);
        setInitError(err.message);
        setCameraPermission('denied');
      }
    };

    if (isScanning) {
      initScanner();
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [isScanning, onScan, setCameraPermission, setIsScanning]);

  if (cameraPermission === 'denied') {
    return (
      <div className="scanner-permission-denied">
        <div className="permission-icon">📷</div>
        <h3>Camera Access Required</h3>
        <p>Please enable camera access in your browser settings to scan barcodes.</p>
        
        {initError && (
          <p style={{ color: '#e53e3e', fontSize: '14px', margin: '1rem 0' }}>
            Error: {initError}
          </p>
        )}
        
        <button 
          className="btn-primary"
          onClick={() => {
            setCameraPermission('prompt');
            window.location.reload();
          }}
        >
          Retry
        </button>
        
        <p style={{ margin: '1rem 0 0.5rem', color: '#718096', fontSize: '14px' }}>
          Or upload an image:
        </p>
        
        <label 
          htmlFor="image-upload-denied" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '16px',
            fontWeight: 500,
            color: '#667eea'
          }}
        >
          📷 Upload Image
          <input
            id="image-upload-denied"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    const codeReader = new BrowserMultiFormatReader();
                    const result = await codeReader.decodeFromImageUrl(event.target.result);
                    if (result && onScan) {
                      onScan(result.getText());
                    }
                  } catch (err) {
                    console.error('Failed to scan image:', err);
                    alert('No barcode detected in image');
                  }
                };
                reader.readAsDataURL(file);
              } catch (err) {
                console.error('Error reading file:', err);
              }
            }}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="barcode-scanner-container">
      <video 
        ref={videoRef} 
        className="scanner-viewport"
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <div className="scanner-overlay">
        <div className="scanner-frame">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          <div className="scan-line"></div>
        </div>
      </div>
      <p className="scanner-hint">
        {cameraPermission === 'prompt' ? 'Please allow camera access...' : 'Position barcode within the frame'}
      </p>
      
      <label 
        htmlFor="image-upload" 
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10,
          fontSize: '24px'
        }}
      >
        📷
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            try {
              const reader = new FileReader();
              reader.onload = async (event) => {
                try {
                  const codeReader = new BrowserMultiFormatReader();
                  const result = await codeReader.decodeFromImageUrl(event.target.result);
                  if (result && onScan) {
                    onScan(result.getText());
                  }
                } catch (err) {
                  console.error('Failed to scan image:', err);
                  alert('No barcode detected in image');
                }
              };
              reader.readAsDataURL(file);
            } catch (err) {
              console.error('Error reading file:', err);
            }
          }}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default ZXingScanner;