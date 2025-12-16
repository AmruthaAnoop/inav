import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { customerService, paymentService } from '../services/index';
import { ToastContext } from '../context/ToastContext';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    outstandingBalance: 0,
    totalCollected: 0,
    transactions: 0,
  });
  const { showToast } = useContext(ToastContext);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, statsRes] = await Promise.all([
        customerService.getAllCustomers(100, 0),
        paymentService.getDashboardSummary(),
      ]);

      if (customersRes.data.success) {
        setCustomers(customersRes.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      showToast('Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSelectCustomer = (customer) => {
    navigation.navigate('PaymentForm', { customer });
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to <Text style={styles.brandText}>PayCollect</Text></Text>
          <Text style={styles.subtitle}>Manage your personal loan payments easily and securely.</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.statIconText}>👥</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalCustomers || customers.length}</Text>
            <Text style={styles.statLabel}>Total Customers</Text>
            <Text style={styles.statSubLabel}>Active accounts</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.statIconText}>📋</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.outstandingBalance)}</Text>
            <Text style={styles.statLabel}>Outstanding Balance</Text>
            <Text style={styles.statSubLabel}>Total pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statIconText}>📈</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.totalCollected)}</Text>
            <Text style={styles.statLabel}>Total Collected</Text>
            <Text style={styles.statSubLabel}>This month</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.statIconText}>💳</Text>
            </View>
            <Text style={styles.statValue}>{stats.transactions || 0}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statSubLabel}>Payment records</Text>
          </View>
        </View>

        {/* Loan Accounts Section */}
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Loan Accounts</Text>
          <Text style={styles.sectionSubtitle}>Select an account to make a payment</Text>

          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={styles.accountCard}
              onPress={() => handleSelectCustomer(customer)}
              activeOpacity={0.7}
            >
              <View style={styles.accountHeader}>
                <View>
                  <Text style={styles.accountLabel}>ACCOUNT NUMBER</Text>
                  <Text style={styles.accountNumber}>{customer.account_number}</Text>
                  <Text style={styles.customerName}>{customer.customer_name}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{customer.status}</Text>
                </View>
              </View>

              <View style={styles.accountDetails}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Text>📅</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Issue Date</Text>
                    <Text style={styles.detailValue}>{formatDate(customer.issue_date)}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Text>%</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Interest Rate</Text>
                    <Text style={styles.detailValue}>{customer.interest_rate}%</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Text>⏱</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Tenure</Text>
                    <Text style={styles.detailValue}>{customer.tenure} months</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Text>₹</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Principal</Text>
                    <Text style={styles.detailValue}>{formatCurrency(customer.loan_amount)}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  brandText: {
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  accountsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  accountDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});

export default DashboardScreen;
