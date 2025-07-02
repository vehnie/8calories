import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import { triggerHapticFeedback } from '@/utils/haptics';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBack = () => {
    triggerHapticFeedback.light();
    router.back();
  };

  const toggleFlash = () => {
    triggerHapticFeedback.light();
    setFlashEnabled(!flashEnabled);
  };

  const toggleCameraFacing = () => {
    triggerHapticFeedback.light();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    triggerHapticFeedback.success();
    
    Alert.alert(
      'Barcode Scanned',
      `Type: ${type}\nData: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'Use This Product',
          onPress: () => {
            // Handle product selection
            console.log('Using product:', data);
            router.back();
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan barcodes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flashEnabled ? 'on' : 'off'}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scanning Area */}
        <View style={styles.scanningArea}>
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={[styles.overlaySection, styles.overlayTop]} />
            
            {/* Middle section with scanning frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanFrame}>
                {/* Corner indicators */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                
                {/* Scanning line animation */}
                <View style={styles.scanLine} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom overlay */}
            <View style={[styles.overlaySection, styles.overlayBottom]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Position barcode in the frame</Text>
          <Text style={styles.instructionsText}>
            Hold your device steady and ensure the barcode is clearly visible
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            {flashEnabled ? (
              <FlashlightOff size={24} color="#ffffff" />
            ) : (
              <Flashlight size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <RotateCcw size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scanningArea: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTop: {
    height: (height - 300) / 2,
  },
  overlayBottom: {
    height: (height - 300) / 2,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 300,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#22c55e',
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#22c55e',
    opacity: 0.8,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 40,
    paddingVertical: 24,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    gap: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});