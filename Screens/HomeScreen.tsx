// screens/HomeScreen.tsx
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CustomStyledView from '../components/StyledView';
import CustomStyledText from '../components/StyledText';
import StyledButton from '../components/StyledButton';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <CustomStyledView className="flex-1 justify-center items-center bg-gray-100 p-4 bg-opacity-50">
      <CustomStyledText className="text-3xl font-bold mb-4 text-gray-500">
        Welcome to Tranobongo
      </CustomStyledText>
      <CustomStyledView className="w-full px-4">
        <StyledButton
          title="Login"
          className="bg-blue-500 py-2 px-4 rounded mb-2"
          textClassName="text-white text-center"
          onPress={() => navigation.navigate('Login')}
        />
        <StyledButton
          title="Signup"
          className="bg-green-500 py-2 px-4 rounded"
          textClassName="text-white text-center"
          onPress={() => navigation.navigate('Signin')}
        />
      </CustomStyledView>
    </CustomStyledView>
  );
};

export default HomeScreen;
