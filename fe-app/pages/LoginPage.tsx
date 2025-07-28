import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';
import { RootStackParamList } from '../types/navigation';
import LoginBackGround from './LoginBackGround';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginPage({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('FaceRegisterPage'); // Navigate to Face Register Page after login
    }, 2000);
  };

  return (
    <>
      <LoginBackGround>
        <View className="flex-1 items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Title */}
          <Text className="mb-2 text-center text-2xl font-bold text-white sm:mb-3 sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl">
            Smart Attendance
          </Text>
          <Text className="mb-8 text-center text-sm text-white sm:mb-10 sm:text-base md:mb-12 md:text-lg lg:text-xl">
            Điểm danh thông minh
          </Text>

          {/* Login Form */}
          <View className="w-full max-w-xs rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:max-w-sm sm:rounded-3xl sm:p-6 md:max-w-md md:p-8 lg:max-w-lg lg:p-10 xl:max-w-xl">
            <Text className="mb-1 text-center text-xl font-bold text-gray-800 sm:mb-2 sm:text-2xl md:mb-3 md:text-3xl lg:text-4xl">
              ĐĂNG NHẬP
            </Text>
            <Text className="mb-4 text-center text-sm text-gray-600 sm:mb-5 sm:text-base md:mb-6 md:text-lg lg:text-xl">
              Chào mừng bạn trở lại
            </Text>

            {/* Email Input */}
            <MyInput
              label="Tài khoản"
              placeholder="Nhập tài khoản"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              iconName="email"
            />

            {/* Password Input */}
            <MyInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              iconName="lock"
              rightIcon={showPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              containerClassName="mb-3"
            />

            {/* Forgot Password */}
            <TouchableOpacity
              className="mb-4 sm:mb-6 md:mb-8"
              onPress={() => navigation.navigate('ForgetPass')}>
              <Text className="text-right text-sm font-medium text-blue-600 sm:text-base md:text-lg">
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <MyButton title="Đăng nhập" onPress={handleLogin} isLoading={isLoading} />
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-0 w-full items-center justify-center p-2 sm:p-4 md:p-6">
          <Text className="text-xs text-white sm:text-sm md:text-base">
            © 2025 Trường Đại Học Thủy Lợi
          </Text>
        </View>

        <StatusBar style="light" />
      </LoginBackGround>
    </>
  );
}