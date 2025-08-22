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

type Props = NativeStackScreenProps<any, 'NewPassWordPage'>;

export default function NewPassWordPage({ navigation, route }: Props) {
  const { otpCode } = route.params || {}; // Chỉ cần otpCode
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ số';
    }
    return null;
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!otpCode) {
      setError('Mã OTP không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiAuthService.resetPassword({
        otpCode: otpCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      setSuccess('Đặt lại mật khẩu thành công!');

      // Navigate to login page after 2 seconds
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại');
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
            Đặt lại mật khẩu
          </Text>

          {/* Reset Password Form */}
          <View className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:max-w-md sm:p-8 md:max-w-lg">
            <Text className="mb-1 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
              MẬT KHẨU MỚI
            </Text>
            <Text className="mb-5 text-center text-base text-gray-600 sm:text-lg">
              Tạo mật khẩu mới cho tài khoản của bạn
            </Text>

            {/* Error Message */}
            {error ? <ErrorMessage text={error} /> : null}

            {/* Success Message */}
            {success ? <SuccessMessage text={success} /> : null}

            {/* Debug info - xóa sau khi test */}
            {__DEV__ && otpCode && (
              <View className="mb-2 rounded bg-blue-100 p-2">
                <Text className="text-xs text-blue-800">Debug: OTP Code = "{otpCode}"</Text>
              </View>
            )}

            {/* New Password Input */}
            <MyInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              iconName="lock"
              rightIcon={showNewPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowNewPassword(!showNewPassword)}
              containerClassName="mb-4"
            />

            {/* Confirm Password Input */}
            <MyInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              iconName="lock"
              rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              containerClassName="mb-6"
            />

            {/* Password Requirements */}
            <View className="mb-4 rounded-lg bg-gray-50 p-3">
              <Text className="mb-2 text-sm font-semibold text-gray-700">Yêu cầu mật khẩu:</Text>
              <Text className="text-xs text-gray-600">• Ít nhất 6 ký tự</Text>
              <Text className="text-xs text-gray-600">• Có chữ thường (a-z)</Text>
              <Text className="text-xs text-gray-600">• Có chữ hoa (A-Z)</Text>
              <Text className="text-xs text-gray-600">• Có số (0-9)</Text>
            </View>

            {/* Submit */}
            <MyButton
              title="Đặt lại mật khẩu"
              onPress={handleResetPassword}
              isLoading={isLoading}
            />

            {/* Back to Login */}
            <TouchableOpacity className="mt-4" onPress={() => navigation.navigate('Login')}>
              <Text className="text-center font-medium text-blue-600">← Về trang đăng nhập</Text>
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
