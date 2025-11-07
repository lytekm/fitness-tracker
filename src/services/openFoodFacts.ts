// src/services/openFoodFacts.ts
export type OFFProduct = {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutriments?: Record<string, number>;
    quantity?: string;
    categories?: string;
  };
  status?: number;   // 1 found, 0 not found
  status_verbose?: string;
};

export async function fetchProduct(barcode: string, fields?: string[]): Promise<OFFProduct> {
  const base = "https://world.openfoodfacts.org/api/v2/product";
  const qs = fields?.length ? `?fields=${encodeURIComponent(fields.join(","))}` : "";
  const url = `${base}/${encodeURIComponent(barcode)}.json${qs}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenFoodFacts error: ${res.status}`);
  return (await res.json()) as OFFProduct;
}
