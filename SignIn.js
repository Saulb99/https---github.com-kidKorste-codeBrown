import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Animated, Switch, ImageBackground, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidCredentials, setIsValidCredentials] = useState(false);
  const navigation = useNavigation();
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidCredentials(emailRegex.test(email) && password.length >= 6);
  }, [email, password]);

  useEffect(() => {
    const loadCredentials = async () => {
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      setRememberMe(savedRememberMe === 'true');
      if (savedRememberMe === 'true') {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } else {
        setEmail('');
      }
    };
  
    loadCredentials();
  }, []);
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        if (userCredential.user.emailVerified) {
          if (rememberMe) {
            await AsyncStorage.setItem('userEmail', email);
            await AsyncStorage.setItem('rememberMe', 'true');
          } else {
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.setItem('rememberMe', 'false');
          }
          navigation.navigate('Dashboard');
        } else {
          Alert.alert("Email Verification Required", "Please verify your email before signing in.");
          auth.signOut();
        }
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          setError('The provided email address is not registered.');
        } else if (error.code === 'auth/wrong-password') {
          setError('The provided password is incorrect.');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many sign-in attempts. Please try again later.');
        } else if (error.code === 'auth/user-disabled') {
          setError('Your account has been disabled. Please contact support.');
        } else {
          setError('An error occurred. Please try again later.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>

        <Text style={styles.logoText}>Round Table Pizza</Text>
        <Text style={styles.title}>DELIVERY APP</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email input"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
            accessibilityLabel="Password input"
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel="Toggle password visibility"
          >
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333333" />
          </TouchableOpacity>
          </View>
          <View style={styles.credentialsContainer}>
          <View style={styles.leftSideContainer}>
             <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              accessibilityLabel="Remember me switch"
            />
          <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('forgotpassword')} style={styles.rightSideContainer} accessibilityLabel="Forgot password">
            <Text style={styles.switchTextfg}>Forgot Password?</Text>
          </TouchableOpacity>
          </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={[styles.button, !isValidCredentials && styles.disabledButton]}
          onPress={handleSignIn}
          disabled={!isValidCredentials || isLoading}
          accessibilityLabel="Sign in button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>


        <View style={styles.signUpContainer}>
          <Text style={styles.switchText1}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} accessibilityLabel="Sign up">
              <Text style={styles.switchText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
        </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#333333',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'thin',
    color: '#e74c3c',
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 50,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
  },
  showPasswordButton: {
    padding: 10,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  switchText: {
    color: 'blue',
    marginTop: 10,
  },
  switchText1: {
    marginTop: 10,
    color: '#333333',
  },
  switchTextfg: {
    color: 'blue',
  },
  leftSideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 5.5,
  },
  rightSideContainer: {
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 5.5,
  },
  credentialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 50,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.5)',
  },
});

export default SignIn;