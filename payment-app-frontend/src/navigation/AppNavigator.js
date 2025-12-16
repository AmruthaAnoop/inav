import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import LoanDetailsScreen from '../screens/LoanDetailsScreen';
import PaymentFormScreen from '../screens/PaymentFormScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Dashboard flow
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#F5F7FA' },
    }}
  >
    <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    <Stack.Screen name="PaymentForm" component={PaymentFormScreen} />
  </Stack.Navigator>
);

// Custom Tab Bar Icon
const TabIcon = ({ label, focused }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#6B7280',
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
            tabBarLabel: () => null,
          }}
        />
        <Tab.Screen
          name="MakePayment"
          component={LoanDetailsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Make Payment" focused={focused} />,
            tabBarLabel: () => null,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="History" focused={focused} />,
            tabBarLabel: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default AppNavigator;
