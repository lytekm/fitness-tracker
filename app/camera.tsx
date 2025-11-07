import { useIsFocused } from "@react-navigation/native";
import {
  BarcodeType,
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SCANNABLE_TYPES = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "code93",
  "itf14",
  "qr",
] as const;

type ScanResult = { type: string; data: string } | null;

export default function BarcodeScannerScreen() {
  const isFocused = useIsFocused();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");

  // hard gating
  const [scanning, setScanning] = useState(true); // attach/detach handler
  const handlingRef = useRef(false); // instant guard, no re-render
  const lastScanTsRef = useRef(0); // optional throttle
  const [result, setResult] = useState<ScanResult>(null);
  const [showSheet, setShowSheet] = useState(false);

  const barCodeTypes = useMemo(
    () => SCANNABLE_TYPES as unknown as BarcodeType[],
    []
  );

  const handleGrant = useCallback(async () => {
    const res = await requestPermission();
    // optionally prompt to open settings if not granted
  }, [requestPermission]);

  const onBarcodeScanned = useCallback(
    async ({ type, data }: { type: string; data: string }) => {
      // 1) Hard, instant gate (prevents multi-fire before a render)
      if (handlingRef.current) return;

      // 2) Optional: timestamp throttle
      const now = Date.now();
      if (now - lastScanTsRef.current < 1200) return;
      lastScanTsRef.current = now;

      // 3) Basic sanity
      if (!data || data.length < 6) return;

      // 4) Lock and pause scanning BEFORE any async work
      handlingRef.current = true;
      setScanning(false);

      try {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch {}

        setResult({ type, data });
        setShowSheet(true);

        // If you want to navigate instead of a sheet, do it here,
        // then keep scanning disabled until you come back:
        router.push(`/food/${encodeURIComponent(data)}`);
      } finally {
        // don’t unlock here; we’ll unlock when user closes the sheet
      }
    },
    []
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Checking permissions…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>We need camera access</Text>
        <Text style={styles.muted}>Grant permission to scan barcodes.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleGrant}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () =>
    setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"));
  const flipFacing = () =>
    setFacing((cur) => (cur === "back" ? "front" : "back"));

  return (
    <View style={styles.container}>
      {isFocused && !showSheet ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          flash={flash}
          barcodeScannerSettings={{ barcodeTypes: barCodeTypes }}
          // 👇 Only attach the handler when scanning is enabled
          onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
          onCameraReady={() => console.log("Scanner ready")}
        />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      {/* Overlay + controls (unchanged) */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.reticle} />
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
          <Text style={styles.iconText}>⚡ {flash.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={flipFacing}>
          <Text style={styles.iconText}>
            ↺ {facing === "back" ? "BACK" : "FRONT"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* styles … keep yours */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  title: { fontSize: 18, color: "#fff", marginBottom: 8 },
  muted: { color: "#bbb", textAlign: "center", marginBottom: 12 },
  camera: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  cameraPlaceholder: { flex: 1, backgroundColor: "#000" },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 260,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },
  bottomBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  iconText: { color: "#fff", fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  sheetText: { color: "#ddd", marginBottom: 16 },
  sheetRow: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
  },
  secondaryBtnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
