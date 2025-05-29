import { useState, useCallback } from 'react';

interface Product {
  product_name: string;
  quantity?: string;
  serving_quantity?: string;
  product_quantity_unit?: string;
}

interface ProductApiResponse {
  code: string;
  product?: Product;
  status: number;
  status_verbose: string;
}

interface ProductInfo {
  code: string;
  product: Product;
  status: number;
  status_verbose: string;
}

interface UseProductInfoResult {
  productInfo: ProductInfo | null;
  loading: boolean;
  error: string | null;
  fetchProductInfo: (barcode: string) => Promise<void>;
}

export const useProductInfo = (): UseProductInfoResult => {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductInfo = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching product info for barcode:", barcode);
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);

      if (!response.ok) {
        throw new Error('Failed to fetch product information');
      }

      const data: ProductApiResponse = await response.json();
      if (data.status === 1 && data.product) {
        setProductInfo({
          code: data.code,
          product: data.product,
          status: data.status,
          status_verbose: data.status_verbose,
        });
      } else {
        throw new Error(data.status_verbose || 'Product not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProductInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    productInfo,
    loading,
    error,
    fetchProductInfo,
  };
};
