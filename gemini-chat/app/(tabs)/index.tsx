import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import  generateWithGemini  from "../../geminiClient";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { from: "user" | "ai"; text: string }[]
  >([{ from: "ai", text: "Hey! I’m Gemini. Ask me anything ✨" }]);
  const [loading, setLoading] = useState(false);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

  const animateSendPressIn = () => {
    Animated.spring(sendScale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const animateSendPressOut = () => {
    Animated.spring(sendScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setLoading(true);

    try {
      const aiText = await generateWithGemini(userText);
      setMessages((prev) => [...prev, { from: "ai", text: aiText }]);
    } catch (err: any) {
      console.error("Gemini client error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: `Error from Gemini: ${err?.message ?? String(err)}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#090f1d", "#020617"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <View style={styles.header}>
            <Text style={styles.logoText}>Gemini</Text>
            <Text style={styles.subtitle}>Minimal GenAI Chat</Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            <ScrollView
              style={styles.messages}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((m, index) => (
                <View
                  key={index}
                  style={[
                    styles.bubble,
                    m.from === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      m.from === "user" ? styles.userText : styles.aiText,
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.bubble, styles.aiBubble]}>
                  <View style={styles.typingRow}>
                    <ActivityIndicator size="small" color="#f97316" />
                    <Text
                      style={[
                        styles.bubbleText,
                        styles.aiText,
                        { marginLeft: 8 },
                      ]}
                    >
                      Gemini is thinking...
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Gemini anything..."
                placeholderTextColor="#64748b"
                style={styles.input}
                multiline
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <TouchableOpacity
                  onPress={handleSend}
                  activeOpacity={0.8}
                  style={styles.sendButton}
                  onPressIn={animateSendPressIn}
                  onPressOut={animateSendPressOut}
                >
                  {loading ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <Text style={styles.sendIcon}>➤</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "300",
    color: "#e5e7eb",
    letterSpacing: 3,
    fontFamily: "Georgia",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(15,23,42,0.85)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  messages: {
    flex: 1,
  },
  bubble: {
    maxWidth: "90%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15,23,42,0.95)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Georgia",
  },
  userText: {
    color: "#e5e7eb",
  },
  aiText: {
    color: "#e5e7eb",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.25)",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
});
