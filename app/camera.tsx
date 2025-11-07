// app/camera.tsx (or app/scan.tsx)
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
import React, { useCallback, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  // scanning state
  const [cooldown, setCooldown] = useState(false);
  const [result, setResult] = useState<ScanResult>(null); // holds last scan
  const [showSheet, setShowSheet] = useState(false); // controls modal

  const handleGrant = useCallback(async () => {
    const res = await requestPermission();
    if (!res.granted) {
      // optionally show a toast/prompt to open settings
    }
  }, [requestPermission]);

  const onBarcodeScanned = useCallback(
    async ({ type, data }: { type: string; data: string }) => {
      if (cooldown || !data || data.length < 6) return;

      setCooldown(true);
      setTimeout(() => setCooldown(false), 1200000);
      console.log(`Scanned ${type}: ${data}`);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      // Navigate to the food page with the scanned barcode
      router.push(`/food/${encodeURIComponent(data)}`);
    },
    [cooldown, router]
  );

  const barCodeTypes = useMemo(
    () => SCANNABLE_TYPES as unknown as BarcodeType[],
    []
  );

  // Permissions UI
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

  const closeSheetAndRescan = () => {
    setShowSheet(false);
    // small delay so the camera remounts before it can fire again
    setTimeout(() => setResult(null), 150);
  };

  return (
    <View style={styles.container}>
      {/* Only mount camera when focused and when the sheet is NOT open */}
      {isFocused && !showSheet ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          flash={flash}
          barcodeScannerSettings={{ barcodeTypes: barCodeTypes }}
          onBarcodeScanned={onBarcodeScanned}
          onCameraReady={() => console.log("Scanner ready")}
        />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      {/* Overlay reticle */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.reticle} />
      </View>

      {/* Controls */}
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

      {/* Result sheet (controlled, non-blocking) */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={closeSheetAndRescan}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Barcode detected</Text>
            <Text style={styles.sheetText}>
              {result ? `${result.type.toUpperCase()}: ${result.data}` : ""}
            </Text>

            <View style={styles.sheetRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={closeSheetAndRescan}
              >
                <Text style={styles.secondaryBtnText}>Scan again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  // TODO: navigate to /food/[id] or fetch details here
                  // router.push({ pathname: '/food/[id]', params: { id: result?.data ?? '' } });
                  closeSheetAndRescan();
                }}
              >
                <Text style={styles.primaryBtnText}>Open details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    backgroundColor: "transparent",
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
