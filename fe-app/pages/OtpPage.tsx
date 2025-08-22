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

export default function OtpPage({ navigation, route }: Props) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Lấy email từ route params
  const email = route.params?.email || '';

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError(`Mã OTP phải có 6 chữ số (hiện tại: ${trimmedOtp.length})`);
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError('Mã OTP chỉ được chứa số');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API verify OTP - chỉ cần otpCode
      const response = await apiAuthService.verifyOtp({
        otpCode: trimmedOtp,
      });

      console.log('OTP Verify response:', response);

      // API trả về OTP đúng, so sánh với input
      if (response.otp === trimmedOtp) {
        setSuccess('Xác thực OTP thành công!');
        setTimeout(() => {
          navigation.navigate('NewPassWordPage', {
            otpCode: trimmedOtp, // Backend dùng otpCode để tìm user
          });
        }, 1000);
      } else {
        setError('Mã OTP không chính xác. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsResendLoading(true);

    try {
      console.log('Resending OTP with email:', email);
      if (!email) {
        setError('Không tìm thấy email. Vui lòng quay lại trang đăng nhập.');
        return;
      }

      const response = await apiAuthService.forgotPassword({ email });
      console.log('Resend OTP response:', response);
      setSuccess('Mã OTP mới đã được gửi đến email của bạn!');
      navigation.setParams({ otp: response.otp });
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(`Gửi lại OTP thất bại: ${err.message || 'Không xác định'}`);
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <>
      <LoginBackGround>
        <View className="flex-1 items-center justify-center px-4 sm:px-6 md:px-10">
          <Text className="mb-3 text-center text-3xl font-bold text-white">Smart Attendance</Text>
          <Text className="mb-10 text-center text-base text-white sm:text-lg">Nhập mã OTP</Text>

          <View className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:max-w-md sm:p-8 md:max-w-lg">
            <Text className="mb-1 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
              XÁC NHẬN OTP
            </Text>
            <Text className="mb-5 text-center text-base text-gray-600 sm:text-lg">
              Vui lòng nhập mã OTP đã gửi đến email của bạn
            </Text>

            {error ? <ErrorMessage text={error} /> : null}
            {success ? <SuccessMessage text={success} /> : null}

            {/* Debug info - xóa sau khi test */}
            {__DEV__ && (
              <View className="mb-2 rounded bg-blue-100 p-2">
                <Text className="text-xs text-blue-800">Debug: Email = "{email}"</Text>
              </View>
            )}

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

            <MyButton title="Xác nhận" onPress={handleVerifyOtp} isLoading={isLoading} />

            <TouchableOpacity
              className="mt-3 py-2"
              onPress={handleResendOtp}
              disabled={isResendLoading}>
              <Text className="text-center text-sm text-gray-600">
                {isResendLoading ? 'Đang gửi...' : 'Không nhận được mã? Gửi lại OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-1" onPress={() => navigation.navigate('Login')}>
              <Text className="text-center font-medium text-blue-600">← Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="absolute bottom-0 w-full items-center justify-center p-2 sm:p-4">
          <Text className="text-xs text-white sm:text-sm">© 2025 Trường Đại Học Thủy Lợi</Text>
        </View>
      </LoginBackGround>

      <StatusBar style="light" />
    </>
  );
}
