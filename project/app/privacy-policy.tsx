import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { triggerHapticFeedback } from '@/utils/haptics';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHapticFeedback.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
        
        <Text style={styles.sectionTitle}>Policy Summary</Text>
        <Text style={styles.paragraph}>
          8Calories is committed to protecting your privacy. This privacy policy explains how we collect, use, and protect your personal information when you use our calorie tracking application.
        </Text>

        <Text style={styles.sectionTitle}>Data We Collect</Text>
        <Text style={styles.paragraph}>
          Personal Data processed for the following purposes:
        </Text>
        
        <View style={styles.dataSection}>
          <Text style={styles.dataTitle}>Device Permissions</Text>
          <Text style={styles.dataItem}>• Camera permission (for barcode scanning, without saving or recording)</Text>
          <Text style={styles.dataItem}>• Storage permission (for data backup and restore)</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.dataTitle}>App Usage Data</Text>
          <Text style={styles.dataItem}>• Food entries and meal logging</Text>
          <Text style={styles.dataItem}>• Profile information (weight, height, age, activity level)</Text>
          <Text style={styles.dataItem}>• App preferences and settings</Text>
          <Text style={styles.dataItem}>• Custom food entries and meal presets</Text>
        </View>

        <Text style={styles.sectionTitle}>How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          Your personal data is used exclusively to provide the core functionality of 8Calories:
        </Text>
        <Text style={styles.bulletPoint}>• Calculate your daily calorie and macro targets</Text>
        <Text style={styles.bulletPoint}>• Track your food intake and nutritional progress</Text>
        <Text style={styles.bulletPoint}>• Store your custom foods and meal presets</Text>
        <Text style={styles.bulletPoint}>• Provide personalized recommendations</Text>

        <Text style={styles.sectionTitle}>Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          All your data is stored locally on your device using secure storage mechanisms. We do not transmit your personal data to external servers or third parties. Your information remains private and under your control.
        </Text>

        <Text style={styles.sectionTitle}>Data Sharing</Text>
        <Text style={styles.paragraph}>
          8Calories does not share, sell, or transmit your personal data to third parties. Your nutritional data, profile information, and usage patterns remain completely private.
        </Text>

        <Text style={styles.sectionTitle}>Your Rights</Text>
        <Text style={styles.paragraph}>
          You have complete control over your data:
        </Text>
        <Text style={styles.bulletPoint}>• Export your data at any time using the built-in export feature</Text>
        <Text style={styles.bulletPoint}>• Delete all app data by uninstalling the application</Text>
        <Text style={styles.bulletPoint}>• Modify or update your profile information at any time</Text>

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this privacy policy or how we handle your data, please contact us at:
        </Text>
        <Text style={styles.contactEmail}>8Calories@gmail.com</Text>

        <Text style={styles.sectionTitle}>Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. Any changes will be reflected in the app with an updated "Last updated" date.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using 8Calories, you agree to the collection and use of information in accordance with this privacy policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  dataSection: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  dataItem: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});