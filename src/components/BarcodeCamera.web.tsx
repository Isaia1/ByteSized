import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

interface BarcodeCameraProps {
  active: boolean;
  scanned: boolean;
  onBarcodeScanned: (event: { data: string; type?: string }) => void;
}

export function BarcodeCamera({ active, scanned, onBarcodeScanned }: BarcodeCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (!active || scanned) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    const reader = new BrowserMultiFormatReader();
    let mounted = true;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, _error, controls) => {
        if (controls) {
          controlsRef.current = controls;
        }
        if (!mounted || scanned) {
          controls?.stop();
          return;
        }
        if (result) {
          controls?.stop();
          onBarcodeScanned({
            data: result.getText(),
            type: result.getBarcodeFormat()?.toString(),
          });
        }
      })
      .then((controls) => {
        if (mounted) {
          controlsRef.current = controls;
        }
      })
      .catch(() => {
        // Browser may block camera; manual barcode entry still works.
      });

    return () => {
      mounted = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, scanned, onBarcodeScanned]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <video ref={videoRef} style={videoStyle} muted playsInline />
    </View>
  );
}

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#000',
};
