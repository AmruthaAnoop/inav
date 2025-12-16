import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { paymentService } from '../services/index';
import { ToastContext } from '../context/ToastContext';

const HistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const { showToast } = useContext(ToastContext);

  const fetchPaymentHistory = async () => {
    try {
      console.log('📋 HistoryScreen: Fetching payment history...');
      // Get all customers' payment history
      const response = await paymentService.getDashboardSummary();
      console.log('📋 HistoryScreen: Response received', response.data);
      if (response.data.success && response.data.data.recentPayments) {
        console.log('📋 HistoryScreen: Setting payments', response.data.data.recentPayments.length);
        setPayments(response.data.data.recentPayments);
      } else {
        console.log('📋 HistoryScreen: No recent payments found');
      }
    } catch (error) {
      console.error('📋 HistoryScreen: Error fetching payments', error);
      showToast('Failed to load payment history', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('📋 HistoryScreen: Component mounted');
    fetchPaymentHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'FAILED':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'UPI':
        return '📱';
      case 'CARD':
        return '💳';
      case 'NET_BANKING':
        return '🏦';
      case 'CHEQUE':
        return '📝';
      default:
        return '💰';
    }
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
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.subtitle}>View all payment transactions</Text>
        </View>

        {/* Payment List */}
        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No payment history found</Text>
            <Text style={styles.emptySubtext}>Payments will appear here once made</Text>
          </View>
        ) : (
          <View style={styles.paymentList}>
            {payments.map((payment) => {
              const statusColors = getStatusColor(payment.status);
              return (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentIconContainer}>
                      <Text style={styles.paymentIcon}>
                        {getPaymentMethodIcon(payment.payment_method)}
                      </Text>
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAccount}>{payment.account_number}</Text>
                      <Text style={styles.paymentRef}>Ref: {payment.payment_reference_id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {payment.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailAmount}>{formatCurrency(payment.payment_amount)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method</Text>
                      <Text style={styles.detailValue}>{payment.payment_method}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>{formatDate(payment.payment_date)}</Text>
                    </View>
                    {payment.transaction_id && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>{payment.transaction_id}</Text>
                      </View>
                    )}
                    {payment.remarks && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Remarks</Text>
                        <Text style={styles.detailValue}>{payment.remarks}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  paymentList: {
    marginBottom: 20,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAccount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  paymentRef: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
});

export default HistoryScreen;
