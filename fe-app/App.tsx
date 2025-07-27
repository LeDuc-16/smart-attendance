import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import LoginPage from './pages/LoginPage';
import ForgetPassPage from './pages/ForgetPassPage';
import OtpPage from './pages/OtpPage';
import RegisterFacePage from './pages/RegisterFacePage';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Test component để kiểm tra NativeWind
function TestNativeWind() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Welcome to Nativewind!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Ẩn header để giữ UI clean
        }}>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="ForgetPass" component={ForgetPassPage} />
        <Stack.Screen name="OtpPage" component={OtpPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
