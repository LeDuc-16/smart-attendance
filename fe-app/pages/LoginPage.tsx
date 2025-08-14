import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MyInput from '../components/MyInput';
import MyButton from '../components/MyButton';
import Error from '../components/Error';
import { RootStackParamList } from '../types/navigation';
import LoginBackGround from './LoginBackGround';
import { apiAuthService } from '../services/api/apiAuthService';
import { apiFaceRegisterService } from '../services/api/apiFaceRegisterService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginPage({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    // Clear previous error
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API login thực tế
      const authResponse = await apiAuthService.login({
        account: email,
        password: password,
      });

      console.log('Login successful:', authResponse);

      // Kiểm tra xem user đã đăng ký face chưa
      if (authResponse.access_token) {
        // Set token cho face service
        apiFaceRegisterService.setAuthToken(authResponse.access_token);

        try {
          const faceRegistrationStatus = await apiFaceRegisterService.checkFaceRegistration();

          if (faceRegistrationStatus.hasRegistered) {
            // Đã đăng ký face, chuyển đến main app hoặc dashboard
            Alert.alert('Đăng nhập thành công', `Chào mừng ${faceRegistrationStatus.userName}!`, [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('DashBoardPage'); // Chuyển đến trang Dashboard
                },
              },
            ]);
          } else {
            // Chưa đăng ký face, chuyển đến trang đăng ký face
            Alert.alert(
              'Chưa đăng ký khuôn mặt',
              'Bạn cần đăng ký khuôn mặt để sử dụng tính năng điểm danh',
              [
                {
                  text: 'Đăng ký ngay',
                  onPress: () => navigation.navigate('FaceRegisterPage'),
                },
                {
                  text: 'Để sau',
                  style: 'cancel',
                },
              ]
            );
          }
        } catch (faceCheckError) {
          console.error('Face check error:', faceCheckError);
          // Nếu lỗi khi check face, vẫn cho chuyển đến đăng ký face
          navigation.navigate('FaceRegisterPage');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
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
