// app/camera.tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Captured = { uri: string } | null;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState<Captured>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto" | "torch">("off");

  const cameraRef = useRef<CameraView>(null);

  const askPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const takePhoto = useCallback(async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      setCaptured({ uri: photo.uri });
    } catch (e) {
      console.warn("takePhoto error:", e);
    }
  }, []);

  const retake = useCallback(() => setCaptured(null), []);
  const toggleFacing = useCallback(
    () => setFacing(facing === "back" ? "front" : "back"),
    [facing]
  );
  const toggleFlash = useCallback(() => {
    setFlash((prev) =>
      prev === "off"
        ? "on"
        : prev === "on"
        ? "auto"
        : prev === "auto"
        ? "torch"
        : "off"
    );
  }, []);

  // Permission flow
  if (!permission)
    return (
      <View style={styles.center}>
        <Text>Loading camera permission…</Text>
      </View>
    );
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>We need camera access</Text>
        <Text style={styles.subtitle}>
          Grant permission to take photos and scan items.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={askPermission}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Preview mode (after capture)
  if (captured) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: captured.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
        <View style={styles.previewBar}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={retake}>
            <Text style={styles.secondaryBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              // TODO: navigate, upload, or analyze the image here
              console.log("Use photo:", captured.uri);
            }}
          >
            <Text style={styles.primaryBtnText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Live camera
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
          <Text style={styles.iconText}>⚡ {flash.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutter} onPress={takePhoto} />

        <TouchableOpacity style={styles.iconBtn} onPress={toggleFacing}>
          <Text style={styles.iconText}>
            ↺ {facing === "back" ? "BACK" : "FRONT"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const R = 78;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 16,
  },
  camera: { flex: 1 },
  bottomBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  shutter: {
    width: R,
    height: R,
    borderRadius: R / 2,
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  iconBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconText: { color: "#fff", fontWeight: "600" },
  preview: { flex: 1, width: "100%", height: "100%" },
  previewBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryBtnText: { color: "#fff", fontWeight: "700" },
});
