import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

// Screens
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ExpensesScreen } from '../screens/main/ExpensesScreen';
import { BudgetsScreen } from '../screens/main/BudgetsScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AddExpenseScreen } from '../screens/main/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/main/EditExpenseScreen';
import { AddBudgetScreen } from '../screens/main/AddBudgetScreen';
import { EditBudgetScreen } from '../screens/main/EditBudgetScreen';
import { CategoriesScreen } from '../screens/main/CategoriesScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Budgets: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AddExpense: undefined;
  EditExpense: { expenseId: string };
  AddBudget: undefined;
  EditBudget: { budgetId: string };
  Categories: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Budgets':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Add Expense',
        }}
      />
      <Stack.Screen 
        name="EditExpense" 
        component={EditExpenseScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Edit Expense',
        }}
      />
      <Stack.Screen 
        name="AddBudget" 
        component={AddBudgetScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Add Budget',
        }}
      />
      <Stack.Screen 
        name="EditBudget" 
        component={EditBudgetScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Edit Budget',
        }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          headerShown: true,
          title: 'Categories',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};