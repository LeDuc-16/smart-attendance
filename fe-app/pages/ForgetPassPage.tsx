import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import LoginBackGround from './LoginBackGround';
import { apiAuthService } from '../api/apiAuth';

type Props = NativeStackScreenProps<any, 'ForgetPass'>;
export default function ForgetPassPage({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Định dạng email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiAuthService.forgotPassword({
        email: email,
      });

      console.log('Forgot password response:', response);

      setSuccess('Email đặt lại mật khẩu đã được gửi thành công!');

      // Navigate to OTP page with the OTP from response
      setTimeout(() => {
        navigation.navigate('OtpPage', {
          otp: response.otp, // OTP từ API response
          email: email,
        });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Gửi email thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoginBackGround>
        <View className="flex-1 items-center justify-center px-4 sm:px-6 md:px-10">
          {/* Title */}
          <Text className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl">
            Smart Attendance
          </Text>
          <Text className="mb-10 text-center text-base text-white sm:text-lg">
            Khôi phục mật khẩu
          </Text>

          {/* Reset Form */}
          <View className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:max-w-md sm:p-8 md:max-w-lg">
            <Text className="text-dark mb-1 text-center text-2xl font-bold sm:text-3xl">
              QUÊN MẬT KHẨU
            </Text>
            <Text className="mb-5 text-center text-base text-gray-600 sm:text-lg">
              Nhập email để đặt lại mật khẩu
            </Text>

            {/* Error Message */}
            {error ? <ErrorMessage text={error} /> : null}

            {/* Success Message */}
            {success ? <SuccessMessage text={success} /> : null}

            {/* Email Input */}
            <MyInput
              label="Email"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              iconName="email"
              containerClassName="mb-6"
            />

            <MyButton
              title="Gửi email đặt lại"
              isLoading={isLoading}
              onPress={handleForgotPassword}
            />

            {/* Back to Login */}
            <TouchableOpacity className="mt-1" onPress={() => navigation.goBack()}>
              <Text className="text-center font-medium text-blue-600">← Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-0 w-full items-center justify-center p-2 sm:p-4">
          <Text className="text-xs text-white sm:text-sm">© 2025 Trường Đại Học Thủy Lợi</Text>
        </View>
      </LoginBackGround>
      <StatusBar style="light" />
    </>
  );
}
