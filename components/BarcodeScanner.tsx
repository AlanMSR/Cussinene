import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '@/contexts/ThemeContext';
import { useProductInfo } from '@/hooks/useProductInfo';
import LoadingScreen from './LoadingScreen';

interface BarcodeScannerProps {
  onClose: () => void;
  onProductFound: (product: {
    name: string;
    quantity?: string;
    unit?: string;
  }) => void;
}

export default function BarcodeScanner({ onClose, onProductFound }: BarcodeScannerProps) {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { productInfo, loading, error, fetchProductInfo } = useProductInfo();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    await fetchProductInfo(data);
  };

  useEffect(() => {
    if (!scanned) return;
    console.log('Product Info:', productInfo);
    if (productInfo && productInfo.product) {
      // const quantity = productInfo.product.quantity || '';
      // const numericQuantity = quantity.match(/\d+/)?.[0] || '';
      // const unit = quantity.replace(/\d+/g, '').trim();

      onProductFound({
        name: productInfo.product.product_name,
        quantity: productInfo.product.serving_quantity,
        unit: productInfo.product.product_quantity_unit,
      });
    } else if (productInfo && productInfo.status === 0) {
      Alert.alert(
        'Product Not Found',
        'Could not find product information for this barcode.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }, [productInfo, scanned]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }, [error]);

  if (hasPermission === null) {
    return <LoadingScreen message="Requesting camera permission..." />;
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>
          No access to camera
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: colors.textWhite }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen message="Fetching product information..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={[styles.instruction, { color: colors.textWhite }]}>
          Position the barcode within the frame
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onClose}
      >
        <Text style={[styles.buttonText, { color: colors.textWhite }]}>
          Close
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  instruction: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
});
