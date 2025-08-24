import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiAuthService } from '../api/apiAuth';
import LoginBackGround from './LoginBackGround';
import { StatusBar } from 'expo-status-bar';
import { apiFaceService } from '../api/apiFace';

const AttendancePage = () => {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [attendanceCompleted, setAttendanceCompleted] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    } else {
      createLivenessSession();
    }
  }, [permission]);

  const createLivenessSession = async () => {
    try {
      // Prefer in-memory token first to avoid AsyncStorage race
      let token = apiAuthService.getAuthToken();
      if (!token) {
        token = await AsyncStorage.getItem('jwtToken');
      }
      if (!token) {
        throw new Error('JWT token không tồn tại. Vui lòng đăng nhập lại.');
      }
      apiFaceService.setAuthToken(token);

      const response = await apiFaceService.createLivenessSession();
      setSessionId(response.sessionId);
      Alert.alert(
        'Thành công',
        'Phiên liveness đã được tạo. Vui lòng thực hiện kiểm tra khuôn mặt.'
      );
    } catch (error) {
      console.error('Liveness session error:', error);
      Alert.alert('Lỗi', 'Không thể tạo phiên liveness. Vui lòng thử lại.');
    }
  };

  const markAttendance = async () => {
    if (!cameraRef.current || !sessionId) return;

    try {
      setIsProcessing(true);
      setFaceDetected(false);

      // Chụp ảnh từ camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo) {
        setFaceDetected(true);

        // Giả sử liveness check thành công (nếu tích hợp AWS Amplify Face Liveness, thay bằng logic thực tế)
        let token = apiAuthService.getAuthToken();
        if (!token) {
          token = await AsyncStorage.getItem('jwtToken');
        }
        if (!token) throw new Error('JWT token không tồn tại. Vui lòng đăng nhập lại.');
        apiFaceService.setAuthToken(token);

        const imageFile = { uri: photo.uri, type: 'image/jpeg', name: 'face.jpg' };
        const response = await apiFaceService.compareFace(imageFile as any);
        setAttendanceCompleted(true);

        Alert.alert(
          'Điểm danh thành công!',
          `Xin chào ${response.studentName}! Điểm danh đã được ghi nhận.`,
          [
            {
              text: 'Xem chi tiết',
              onPress: () => {
                Alert.alert('Chi tiết điểm danh', JSON.stringify(response, null, 2));
              },
            },
            {
              text: 'Đóng',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Attendance error:', error);
      Alert.alert('Lỗi', 'Không thể điểm danh. Vui lòng thử lại hoặc đăng ký khuôn mặt.', [
        {
          text: 'Thử lại',
          onPress: () => setIsProcessing(false),
        },
        {
          text: 'Đăng ký khuôn mặt',
          onPress: () => navigation.navigate('FaceRegisterPage'),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LoginBackGround>
        <View className="flex-1 items-center justify-center px-4">
          <View className="rounded-2xl bg-white/95 p-6 shadow-2xl">
            <Text className="mb-4 text-center text-lg font-bold text-gray-800">
              Cần quyền truy cập camera
            </Text>
            <Text className="mb-6 text-center text-gray-600">
              Ứng dụng cần quyền truy cập camera để thực hiện điểm danh bằng khuôn mặt
            </Text>
            <TouchableOpacity
              className="rounded-xl bg-blue-600 px-6 py-3"
              onPress={requestPermission}>
              <Text className="text-center font-bold text-white">Cấp quyền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LoginBackGround>
    );
  }

  return (
    <LoginBackGround>
      <View className="flex-1">
        {/* Header */}
        <View className="absolute left-4 right-4 top-12 z-10">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="rounded-full bg-black/50 p-3"
              onPress={() => navigation.goBack()}>
              <Text className="text-lg text-white">←</Text>
            </TouchableOpacity>
            <View className="rounded-2xl bg-black/50 px-4 py-2">
              <Text className="text-center text-lg font-bold text-white">Điểm danh</Text>
            </View>
            <View className="w-12" />
          </View>
        </View>

        {/* Camera View */}
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="front"
            animateShutter={false}
          />

          {/* Face detection overlay */}
          {faceDetected && (
            <View className="absolute inset-0 items-center justify-center">
              <View className="h-64 w-64 rounded-full border-4 border-green-400 bg-green-400/20" />
              <Text className="mt-4 text-lg font-bold text-green-400">Đã phát hiện khuôn mặt</Text>
            </View>
          )}

          {/* Processing overlay */}
          {isProcessing && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <View className="rounded-2xl bg-white p-6">
                <Text className="mb-4 text-center text-lg font-bold">
                  {faceDetected ? 'Đang xử lý điểm danh...' : 'Đang chụp ảnh...'}
                </Text>
                <View className="h-2 w-48 rounded-full bg-gray-200">
                  <View className="h-2 w-24 rounded-full bg-blue-600" />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-8 left-4 right-4">
          <View className="items-center">
            {/* Status */}
            <View className="mb-4 rounded-2xl bg-white/95 px-4 py-2">
              <View className="flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                <Text className="text-sm font-medium text-gray-800">
                  {sessionId ? 'Hệ thống sẵn sàng điểm danh' : 'Đang tạo phiên liveness...'}
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              className={`h-20 w-20 items-center justify-center rounded-full border-4 border-white ${
                isProcessing ? 'bg-gray-400' : 'bg-blue-600'
              } shadow-lg`}
              onPress={markAttendance}
              disabled={isProcessing || !sessionId}>
              <Text className="text-center text-sm font-bold text-white">
                {isProcessing ? 'Đang xử lý' : 'Điểm danh'}
              </Text>
            </TouchableOpacity>

            {/* Instructions */}
            <Text className="mt-4 text-center text-sm text-white">
              {attendanceCompleted
                ? 'Điểm danh hoàn tất!'
                : 'Nhìn vào camera và nhấn nút để điểm danh'}
            </Text>
          </View>
        </View>
      </View>

      <StatusBar style="light" />
    </LoginBackGround>
  );
};

export default AttendancePage;
