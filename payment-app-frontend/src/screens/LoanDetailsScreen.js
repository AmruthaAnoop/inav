import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { customerService } from '../services/index';
import { ToastContext } from '../context/ToastContext';

const LoanDetailsScreen = ({ route, navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const { showToast } = useContext(ToastContext);

  const handleSearchCustomer = async () => {
    if (!accountNumber.trim()) {
      showToast('Please enter account number', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await customerService.getCustomerByAccountNumber(accountNumber);
      if (response.data.success) {
        setCustomerData(response.data.data);
        showToast('Customer details loaded', 'success');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch customer details';
      showToast(errorMsg, 'danger');
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = () => {
    if (!customerData) {
      showToast('Please search customer first', 'warning');
      return;
    }
    navigation.navigate('PaymentForm', { customer: customerData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Loan Details</Text>
            <Text style={styles.headerSubtitle}>Manage your personal loan</Text>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionLabel}>Account Number</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholderTextColor="#999"
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
                onPress={handleSearchCustomer}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer Details Card */}
          {customerData && (
            <>
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Loan Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Number</Text>
                <Text style={styles.detailValue}>{customerData.account_number}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer Name</Text>
                <Text style={styles.detailValue}>{customerData.customer_name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issue Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(customerData.issue_date).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Rate</Text>
                <Text style={styles.detailValue}>{customerData.interest_rate}% per annum</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tenure</Text>
                <Text style={styles.detailValue}>{customerData.tenure} months</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Amount</Text>
                <Text style={styles.detailValue}>₹{Number(customerData.loan_amount).toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Outstanding Balance</Text>
                <Text style={[styles.detailValue, styles.highlightValue]}>
                  ₹{Number(customerData.outstanding_balance).toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>EMI Due</Text>
                <Text style={[styles.detailValue, styles.emiValue]}>
                  ₹{Number(customerData.emi_due).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Payment Statistics */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Payment Summary</Text>
              
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Payments</Text>
                  <Text style={styles.statValue}>{customerData.total_payments || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Paid</Text>
                  <Text style={styles.statValue}>
                    ₹{Number(customerData.total_paid || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {customerData.last_payment_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Payment Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(customerData.last_payment_date).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Make Payment Button */}
            <TouchableOpacity
              style={styles.paymentBtn}
              onPress={handleMakePayment}
            >
              <Text style={styles.paymentBtnText}>Make EMI Payment</Text>
            </TouchableOpacity>
          </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1A1A1A',
  },
  searchBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  highlightValue: {
    color: '#DC2626',
    fontSize: 16,
  },
  emiValue: {
    color: '#059669',
    fontSize: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentBtn: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default LoanDetailsScreen;