
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
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      </SafeAreaView>
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPress={showMode}
        />
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {filteredClassesData.length > 0 ? (
          filteredClassesData.map(item => <ClassCard key={item.id} item={item} navigation={navigation} />)
        ) : (
          <Text style={styles.noDataText}>Không có lớp học nào vào ngày này.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- StyleSheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateNavigatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateNavigatorCenter: {
    alignItems: 'center',
  },
  dateNavigatorToday: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  dateNavigatorDate: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardOpen: {
    borderColor: '#007BFF',
    borderWidth: 1.5,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardClass: {
    fontSize: 14,
    color: '#555',
  },
  cardIconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  cardStatusText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cardAttendanceText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  cardActionsOpen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDetailsLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  cardButtonClose: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cardButtonOpen: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardButtonTextWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AttendanceScreen;
