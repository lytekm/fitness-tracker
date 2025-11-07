// app/food/[id].tsx
import { fetchProduct, type OFFProduct } from "@/src/services/openFoodFacts";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function FoodDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<OFFProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Pick a small field set for speed
  const fields = useMemo(
    () => [
      "code",
      "product_name",
      "brands",
      "image_url",
      "nutriscore_grade",
      "nutriments",
      "quantity",
      "categories",
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchProduct(String(id), fields);
        if (!isMounted) return;
        setData(res);
      } catch (e: any) {
        if (!isMounted) return;
        setErr(e?.message ?? "Failed to load product");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id, fields]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Fetching product {id}…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Couldn’t load product</Text>
        <Text style={styles.muted}>{err}</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          Go back
        </Text>
      </View>
    );
  }

  const p = data?.product;
  const nutr = p?.nutriments ?? {};
  const kcalPer100 =
    nutr["energy-kcal_100g"] ?? nutr["energy-kcal"] ?? nutr["energy_100g"];
  const proteinPer100 = nutr["proteins_100g"];
  const sugarPer100 = nutr["sugars_100g"];
  const fatPer100 = nutr["fat_100g"];

  // A super-simple placeholder health score (replace with your real formula later)
  const healthScore = (() => {
    let score = 50;
    if (typeof proteinPer100 === "number")
      score += Math.min(proteinPer100, 20) * 1.5; // reward protein up to 20g
    if (typeof sugarPer100 === "number")
      score -= Math.min(sugarPer100, 20) * 1.2; // penalize sugar up to 20g
    if (typeof fatPer100 === "number")
      score -= Math.max(0, fatPer100 - 10) * 0.8; // light penalty above 10g fat
    return Math.max(0, Math.min(100, Math.round(score)));
  })();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{p?.product_name ?? "Unknown product"}</Text>
      <Text style={styles.muted}>
        {p?.brands ? `Brand: ${p.brands}` : "Brand: -"}
        {p?.quantity ? `   •   ${p.quantity}` : ""}
      </Text>

      {p?.image_url ? (
        <Image
          source={{ uri: p.image_url }}
          style={styles.hero}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.hero, styles.heroMissing]}>
          <Text style={styles.muted}>No image</Text>
        </View>
      )}

      <View style={styles.cardRow}>
        <Stat label="Health score" value={String(healthScore)} big />
        <Stat
          label="Nutri-Score"
          value={p?.nutriscore_grade?.toUpperCase() ?? "-"}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Per 100g</Text>
        <Row
          label="Calories"
          value={kcalPer100 ? `${Math.round(kcalPer100)} kcal` : "-"}
        />
        <Row
          label="Protein"
          value={proteinPer100 ? `${proteinPer100} g` : "-"}
        />
        <Row label="Sugar" value={sugarPer100 ? `${sugarPer100} g` : "-"} />
        <Row label="Fat" value={fatPer100 ? `${fatPer100} g` : "-"} />
      </View>

      {p?.categories ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Categories</Text>
          <Text style={styles.body}>{p.categories}</Text>
        </View>
      ) : null}

      <Text style={styles.link} onPress={() => router.back()}>
        ← Scan another
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.bodyLabel}>{label}</Text>
      <Text style={styles.bodyValue}>{value}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <View style={[styles.card, { flex: 1 }]}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={[styles.statValue, big && { fontSize: 28 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#fff" },
  muted: { color: "#bbb" },
  link: { color: "#7c7cff", marginTop: 12 },
  hero: {
    width: "100%",
    height: 220,
    backgroundColor: "#111",
    borderRadius: 12,
  },
  heroMissing: { alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: "#121212",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardRow: { flexDirection: "row", gap: 12 },
  cardTitle: { color: "#ddd", fontWeight: "600", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  body: { color: "#ddd" },
  bodyLabel: { color: "#ccc" },
  bodyValue: { color: "#fff", fontWeight: "600" },
  statValue: { color: "#fff", fontWeight: "800", fontSize: 22 },
});
