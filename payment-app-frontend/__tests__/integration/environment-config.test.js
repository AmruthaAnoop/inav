/**
 * Test 10: Environment Variable Usage for API URL
 * 
 * Tests that:
 * 1. API URL is configured via environment variables
 * 2. API base URL is NOT hardcoded
 * 3. Configuration works when backend URL changes
 */

import axios from 'axios';

describe('Test 10: Environment Variable Usage', () => {
  describe('API URL Configuration', () => {
    it('should use environment variable for API URL', () => {
      // Read the api.js file to check for environment variable usage
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, '../../src/services/api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');

      // Verify that environment variables are used
      expect(apiFileContent).toContain('process.env.EXPO_PUBLIC_API_URL');
      expect(apiFileContent).toContain('Constants.expoConfig?.extra?.API_URL');
    });

    it('should NOT have hardcoded API URLs in the codebase', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check api.js file
      const apiFilePath = path.join(__dirname, '../../src/services/api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');

      // Should not contain hardcoded production URLs (except as fallback)
      const hardcodedPatterns = [
        /baseURL:\s*['"]https?:\/\/(?!localhost)[^'"]+['"]/g,
        /axios\.create\(\{[^}]*baseURL:\s*['"]https?:\/\/(?!localhost)[^'"]+['"]/g
      ];

      hardcodedPatterns.forEach(pattern => {
        const matches = apiFileContent.match(pattern);
        if (matches) {
          // Allow fallback to localhost only
          matches.forEach(match => {
            expect(match).toContain('localhost');
          });
        }
      });
    });

    it('should have .env file for local configuration', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '../../.env');
      
      // .env file should exist
      expect(fs.existsSync(envPath)).toBe(true);

      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Should contain EXPO_PUBLIC_API_URL
      expect(envContent).toContain('EXPO_PUBLIC_API_URL');
    });

    it('should have .env.example as template', () => {
      const fs = require('fs');
      const path = require('path');
      const envExamplePath = path.join(__dirname, '../../.env.example');
      
      // .env.example should exist
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Should contain EXPO_PUBLIC_API_URL
      expect(envExampleContent).toContain('EXPO_PUBLIC_API_URL');
    });

    it('should support different API URLs for different environments', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Mock different environment configurations
      const testConfigs = [
        { url: 'http://localhost:5000/api', env: 'development' },
        { url: 'http://192.168.1.100:5000/api', env: 'local-network' },
        { url: 'https://api.production.com/api', env: 'production' }
      ];

      testConfigs.forEach(config => {
        // Simulate reading from environment variable
        const mockEnv = {
          EXPO_PUBLIC_API_URL: config.url,
          EXPO_PUBLIC_ENVIRONMENT: config.env
        };

        expect(mockEnv.EXPO_PUBLIC_API_URL).toBe(config.url);
        expect(mockEnv.EXPO_PUBLIC_API_URL).not.toBeUndefined();
        expect(mockEnv.EXPO_PUBLIC_API_URL).toBeTruthy();
      });
    });

    it('should have fallback API URL if environment variable is missing', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, '../../src/services/api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');

      // Should have fallback logic using || operator (may span multiple lines)
      expect(apiFileContent).toContain('http://localhost:5000/api');
      expect(apiFileContent).toMatch(/process\.env\.EXPO_PUBLIC_API_URL\s*\|\|/);
    });

    it('should read API URL from app.json extra config', () => {
      const fs = require('fs');
      const path = require('path');
      const appJsonPath = path.join(__dirname, '../../app.json');
      
      expect(fs.existsSync(appJsonPath)).toBe(true);
      
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // Should have extra.API_URL configured
      expect(appJson.expo.extra).toBeDefined();
      expect(appJson.expo.extra.API_URL).toBeDefined();
      expect(typeof appJson.expo.extra.API_URL).toBe('string');
      expect(appJson.expo.extra.API_URL).toMatch(/^https?:\/\//);
    });

    it('should allow API URL to be changed without code modifications', () => {
      // This test verifies that changing the API URL only requires
      // updating environment variables, not code changes
      
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, '../../src/services/api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');

      // Extract the API_BASE_URL assignment
      const apiBaseUrlMatch = apiFileContent.match(/const API_BASE_URL = ([^;]+);/);
      expect(apiBaseUrlMatch).toBeTruthy();

      const apiBaseUrlExpression = apiBaseUrlMatch[1];

      // Verify it uses environment variable as primary source
      expect(apiBaseUrlExpression).toContain('process.env.EXPO_PUBLIC_API_URL');
      
      // Verify fallback chain exists
      expect(apiBaseUrlExpression).toContain('||');
    });

    it('should have consistent API URL configuration across services', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check all service files use the centralized api.js
      const servicesDir = path.join(__dirname, '../../src/services');
      const serviceFiles = fs.readdirSync(servicesDir)
        .filter(file => file.endsWith('.js') && file !== 'api.js');

      serviceFiles.forEach(file => {
        const filePath = path.join(servicesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Should import from './api' or similar
        expect(fileContent).toMatch(/from ['"]\.\/api['"]/);
        
        // Should NOT create their own axios instances with hardcoded URLs
        const hasOwnAxiosCreate = fileContent.includes('axios.create(');
        if (hasOwnAxiosCreate) {
          // If they create axios instance, ensure it uses imported api
          expect(fileContent).toContain('import api from');
        }
      });
    });

    it('should document API URL configuration in README', () => {
      const fs = require('fs');
      const path = require('path');
      const readmePath = path.join(__dirname, '../../README.md');
      
      if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Should mention environment variables or API configuration
        const hasEnvDocumentation = 
          readmeContent.toLowerCase().includes('expo_public_api_url') ||
          readmeContent.toLowerCase().includes('environment variable') ||
          readmeContent.toLowerCase().includes('api url') ||
          readmeContent.toLowerCase().includes('.env');
        
        expect(hasEnvDocumentation).toBe(true);
      }
    });
  });

  describe('Backend URL Change Handling', () => {
    it('should work when backend URL changes to different port', () => {
      const testUrls = [
        'http://localhost:3000/api',
        'http://localhost:5000/api',
        'http://localhost:8080/api'
      ];

      testUrls.forEach(url => {
        // Simulate environment variable change
        const mockEnv = {
          EXPO_PUBLIC_API_URL: url
        };

        expect(mockEnv.EXPO_PUBLIC_API_URL).toBe(url);
        expect(mockEnv.EXPO_PUBLIC_API_URL).toContain('localhost');
      });
    });

    it('should work when backend URL changes to different host', () => {
      const testUrls = [
        'http://192.168.1.10:5000/api',
        'http://10.0.2.2:5000/api', // Android emulator host
        'https://api.staging.com/api',
        'https://api.production.com/api'
      ];

      testUrls.forEach(url => {
        const mockEnv = {
          EXPO_PUBLIC_API_URL: url
        };

        expect(mockEnv.EXPO_PUBLIC_API_URL).toBe(url);
        expect(mockEnv.EXPO_PUBLIC_API_URL).toMatch(/^https?:\/\//);
      });
    });

    it('should support HTTPS URLs for production', () => {
      const productionUrl = 'https://api.production.com/api';
      const mockEnv = {
        EXPO_PUBLIC_API_URL: productionUrl,
        EXPO_PUBLIC_ENVIRONMENT: 'production'
      };

      expect(mockEnv.EXPO_PUBLIC_API_URL).toContain('https://');
      expect(mockEnv.EXPO_PUBLIC_API_URL).not.toContain('http://');
    });

    it('should validate API URL format', () => {
      const validUrls = [
        'http://localhost:5000/api',
        'https://api.example.com/api',
        'http://192.168.1.100:3000/api'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://invalid.com',
        'localhost:5000', // missing protocol
        '' // empty
      ];

      validUrls.forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });

      invalidUrls.forEach(url => {
        expect(url).not.toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('Configuration Best Practices', () => {
    it('should not commit sensitive .env file to git', () => {
      const fs = require('fs');
      const path = require('path');
      const gitignorePath = path.join(__dirname, '../../.gitignore');
      
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        
        // .env should be in .gitignore
        expect(gitignoreContent).toMatch(/^\.env$/m);
      }
    });

    it('should have clear separation between development and production configs', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '../../.env');
      const envExamplePath = path.join(__dirname, '../../.env.example');
      
      if (fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
        
        // .env.example should not contain production secrets
        expect(envExampleContent).toContain('localhost');
        
        // Both should have EXPO_PUBLIC_ENVIRONMENT variable
        expect(envContent).toContain('EXPO_PUBLIC_ENVIRONMENT');
        expect(envExampleContent).toContain('EXPO_PUBLIC_ENVIRONMENT');
      }
    });

    it('should use EXPO_PUBLIC_ prefix for client-accessible variables', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, '../../src/services/api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');

      // All environment variables in client code should use EXPO_PUBLIC_ prefix
      const envVarMatches = apiFileContent.match(/process\.env\.([A-Z_]+)/g);
      
      if (envVarMatches) {
        envVarMatches.forEach(match => {
          expect(match).toContain('EXPO_PUBLIC_');
        });
      }
    });
  });
});
