import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import LoginBackGround from './LoginBackGround';
import { apiFaceService } from '../../api/apiFace';

type RouteParams = {
  schedule?: any;
  scheduleId?: number;
  className?: string;
  subjectName?: string;
};

const QuickAttendancePage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const cameraRef = useRef<any>(null);

  const [image, setImage] = useState<{ uri: string; type?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const ensurePermission = async () => {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
    };
    ensurePermission();
  }, [permission, requestPermission]);

  const captureImage = async () => {
    setError('');
    try {
      if (!permission?.granted) {
        await requestPermission();
        return;
      }

      if (!cameraRef.current) {
        setError('Camera chưa sẵn sàng. Vui lòng thử lại.');
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo.uri) {
        setError('Không thể chụp ảnh. Vui lòng thử lại.');
        return;
      }

      setImage({
        uri: photo.uri,
        type: 'image/jpeg',
        name: `attendance-${Date.now()}.jpg`,
      });
    } catch (err) {
      console.error('Capture error:', err);
      setError('Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const retakeImage = () => {
    setImage(null);
    setError('');
  };

  const submitAttendance = async () => {
    if (!image) {
      setError('Vui lòng chụp ảnh trước khi điểm danh.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get auth token
      const { apiAuthService } = await import('../../api/apiAuth');
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (!token) {
        throw new Error('Bạn cần đăng nhập để điểm danh.');
      }

      // Validate scheduleId is available - use sourceId for backend API calls
      const scheduleId = params?.schedule?.sourceId || params?.scheduleId || params?.schedule?.id;
      if (!scheduleId) {
        throw new Error('Không tìm thấy thông tin lịch học. Vui lòng thử lại.');
      }

      console.log(
        'Using scheduleId for attendance:',
        scheduleId,
        'from schedule:',
        params?.schedule
      );

      // Call attendance API with scheduleId
      apiFaceService.setAuthToken(token);
      const result = await apiFaceService.markAttendance(parseInt(scheduleId.toString()), {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name || `attendance-${Date.now()}.jpg`,
      });

      console.log('Attendance result:', result);

      // Navigate to success page with attendance info
      navigation.navigate('SuccessAttendancePage', {
        scheduleId: scheduleId,
        className: params?.className || params?.schedule?.classroomName,
        subjectName: params?.subjectName || params?.schedule?.subjectName,
        attendanceTime: new Date().toISOString(),
        studentName: result.studentName,
      });
    } catch (err: any) {
      console.error('Attendance error:', err);
      let errorMessage = err?.message || 'Điểm danh thất bại. Vui lòng thử lại.';

      // Handle specific error cases
      if (errorMessage.includes('Face not found') || errorMessage.includes('không tìm thấy')) {
        errorMessage = 'Không nhận diện được khuôn mặt. Vui lòng chụp lại ảnh rõ hơn.';
      } else if (errorMessage.includes('not registered') || errorMessage.includes('chưa đăng ký')) {
        errorMessage = 'Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước khi điểm danh.';
      } else if (errorMessage.includes('studyDay') && errorMessage.includes('null')) {
        errorMessage = 'Lịch học không khả dụng để điểm danh. Giảng viên chưa mở lớp điểm danh.';
      } else if (errorMessage.includes('Hôm nay không có lịch học')) {
        errorMessage = 'Hôm nay không có lịch học cho môn này.';
      } else if (errorMessage.includes('quá 5 phút')) {
        errorMessage = 'Đã quá thời gian điểm danh cho lớp học này.';
      } else if (errorMessage.includes('Hôm nay không phải ngày học')) {
        errorMessage = 'Hôm nay không phải ngày học trong lịch của môn này.';
      } else if (errorMessage.includes('IllegalStateException')) {
        errorMessage = 'Lớp học chưa được mở để điểm danh. Vui lòng đợi giảng viên mở lớp.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <LoginBackGround>
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-center text-white">Đang khởi tạo camera...</Text>
        </View>
      </LoginBackGround>
    );
  }

  if (!permission.granted) {
    return (
      <LoginBackGround>
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="camera-alt" size={64} color="white" />
          <Text className="mt-4 text-center text-xl font-bold text-white">
            Cần quyền truy cập camera
          </Text>
          <Text className="mt-2 text-center text-white">
            Ứng dụng cần quyền camera để chụp ảnh điểm danh
          </Text>
          <TouchableOpacity
            className="mt-6 rounded-full bg-blue-600 px-8 py-3"
            onPress={requestPermission}>
            <Text className="font-medium text-white">Cấp quyền camera</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-4 rounded-full bg-gray-600 px-8 py-3" onPress={goBack}>
            <Text className="font-medium text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </LoginBackGround>
    );
  }

  return (
    <LoginBackGround>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack} className="mr-4 rounded-full bg-white/20 p-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Điểm danh</Text>
              {(params?.subjectName || params?.schedule?.subjectName) && (
                <Text className="text-white/80">
                  {params?.subjectName || params?.schedule?.subjectName}
                </Text>
              )}
              {(params?.className || params?.schedule?.classroomName) && (
                <Text className="text-white/80">
                  Lớp: {params?.className || params?.schedule?.classroomName}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="mb-4 rounded-lg bg-red-500/90 p-4">
            <Text className="text-center text-white">{error}</Text>
          </View>
        ) : null}

        {/* Camera or Image Preview */}
        <View className="mb-6 flex-1 overflow-hidden rounded-2xl bg-black">
          {image ? (
            // Show captured image
            <View className="flex-1">
              <Image source={{ uri: image.uri }} className="flex-1" resizeMode="cover" />
              <View className="absolute bottom-4 left-4 right-4">
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="rounded-full bg-gray-600/80 px-6 py-3"
                    onPress={retakeImage}
                    disabled={loading}>
                    <Text className="font-medium text-white">Chụp lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-full bg-green-600/80 px-6 py-3"
                    onPress={submitAttendance}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="font-medium text-white">Điểm danh</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            // Show camera
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
              {/* Camera instructions overlay */}
              <View className="absolute left-6 right-6 top-6">
                <View className="rounded-lg bg-black/50 p-4">
                  <Text className="text-center font-medium text-white">
                    Đặt khuôn mặt vào khung hình
                  </Text>
                  <Text className="mt-1 text-center text-white/80">
                    Đảm bảo ánh sáng đầy đủ và nhìn thẳng vào camera
                  </Text>
                </View>
              </View>

              {/* Face frame guide */}
              <View className="absolute inset-0 items-center justify-center">
                <View className="h-64 w-64 rounded-full border-4 border-dashed border-white/50" />
              </View>

              {/* Capture button */}
              <View className="absolute bottom-8 left-0 right-0 items-center">
                <TouchableOpacity
                  className="h-16 w-16 rounded-full border-4 border-white bg-white/20"
                  onPress={captureImage}
                  disabled={loading}>
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons name="camera" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>

        {/* Instructions */}
        <View className="rounded-lg bg-white/10 p-4">
          <Text className="text-center font-medium text-white">
            {image ? 'Kiểm tra ảnh và nhấn "Điểm danh"' : 'Nhấn nút camera để chụp ảnh'}
          </Text>
          <Text className="mt-1 text-center text-sm text-white/80">
            {image
              ? 'Có thể chụp lại nếu ảnh không rõ'
              : 'Đảm bảo khuôn mặt rõ ràng và đầy đủ ánh sáng'}
          </Text>
        </View>
      </View>
    </LoginBackGround>
  );
};

export default QuickAttendancePage;
