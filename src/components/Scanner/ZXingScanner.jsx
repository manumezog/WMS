import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import useStore from '../../store/useStore';
import './Scanner.css';

const ZXingScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const { isScanning, setIsScanning, setCameraPermission, cameraPermission } = useStore();
  const lastScanRef = useRef('');
  const scanCooldownRef = useRef(false);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current || codeReaderRef.current) return;

      try {
        // Create a new code reader with barcode format hints
        codeReaderRef.current = new BrowserMultiFormatReader();
        
        // Get available video input devices
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          throw new Error('No camera devices found');
        }

        // Find rear camera (environment facing) if available
        const rearCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );

        const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoInputDevices[0].deviceId;

        // Start decoding from video device
        await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const barcode = result.getText();
              
              // Prevent duplicate scans within 2 seconds
              if (barcode !== lastScanRef.current && !scanCooldownRef.current) {
                console.log('ZXing detected:', barcode, 'Format:', result.getBarcodeFormat());
                lastScanRef.current = barcode;
                scanCooldownRef.current = true;
                
                // Vibrate on successful scan
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }
                
                // Call the onScan callback
                if (onScan) {
                  onScan(barcode);
                }
                
                // Reset cooldown after 2 seconds
                setTimeout(() => {
                  scanCooldownRef.current = false;
                  lastScanRef.current = '';
                }, 2000);
              }
            }
            
            if (err && !(err.name === 'NotFoundException')) {
              console.error('Scan error:', err);
            }
          }
        );

        setCameraPermission('granted');
        setIsScanning(true);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraPermission('denied');
        } else {
          setCameraPermission('denied');
        }
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
      <video 
        ref={videoRef} 
        className="scanner-viewport"
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
      <p className="scanner-hint">Position barcode within the frame</p>
    </div>
  );
};

export default ZXingScanner;
