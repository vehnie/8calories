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

export default function LicensesScreen() {
  const router = useRouter();

  const licenses = [
    {
      name: '8Calories',
      version: '1.0.0',
      license: 'GPL-3.0',
      description: 'Main application license',
      url: 'https://www.gnu.org/licenses/gpl-3.0.html'
    },
    {
      name: 'React Native',
      version: '^0.74.0',
      license: 'MIT',
      description: 'A framework for building native apps using React',
      url: 'https://github.com/facebook/react-native/blob/main/LICENSE'
    },
    {
      name: 'Expo',
      version: '^53.0.0',
      license: 'MIT',
      description: 'Platform for making universal native apps',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'React',
      version: '^18.2.0',
      license: 'MIT',
      description: 'A JavaScript library for building user interfaces',
      url: 'https://github.com/facebook/react/blob/main/LICENSE'
    },
    {
      name: 'Lucide React Native',
      version: '^0.447.0',
      license: 'ISC',
      description: 'Beautiful & consistent icon toolkit',
      url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE'
    },
    {
      name: 'React Navigation',
      version: '^7.0.14',
      license: 'MIT',
      description: 'Routing and navigation for React Native apps',
      url: 'https://github.com/react-navigation/react-navigation/blob/main/packages/core/LICENSE'
    },
    {
      name: 'Expo Router',
      version: '^4.0.0',
      license: 'MIT',
      description: 'File-based router for universal React Native apps',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'AsyncStorage',
      version: '^2.1.0',
      license: 'MIT',
      description: 'Asynchronous, persistent, key-value storage system',
      url: 'https://github.com/react-native-async-storage/async-storage/blob/main/LICENSE'
    },
    {
      name: 'Expo Camera',
      version: '^16.1.5',
      license: 'MIT',
      description: 'Camera component for Expo applications',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'Expo File System',
      version: '^18.1.3',
      license: 'MIT',
      description: 'File system utilities for Expo applications',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'Expo Document Picker',
      version: '^12.1.2',
      license: 'MIT',
      description: 'Document picker for Expo applications',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'Expo Sharing',
      version: '^12.1.1',
      license: 'MIT',
      description: 'Sharing utilities for Expo applications',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    },
    {
      name: 'Expo Haptics',
      version: '^13.1.1',
      license: 'MIT',
      description: 'Haptic feedback for Expo applications',
      url: 'https://github.com/expo/expo/blob/main/LICENSE'
    }
  ];

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
        <Text style={styles.headerTitle}>Open Source Licenses</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          8Calories is built with the help of these amazing open source projects. We are grateful to the developers and contributors who make these tools available.
        </Text>

        {licenses.map((license, index) => (
          <View key={index} style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseName}>{license.name}</Text>
              <Text style={styles.licenseVersion}>{license.version}</Text>
            </View>
            <Text style={styles.licenseDescription}>{license.description}</Text>
            <View style={styles.licenseFooter}>
              <Text style={styles.licenseType}>{license.license} License</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>License Information</Text>
          <Text style={styles.footerText}>
            • MIT License: Permits commercial use, modification, distribution, and private use{"\n"}
            • GPL-3.0 License: Copyleft license that requires derivative works to be open source{"\n"}
            • ISC License: Functionally equivalent to MIT License
          </Text>
          
          <Text style={styles.footerNote}>
            For complete license texts and terms, please visit the respective project repositories or license URLs.
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
  description: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  licenseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  licenseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    flex: 1,
  },
  licenseVersion: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  licenseDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  licenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licenseType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});