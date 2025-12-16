# Payment Collection Mobile App

A modern React Native mobile application for customers to check loan details and make EMI payments using Expo.

## Features

✅ Beautiful responsive mobile UI
✅ Loan details dashboard
✅ Real-time payment processing
✅ Payment history tracking
✅ Multiple payment methods support
✅ Success confirmation modal
✅ Error handling and validation
✅ Environment-based API configuration
✅ iOS and Android support
✅ Offline capability ready

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Expo CLI (optional, can use `npx`)
- iOS Simulator (Mac) or Android Emulator

### Local Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/payment-app-frontend.git
cd payment-app-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start Expo development server
npm start
```

### Run on Different Platforms

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web (browser)
npm run web
```

## Project Structure

```
payment-app-frontend/
├── src/
│   ├── screens/              # UI screens
│   │   ├── LoanDetailsScreen.js
│   │   └── PaymentFormScreen.js
│   ├── services/             # API services
│   │   ├── api.js
│   │   └── index.js
│   ├── context/              # React context
│   │   └── ToastContext.js
│   ├── navigation/           # Navigation setup
│   │   └── AppNavigator.js
│   └── components/           # Reusable components
├── assets/                   # Images and icons
├── .github/workflows/        # CI/CD pipelines
├── App.js                    # Root component
├── app.json                  # Expo configuration
├── .env.example              # Environment template
├── babel.config.js           # Babel configuration
└── package.json
```

## Environment Variables

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_NAME=Payment Collection
```

## Screens

### 1. Loan Details Screen

Displays customer loan information:
- Account number search
- Loan details (issue date, interest rate, tenure)
- EMI due amount
- Outstanding balance
- Payment statistics
- Make payment button

### 2. Payment Form Screen

Handles payment processing:
- Payment amount input
- Payment method selection (UPI, Card, Net Banking, Cheque)
- Transaction ID (optional)
- Remarks/notes
- Success confirmation modal
- Updated balance display

## API Integration

The app connects to the backend API with:

```javascript
// Axios instance with request/response interceptors
// Automatic auth token handling
// Environment-based base URL
// 15-second timeout
// CORS support
```

### API Services

```javascript
// Get customer details
customerService.getCustomerByAccountNumber(accountNumber)

// Process payment
paymentService.processPayment(paymentData)

// Get payment history
paymentService.getPaymentHistory(accountNumber)
```

## Build and Deployment

### Build for iOS

```bash
eas build --platform ios
```

Requires:
- Apple Developer Account
- Developer certificate
- Provisioning profile

### Build for Android

```bash
eas build --platform android
```

Requires:
- Keystore file
- Key alias and password

### Submit to App Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## GitHub Actions CI/CD

### Setup

1. Create GitHub repository
2. Add these secrets:
   - `EXPO_TOKEN` - Expo account token
3. Push to main branch

### Pipeline

- Installs dependencies
- Runs linting
- Builds Android APK
- Builds iOS IPA (Mac runner)
- Creates release artifacts

## Testing

```bash
npm test                 # Run tests
npm run lint             # Lint code
npm test -- --coverage   # Coverage report
```

## Performance Tips

1. Memoize expensive computations
2. Use FlatList for long lists
3. Lazy load images
4. Minimize re-renders
5. Use AsyncStorage for caching
6. Optimize bundle size

## Debugging

### Expo DevTools

```bash
npm start

# Press 'j' for DevTools
```

### Network Debugging

```bash
# Enable network debugging
Logging > Disable LogBox in dev
```

### Redux DevTools (if added)

```bash
npm install redux-devtools-extension
```

## Code Snippets

### Making an API Call

```javascript
import { paymentService } from '../services';

const handlePayment = async () => {
  try {
    const response = await paymentService.processPayment({
      account_number: "ACC001",
      payment_amount: 5000,
      payment_method: "UPI"
    });
    
    if (response.data.success) {
      showToast('Payment successful!', 'success');
    }
  } catch (error) {
    showToast(error.message, 'danger');
  }
};
```

### Using Toast Notifications

```javascript
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

const MyComponent = () => {
  const { showToast } = useContext(ToastContext);
  
  const handleAction = () => {
    showToast('Action completed!', 'success');
  };
  
  return <Button onPress={handleAction} />;
};
```

### Styling Components

```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
```

## Scripts

```bash
npm start                # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm run web              # Run in web browser
npm test                 # Run tests
npm run lint             # Run linter
npm run build:android    # Build Android APK
npm run build:ios        # Build iOS IPA
```

## Dependencies

### Core
- `react` - UI library
- `react-native` - Mobile framework
- `expo` - Development platform

### Navigation
- `@react-navigation/native` - Navigation library
- `@react-navigation/stack` - Stack navigation
- `react-native-gesture-handler` - Gesture handling

### API & Storage
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

### UI & Notifications
- `react-native-toast-notifications` - Toast messages

## File Size Optimization

```bash
# Analyze bundle size
expo export --bundle-analysis

# Remove unused packages
npm prune

# Use production build
NODE_ENV=production npm run build
```

## Common Issues

### API Connection Error

**Problem:** `Network Error: Unable to connect to server`

**Solution:**
```bash
# Check backend is running
# Verify EXPO_PUBLIC_API_URL in .env
# Check CORS configuration on backend
# Test with curl: curl http://localhost:5000/api/health
```

### Build Fails with Module Not Found

**Problem:** `Cannot find module 'react-native-xxx'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm start -- --reset-cache
```

### Emulator/Simulator Won't Start

**Problem:** AVD fails to launch

**Solution:**
```bash
# For Android
$ANDROID_SDK_ROOT/emulator/emulator -list-avds
$ANDROID_SDK_ROOT/emulator/emulator -avd Pixel_4_API_30

# For iOS (Mac)
xcrun simctl list devices
xcrun simctl boot booted
```

## Security Best Practices

1. ✅ Never commit .env file
2. ✅ Use HTTPS for API calls
3. ✅ Validate user input
4. ✅ Store sensitive data in secure storage
5. ✅ Implement SSL pinning
6. ✅ Use environment variables
7. ✅ Don't log sensitive information
8. ✅ Implement request timeouts

## Accessibility

- ✅ Proper color contrast
- ✅ Touch targets > 48x48 pts
- ✅ Text scaling support
- ✅ Screen reader compatible
- ✅ Keyboard navigation support

## Localization (Ready for Implementation)

```javascript
// i18n setup structure
i18n/
├── en.json
├── hi.json
└── index.js
```

## State Management

Current implementation uses:
- React Context API for global state
- AsyncStorage for persistent data
- Component state for local UI state

For more complex state, consider:
- Redux
- Zustand
- MobX

## Networking

The app uses Axios with:
- Request/Response interceptors
- Automatic auth token injection
- Global error handling
- Timeout management
- CORS support

## WebSocket Support (Optional)

For real-time updates:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
socket.on('payment_update', (data) => {
  // Update UI
});
```

## Analytics (Optional)

```javascript
import { Analytics } from '@segment/analytics-react-native';

Analytics.track('PaymentSubmitted', {
  amount: 5000,
  method: 'UPI'
});
```

## Documentation

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT

## Support

For issues and questions, create a GitHub issue.

---

**Version:** 1.0.0
**Last Updated:** January 2024
**Built with:** React Native + Expo
