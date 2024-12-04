import React, { useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  Modal,
  View,
  ScrollView,
  SafeAreaView,
} from "react-native";

export default function PrivacyPolicyButton() {
  const [modalVisible, setModalVisible] = useState(false);

  const policyContent = [
    {
      title: "Overview",
      content:
        "Worldline values the privacy of its users. As such, we are committed to informing our users about what data is accessed by the application and how it is used.",
    },
    {
      title: "Data Access Requirements",
      content: [
        "Photos saved on the user's device",
        "The date, time, and location of your photos",
        "Other photo metadata (aspect ratios, device info, file type)",
      ],
    },
    {
      title: "Permissions",
      content: [
        "Initial photo access permission will be requested on first launch",
        "Access can be modified anytime in device settings",
        "Denying access will limit app functionality",
      ],
    },
    {
      title: "Privacy Guarantees",
      content: [
        "No user data is stored outside your device",
        "Photos and metadata remain private and local",
        "All processing happens locally on your device",
      ],
    },
  ];

  return (
    <>
      <Pressable
        style={styles.buttonContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Privacy Policy</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Privacy Policy</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.scrollView}>
              {policyContent.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {Array.isArray(section.content) ? (
                    section.content.map((item, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.sectionContent}>{section.content}</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={styles.acceptButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.acceptButtonText}>OK</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 95,
    padding: 10,
  },
  buttonText: {
    color: "#91A0B1",
    fontSize: 20,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletDot: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  acceptButton: {
    backgroundColor: "#007AFF",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
