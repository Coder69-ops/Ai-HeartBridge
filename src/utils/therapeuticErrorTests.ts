// Therapeutic Error Handling Test Suite for AI HeartBridge
// This file validates that all error messages maintain therapeutic tone

import { authSchemas, relationshipSchemas, getServerErrorMessage } from './formErrorHandler';
import { NetworkErrorHandler } from './networkErrorHandler';

// Test therapeutic messaging across all error types
export const therapeuticErrorTests = {
  // Form validation tests
  formValidation: {
    'empty email': () => {
      try {
        authSchemas.email.parse('');
      } catch (error: any) {
        return error.errors[0].message.includes('💙') && error.errors[0].message.includes('stay connected');
      }
      return false;
    },
    
    'invalid email': () => {
      try {
        authSchemas.email.parse('invalid-email');
      } catch (error: any) {
        return error.errors[0].message.includes('📧') && error.errors[0].message.includes('double-check');
      }
      return false;
    },
    
    'weak password': () => {
      try {
        authSchemas.password.parse('123');
      } catch (error: any) {
        return error.errors[0].message.includes('🔒') && error.errors[0].message.includes('peace of mind');
      }
      return false;
    },
    
    'short name': () => {
      try {
        authSchemas.name.parse('A');
      } catch (error: any) {
        return error.errors[0].message.includes('💚') && error.errors[0].message.includes('what to call you');
      }
      return false;
    },
    
    'password mismatch': () => {
      try {
        authSchemas.confirmPassword('password123').parse('different');
      } catch (error: any) {
        return error.errors[0].message.includes('🤝') && error.errors[0].message.includes('security');
      }
      return false;
    }
  },

  // Server error tests
  serverErrors: {
    'network error': () => {
      const message = getServerErrorMessage({ response: null });
      return message.includes('🌐') && message.includes('together');
    },
    
    'email exists (400)': () => {
      const error = { response: { status: 400, data: { message: 'email already exists' } } };
      const message = getServerErrorMessage(error);
      return message.includes('📧') && message.includes('here to help');
    },
    
    'wrong password (401)': () => {
      const error = { response: { status: 401 } };
      const message = getServerErrorMessage(error);
      return message.includes('🔍') && message.includes('you\'ve got this');
    },
    
    'not found (404)': () => {
      const error = { response: { status: 404 } };
      const message = getServerErrorMessage(error);
      return message.includes('📫') && message.includes('excited to have you');
    },
    
    'rate limit (429)': () => {
      const error = { response: { status: 429 } };
      const message = getServerErrorMessage(error);
      return message.includes('🏃‍♀️') && message.includes('mindful moment');
    },
    
    'server error (500)': () => {
      const error = { response: { status: 500 } };
      const message = getServerErrorMessage(error);
      return message.includes('😌') && message.includes('taking a breather');
    }
  },

  // Network handler tests
  networkHandling: {
    'offline message': async () => {
      const handler = NetworkErrorHandler.getInstance();
      try {
        await handler.handleApiCall(
          () => Promise.reject(new Error('Network Error')),
          { description: 'loading your profile' }
        );
      } catch (error: any) {
        return error.message.includes('💚') && 
               error.message.includes('progress is safe') && 
               error.message.includes('breathe');
      }
      return false;
    },
    
    'server error handling': async () => {
      const handler = NetworkErrorHandler.getInstance();
      try {
        await handler.handleApiCall(
          () => Promise.reject({ response: { status: 500 } }),
          { description: 'saving your data' }
        );
      } catch (error: any) {
        return error.message.includes('🤗') && 
               error.message.includes('data is safe') && 
               error.message.includes('few moments');
      }
      return false;
    }
  }
};

// Therapeutic messaging validation criteria
export const therapeuticCriteria = {
  // Must include emotional support elements
  emotionalSupport: (message: string) => {
    const supportiveElements = ['💚', '💙', '🤗', '🌱', '✨', 'don\'t worry', 'we\'re here', 'together'];
    return supportiveElements.some(element => message.includes(element));
  },
  
  // Must avoid technical jargon
  avoidsTechnicalJargon: (message: string) => {
    const technicalTerms = ['HTTP', 'API', 'server error', 'status code', 'exception', 'null pointer'];
    return !technicalTerms.some(term => message.toLowerCase().includes(term.toLowerCase()));
  },
  
  // Must provide reassurance
  providesReassurance: (message: string) => {
    const reassuringPhrases = ['safe', 'secure', 'protected', 'we\'ll try again', 'working on it', 'remains strong'];
    return reassuringPhrases.some(phrase => message.toLowerCase().includes(phrase));
  },
  
  // Must suggest positive action or patience
  suggestsPositiveAction: (message: string) => {
    const actionPhrases = ['try again', 'take a moment', 'breathe', 'double-check', 'when ready'];
    return actionPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }
};

// Run all tests and generate report
export const runTherapeuticTests = () => {
  console.log('🌟 Running Therapeutic Error Handling Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test form validation
  console.log('📝 Form Validation Tests:');
  for (const [testName, testFn] of Object.entries(therapeuticErrorTests.formValidation)) {
    totalTests++;
    const passed = testFn();
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASS' : 'FAIL'}`);
    if (passed) passedTests++;
  }
  
  // Test server errors
  console.log('\n🌐 Server Error Tests:');
  for (const [testName, testFn] of Object.entries(therapeuticErrorTests.serverErrors)) {
    totalTests++;
    const passed = testFn();
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASS' : 'FAIL'}`);
    if (passed) passedTests++;
  }
  
  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📊 Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All therapeutic messaging tests passed! Your app speaks with empathy and care.');
  } else {
    console.log('🤗 Some improvements needed. Let\'s make every message more supportive.');
  }
  
  return { passedTests, totalTests, successRate: (passedTests / totalTests) * 100 };
};

// Export individual test runners for debugging
export const testIndividualMessage = (message: string) => {
  console.log(`\n🔍 Analyzing message: "${message}"\n`);
  
  const tests = {
    'Emotional Support': therapeuticCriteria.emotionalSupport(message),
    'Avoids Technical Jargon': therapeuticCriteria.avoidsTechnicalJargon(message),
    'Provides Reassurance': therapeuticCriteria.providesReassurance(message),
    'Suggests Positive Action': therapeuticCriteria.suggestsPositiveAction(message)
  };
  
  for (const [criterion, passed] of Object.entries(tests)) {
    console.log(`${passed ? '✅' : '❌'} ${criterion}`);
  }
  
  const passedCount = Object.values(tests).filter(Boolean).length;
  const grade = passedCount === 4 ? 'A+' : passedCount === 3 ? 'B+' : passedCount === 2 ? 'C+' : 'Needs Improvement';
  
  console.log(`\n📈 Therapeutic Grade: ${grade} (${passedCount}/4 criteria met)`);
  
  return { tests, grade, passedCount };
};

export default therapeuticErrorTests;