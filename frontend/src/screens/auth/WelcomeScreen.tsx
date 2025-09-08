import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, spacing, typography } from '../../constants/theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* TODO: Add app logo image */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.appName}>Expense Tracker</Text>
          <Text style={styles.tagline}>
            Take control of your finances with smart expense tracking
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>📊 Track expenses by category</Text>
            <Text style={styles.featureItem}>💳 Set and monitor budgets</Text>
            <Text style={styles.featureItem}>📈 View detailed analytics</Text>
            <Text style={styles.featureItem}>📱 Capture receipt photos</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  features: {
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});