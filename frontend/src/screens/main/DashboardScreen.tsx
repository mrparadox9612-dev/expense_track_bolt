import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';
import { Expense, Budget, AnalyticsData } from '../../types';

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: API - Load dashboard data from backend
      // const [expensesData, budgetsData, analyticsData] = await Promise.all([
      //   expenseService.getExpenses({ limit: 5 }),
      //   budgetService.getBudgets(),
      //   expenseService.getAnalytics({ period: 'month' })
      // ]);
      // setRecentExpenses(expensesData.expenses);
      // setBudgets(budgetsData);
      // setAnalytics(analyticsData);

      // Mock data for development
      setRecentExpenses([
        {
          id: '1',
          userId: user?.id || '',
          amount: 25.50,
          description: 'Coffee and breakfast',
          category: { id: 'food', name: 'Food & Dining', icon: 'food', color: '#FF6B6B', isDefault: true, createdAt: '' },
          date: new Date().toISOString(),
          receipt: '',
          tags: ['breakfast'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: user?.id || '',
          amount: 45.00,
          description: 'Gas station',
          category: { id: 'transport', name: 'Transportation', icon: 'car', color: '#4ECDC4', isDefault: true, createdAt: '' },
          date: new Date().toISOString(),
          receipt: '',
          tags: ['fuel'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setAnalytics({
        totalExpenses: 1250.75,
        totalIncome: 3500.00,
        balance: 2249.25,
        categoryBreakdown: [
          { category: 'Food & Dining', amount: 450.25, percentage: 36 },
          { category: 'Transportation', amount: 320.50, percentage: 26 },
          { category: 'Shopping', amount: 280.00, percentage: 22 },
          { category: 'Entertainment', amount: 200.00, percentage: 16 },
        ],
        monthlyTrend: [],
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <IconButton
            icon="cog"
            size={24}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Balance Overview */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(analytics?.balance || 0)}
            </Text>
            <View style={styles.balanceDetails}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Income</Text>
                <Text style={[styles.balanceItemAmount, { color: colors.success }]}>
                  +{formatCurrency(analytics?.totalIncome || 0)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Expenses</Text>
                <Text style={[styles.balanceItemAmount, { color: colors.error }]}>
                  -{formatCurrency(analytics?.totalExpenses || 0)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('AddExpense')}>
              <Card.Content style={styles.actionContent}>
                <IconButton icon="plus" size={24} iconColor={colors.primary} />
                <Text style={styles.actionText}>Add Expense</Text>
              </Card.Content>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('AddBudget')}>
              <Card.Content style={styles.actionContent}>
                <IconButton icon="wallet" size={24} iconColor={colors.secondary} />
                <Text style={styles.actionText}>Set Budget</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <IconButton
              icon="chevron-right"
              size={20}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Expenses' })}
            />
          </View>
          {recentExpenses.map((expense) => (
            <Card key={expense.id} style={styles.expenseCard}>
              <Card.Content style={styles.expenseContent}>
                <View style={styles.expenseInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: expense.category.color }]}>
                    <Text style={styles.categoryEmoji}>
                      {expense.category.name === 'Food & Dining' ? '🍽️' : '🚗'}
                    </Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{expense.category.name}</Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>
                  -{formatCurrency(expense.amount)}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Category Breakdown */}
        {analytics?.categoryBreakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            {analytics.categoryBreakdown.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.8,
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.surface,
    marginVertical: spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
  },
  balanceItemAmount: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  expenseCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.body,
    color: colors.text,
  },
  expenseCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  expenseAmount: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  categoryItem: {
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
  },
  categoryAmount: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categoryPercentage: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});