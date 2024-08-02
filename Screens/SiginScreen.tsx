import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

interface SigninScreenProps {
  navigation: NavigationProp<any>;
}

const SigninScreen: React.FC<SigninScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');

  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [telephoneError, setTelephoneError] = useState<string>('');

  const [isNomFocused, setNomFocused] = useState<boolean>(false);
  const [isEmailFocused, setEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false);
  const [isConfirmPasswordFocused, setConfirmPasswordFocused] = useState<boolean>(false);
  const [isTelephoneFocused, setTelephoneFocused] = useState<boolean>(false);

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

  useEffect(() => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  useEffect(() => {
    if (telephone && !/^\d{10}$/.test(telephone)) {
      setTelephoneError("Le numéro de téléphone doit contenir exactement 10 chiffres");
    } else {
      setTelephoneError('');
    }
  }, [telephone]);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      console.log("Données à envoyer : ", { name, email, password, telephone });
      const response = await axios.post('http://192.168.4.28:5003/api/createAdmin', {
        name,
        email,
        password,
        telephone,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      Alert.alert("Inscription réussie", "Vous pouvez maintenant vous connecter.");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de l'inscription.");
      console.error(error);
    }
  };
  
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-3xl font-bold mb-8 text-center text-gray-800">S'inscrire</Text>
      
      <View style={[styles.inputContainer, isNomFocused && styles.inputFocused]}>
        <Icon name="person" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={name}
          onChangeText={(text: string) => setName(text)}
          autoCapitalize="words"
          onFocus={() => setNomFocused(true)}
          onBlur={() => setNomFocused(false)}
        />
      </View>

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
      {emailError ? <Text className="text-red-500">{emailError}</Text> : null}

      <View style={[styles.inputContainer, isPasswordFocused && styles.inputFocused]}>
        <Icon name="lock-closed" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={(text: string) => setPassword(text)}
          secureTextEntry
          autoCapitalize="none"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
      </View>
      {passwordError ? <Text className="text-red-500">{passwordError}</Text> : null}

      <View style={[styles.inputContainer, isConfirmPasswordFocused && styles.inputFocused]}>
        <Icon name="lock-closed" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={(text: string) => setConfirmPassword(text)}
          secureTextEntry
          autoCapitalize="none"
          onFocus={() => setConfirmPasswordFocused(true)}
          onBlur={() => setConfirmPasswordFocused(false)}
        />
      </View>
      {confirmPasswordError ? <Text className="text-red-500">{confirmPasswordError}</Text> : null}

      <View style={[styles.inputContainer, isTelephoneFocused && styles.inputFocused]}>
        <Icon name="call" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          value={telephone}
          onChangeText={(text: string) => setTelephone(text)}
          keyboardType="numeric"
          maxLength={10}  // Limite le champ à 10 chiffres
          onFocus={() => setTelephoneFocused(true)}
          onBlur={() => setTelephoneFocused(false)}
        />
      </View>
      {telephoneError ? <Text className="text-red-500">{telephoneError}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={!!emailError || !!passwordError || !!telephoneError || !!confirmPasswordError}
      >
        <Text className="text-center text-white font-semibold">S'inscrire</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="mt-6 text-blue-500">Se connecter</Text>
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

export default SigninScreen;
