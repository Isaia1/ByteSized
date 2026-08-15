import { CameraView, CameraViewProps } from 'expo-camera';
import React from 'react';
import { StyleSheet } from 'react-native';

const BARCODE_TYPES: CameraViewProps['barcodeScannerSettings'] = {
  barcodeTypes: [
    'ean13',
    'ean8',
    'upc_a',
    'upc_e',
    'itf14',
    'code128',
    'code39',
    'code93',
    'codabar',
    'qr',
    'pdf417',
    'datamatrix',
    'aztec',
  ],
};

interface BarcodeCameraProps {
  active: boolean;
  scanned: boolean;
  onBarcodeScanned: NonNullable<CameraViewProps['onBarcodeScanned']>;
}

export function BarcodeCamera({ active, scanned, onBarcodeScanned }: BarcodeCameraProps) {
  if (!active) {
    return null;
  }

  return (
    <CameraView
      style={StyleSheet.absoluteFillObject}
      facing="back"
      barcodeScannerSettings={BARCODE_TYPES}
      onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
    />
  );
}
