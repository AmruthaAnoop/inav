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
  Modal,
} from 'react-native';
import { paymentService } from '../services/index';
import { ToastContext } from '../context/ToastContext';

const PaymentFormScreen = ({ route, navigation }) => {
  const { customer } = route.params || {};
  const { showToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    payment_amount: '',
    payment_method: 'UPI',
    transaction_id: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer information not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.payment_amount.trim()) {
      showToast('Please enter payment amount', 'warning');
      return false;
    }

    const amount = parseFloat(formData.payment_amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Payment amount must be greater than 0', 'danger');
      return false;
    }

    if (amount > customer.outstanding_balance) {
      showToast(`Amount cannot exceed outstanding balance of ₹${customer.outstanding_balance.toFixed(2)}`, 'danger');
      return false;
    }

    return true;
  };

  const handleSubmitPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const paymentPayload = {
        account_number: customer.account_number,
        payment_amount: parseFloat(formData.payment_amount),
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id || null,
        remarks: formData.remarks || null,
      };

      const response = await paymentService.processPayment(paymentPayload);

      if (response.data.success) {
        setSuccessData(response.data.data);
        setShowSuccessModal(true);
        setFormData({
          payment_amount: '',
          payment_method: 'UPI',
          transaction_id: '',
          remarks: '',
        });
        showToast('Payment processed successfully!', 'success');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to process payment';
      showToast(errorMsg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigation.navigate('Dashboard');
  };

  const paymentMethods = ['UPI', 'CARD', 'NET_BANKING', 'CHEQUE'];

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
            <Text style={styles.headerTitle}>Payment</Text>
            <Text style={styles.headerSubtitle}>Complete your payment</Text>
          </View>

          {/* Customer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Loan Information</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Account Number</Text>
              <Text style={styles.summaryValue}>{customer.account_number}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer Name</Text>
              <Text style={styles.summaryValue}>{customer.customer_name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Outstanding Balance</Text>
              <Text style={styles.summaryValueHighlight}>
                ₹{Number(customer.outstanding_balance).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>EMI Due</Text>
              <Text style={styles.emiAmount}>
                ₹{Number(customer.emi_due).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Payment Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enter Payment Details</Text>

            {/* Payment Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>EMI Payment Amount *</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter amount (EMI: ${Number(customer.emi_due).toLocaleString('en-IN')})`}
                  value={formData.payment_amount}
                  onChangeText={(value) => handleInputChange('payment_amount', value)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                />
              </View>
              <Text style={styles.helpText}>
                Maximum amount: ₹{Number(customer.outstanding_balance).toLocaleString('en-IN')}
              </Text>
              <TouchableOpacity
                style={styles.quickFillBtn}
                onPress={() => handleInputChange('payment_amount', customer.emi_due.toString())}
                disabled={loading}
              >
                <Text style={styles.quickFillText}>Use EMI Amount</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.methodContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodBtn,
                      formData.payment_method === method && styles.methodBtnActive,
                    ]}
                    onPress={() => handleInputChange('payment_method', method)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.methodBtnText,
                        formData.payment_method === method && styles.methodBtnTextActive,
                      ]}
                    >
                      {method.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transaction ID */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Transaction ID (Optional)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter transaction reference number"
                value={formData.transaction_id}
                onChangeText={(value) => handleInputChange('transaction_id', value)}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            {/* Remarks */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks (Optional)</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Add any notes about this payment"
                value={formData.remarks}
                onChangeText={(value) => handleInputChange('remarks', value)}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmitPayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Your EMI payment has been processed successfully</Text>

            {successData && successData.payment && (
              <View style={styles.successDetails}>
                <View style={styles.detailRowModal}>
                  <Text style={styles.detailLabelModal}>Payment Reference</Text>
                  <Text style={styles.detailValueModal}>
                    {successData.payment.payment_reference_id}
                  </Text>
                </View>
                <View style={styles.detailRowModal}>
                  <Text style={styles.detailLabelModal}>Amount Paid</Text>
                  <Text style={styles.detailAmountModal}>
                    ₹{Number(successData.payment.payment_amount).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.detailRowModal}>
                  <Text style={styles.detailLabelModal}>Payment Method</Text>
                  <Text style={styles.detailValueModal}>
                    {successData.payment.payment_method}
                  </Text>
                </View>
                <View style={styles.detailRowModal}>
                  <Text style={styles.detailLabelModal}>New Outstanding Balance</Text>
                  <Text style={styles.detailValueModal}>
                    ₹{Number(successData.customer.outstanding_balance).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.detailRowModal}>
                  <Text style={styles.detailLabelModal}>Account Number</Text>
                  <Text style={styles.detailValueModal}>
                    {successData.customer.account_number}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.acknowledgment}>
              <Text style={styles.acknowledgmentTitle}>Payment Acknowledgment</Text>
              <Text style={styles.acknowledgmentText}>
                Thank you for your payment. A confirmation has been recorded for your account.
                Your updated outstanding balance is reflected above.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  summaryValueHighlight: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '700',
  },
  emiAmount: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
  },
  formCard: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputField: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  quickFillBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quickFillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  methodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  methodBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  methodBtnTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    paddingVertical: 16,
    backgroundColor: '#059669',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 44,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabelModal: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValueModal: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  detailAmountModal: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '700',
  },
  acknowledgment: {
    width: '100%',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  acknowledgmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  acknowledgmentText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  closeModalBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentFormScreen;
