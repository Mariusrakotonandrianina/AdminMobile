import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Props {
  navigation: NavigationProp<any>;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const [isEmailFocused, setEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false);

  const { setAuthToken, login } = useAuth();

  useEffect(() => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email invalide");
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
    } else {
      setPasswordError('');
    }
  }, [password]);

  const handleLogin = async () => {
    if (emailError || passwordError) {
      return;
    }
  
    try {
      const response = await axios.post(
        'http://192.168.4.28:5003/api/loginAdmin',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.token) {
        setAuthToken(response.data.token);
        login();
  
        navigation.navigate('Main');
      } else {
        Alert.alert("Erreur", "Identifiants invalides");
      }
    } catch (error) {
      let errorMessage = "Identifiants invalides";
  
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          errorMessage = "Identifiants invalides";
        } else {
          errorMessage = "Une erreur est survenue lors de la connexion.";
        }
      }
  
      Alert.alert("Erreur", errorMessage);
      console.error(error);
    }
  };
  
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-3xl font-bold mb-8 text-gray-800">Se connecter</Text>

      <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
        <Icon name="mail" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text: string) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>
      {emailError ? <Text className="text-red-500 mb-2">{emailError}</Text> : null}

      <View style={[styles.inputContainer, isPasswordFocused && styles.inputFocused]}>
        <Icon name="lock-closed" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          secureTextEntry
          onChangeText={(text: string) => setPassword(text)}
          autoCapitalize="none"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
      </View>
      {passwordError ? <Text className="text-red-500 mb-2">{passwordError}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={!!emailError || !!passwordError}
      >
        <Text className="text-center text-white font-semibold">Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
        <Text className="mt-6 text-blue-500">S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  inputFocused: {
    borderColor: '#007BFF',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  button: {
    width: '90%',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
