import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpPage'>;

export default function OtpPage({ navigation }: Props) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Thành công', 'Xác thực thành công!');
    }, 2000);
  };

  return (
    <>
      <View className="flex-1 bg-blue-900">
        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-10">
          <View className="absolute -left-36 -top-36 h-72 w-72 rounded-full bg-white" />
          <View className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-white" />
        </View>

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

            <MyInput
              label="Mã OTP"
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              iconName="vpn-key"
              containerClassName="mb-6"
            />

            {/* Submit */}
            <MyButton title="Xác nhận" onPress={handleVerifyOtp} isLoading={isLoading} />

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
      </View>

      <StatusBar style="light" />
    </>
  );
}
