import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashBoardLayout from './DashBoarLayout';
import { apiScheduleService, Schedule } from '../api/apiSchedule';
import { apiAuthService } from '../api/apiAuth';
import { apiFaceService } from '../api/apiFace';

type Props = NativeStackScreenProps<any, 'StudentPage'>;

// Helper copied from Api services to resolve correct backend host in dev
const resolveBaseURL = () => {
  const envBaseURL =
    process.env.REACT_NATIVE_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

  if (process.env.NODE_ENV === 'production') {
    return envBaseURL || 'http://14.225.210.41:8080';
  }

  try {
    const Constants = require('expo-constants').default;
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || '';
    const lanHost = hostUri ? hostUri.split(':')[0] : '192.168.11.105';
    const LAN_BASE_URL = `http://${lanHost}:8080`;
    const ANDROID_LOCALHOST = 'http://10.0.2.2:8080';
    const IOS_LOCALHOST = 'http://localhost:8080';
    const Platform = require('react-native').Platform;

    if (Platform.OS === 'android' && !hostUri) return ANDROID_LOCALHOST;
    if (Platform.OS === 'ios' && !hostUri) return IOS_LOCALHOST;
    return envBaseURL || LAN_BASE_URL;
  } catch (e) {
    return envBaseURL || 'http://localhost:8080';
  }
};

const StudentPage = ({ navigation }: Props) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>('');
  const [capturingScheduleId, setCapturingScheduleId] = useState<number | null>(null);
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    loadSchedules();
  }, []);

  const ensurePermission = async () => {
    if (!permission || !permission.granted) await requestPermission();
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (token) apiScheduleService.setAuthToken(token);
      const res = await apiScheduleService.getUpcomingSchedules();
      setSchedules(res || []);
    } catch (err: any) {
      console.error('Error loading schedules in StudentPage:', err);
      setError(err?.message || 'Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const startCapture = async (scheduleId: number) => {
    setError('');
    await ensurePermission();
    setCapturingScheduleId(scheduleId);
  };

  const cancelCapture = () => {
    setCapturingScheduleId(null);
  };

  const captureAndSend = async (scheduleId: number) => {
    try {
      setSending(true);
      setError('');
      if (!cameraRef.current) throw new Error('Camera not ready');

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo || !photo.uri) throw new Error('Không có ảnh được chụp');

      // prepare auth
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (!token) throw new Error('JWT token không tồn tại');

      // Get studentId from stored user info
      const userInfo: any = apiAuthService.getUserInfo();
      if (!userInfo || !userInfo.id) throw new Error('Không lấy được thông tin sinh viên');
      const studentId = userInfo.id;

      const baseURL = resolveBaseURL();
      const url = `${baseURL}/api/v1/student-faces/${studentId}/attendance?scheduleId=${scheduleId}`;

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        name: `attendance-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const raw = await resp.text();
      if (!resp.ok) {
        try {
          const parsed = JSON.parse(raw);
          throw new Error(parsed.message || `Điểm danh thất bại (${resp.status})`);
        } catch (e: any) {
          throw new Error(raw || `Điểm danh thất bại (${resp.status})`);
        }
      }

      const json = JSON.parse(raw);
      // success
      Alert.alert('Thành công', 'Điểm danh thành công');
      setCapturingScheduleId(null);
      // refresh schedules to reflect any state changes
      await loadSchedules();
    } catch (err: any) {
      console.error('Attendance error:', err);
      setError(err?.message || 'Điểm danh thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const content = (
    <ScrollView className="flex-1 p-4">
      {error ? (
        <TouchableOpacity onPress={() => setError('')} className="mb-4">
          <Text className="text-red-600">{error}</Text>
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <View className="rounded-lg bg-gray-50 p-4">
          <Text className="text-center text-gray-500">Đang tải lịch học...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <View className="items-center rounded-lg bg-gray-50 p-4">
          <Text className="mb-3 text-center text-gray-500">Không có lịch học sắp tới</Text>
        </View>
      ) : (
        schedules.map((s) => (
          <View key={s.id} className="mb-3 rounded-lg bg-gray-50 p-3">
            <Text className="font-medium text-gray-800">{s.subjectName}</Text>
            <Text className="text-sm text-gray-600">
              {s.startTime} - {s.endTime} | {s.classroomName}
            </Text>
            {s.lecturerName ? (
              <Text className="text-sm text-gray-600">Giảng viên: {s.lecturerName}</Text>
            ) : null}

            {capturingScheduleId === s.id ? (
              <View className="mt-3 h-80 w-full overflow-hidden rounded-lg bg-black">
                {!permission?.granted ? (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Ứng dụng cần quyền camera</Text>
                  </View>
                ) : (
                  <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
                    <View className="absolute bottom-3 w-full items-center">
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          className="rounded-2xl bg-gray-400 px-4 py-2"
                          onPress={cancelCapture}
                          disabled={sending}>
                          <Text>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-2xl bg-blue-600 px-4 py-2"
                          onPress={() => captureAndSend(s.id)}
                          disabled={sending}>
                          {sending ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <Text className="text-white">Chụp & Gửi</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </CameraView>
                )}
              </View>
            ) : (
              <View className="mt-3 flex-row items-center justify-between">
                {s.isOpen === false ? (
                  <View className="flex-1">
                    <TouchableOpacity className="rounded-2xl bg-gray-300 p-3" disabled={true}>
                      <Text className="text-center text-gray-600">Điểm danh (chưa mở)</Text>
                    </TouchableOpacity>
                    <Text className="mt-2 text-sm text-red-600">
                      Hiện tại giảng viên chưa mở điểm danh
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-1 rounded-2xl bg-green-600 p-3"
                    onPress={() => startCapture(s.id)}>
                    <Text className="text-center text-white">Điểm danh</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <DashBoardLayout activeTab="attendance" headerTitle="Điểm danh" headerSubtitle="Sinh viên">
      {content}
    </DashBoardLayout>
  );
};

export default StudentPage;
