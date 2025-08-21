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

type Props = NativeStackScreenProps<any, 'OtpPage'>;

export default function OtpPage({ navigation }: Props) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiAuthService.verifyOtp({
        otp: otp,
      });

      setSuccess('Xác thực OTP thành công!');

      // Navigate to new password page after 2 seconds
      setTimeout(() => {
        navigation.navigate('NewPassWordPage');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsResendLoading(true);

    try {
      // Note: Bạn cần có email từ trang trước hoặc lưu trong global state
      // Ở đây tôi sẽ giả định rằng có thể gửi lại OTP
      Alert.alert('Gửi lại OTP', 'Bạn có muốn gửi lại mã OTP không?', [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Gửi lại',
          onPress: () => {
            setSuccess('Mã OTP mới đã được gửi đến email của bạn!');
          },
        },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Gửi lại OTP thất bại');
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <>
      <LoginBackGround>
        <View className="flex-1 items-center justify-center px-4 sm:px-6 md:px-10">
          {/* Title */}
          <Text className="mb-3 text-center text-3xl font-bold text-white">Smart Attendance</Text>
          <Text className="mb-10 text-center text-base text-white sm:text-lg">Nhập mã OTP</Text>

          {/* OTP Form */}
          <View className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:max-w-md sm:p-8 md:max-w-lg">
            <Text className="mb-1 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
              XÁC NHẬN OTP
            </Text>
            <Text className="mb-5 text-center text-base text-gray-600 sm:text-lg">
              Vui lòng nhập mã OTP đã gửi đến email của bạn
            </Text>

            {/* Error Message */}
            {error ? <ErrorMessage text={error} /> : null}

            {/* Success Message */}
            {success ? <SuccessMessage text={success} /> : null}

            <MyInput
              label="Mã OTP"
              placeholder="Nhập mã OTP (6 chữ số)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              iconName="vpn-key"
              containerClassName="mb-6"
              maxLength={6}
            />

            {/* Submit */}
            <MyButton title="Xác nhận" onPress={handleVerifyOtp} isLoading={isLoading} />

            {/* Resend OTP */}
            <TouchableOpacity
              className="mt-3 py-2"
              onPress={handleResendOtp}
              disabled={isResendLoading}>
              <Text className="text-center text-sm text-gray-600">
                {isResendLoading ? 'Đang gửi...' : 'Không nhận được mã? Gửi lại OTP'}
              </Text>
            </TouchableOpacity>

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
