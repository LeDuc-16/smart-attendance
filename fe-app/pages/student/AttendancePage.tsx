import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ErrorMessage from '../../components/ErrorMessage';
import DashBoardLayout from './DashBoarLayout';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';
import { apiAuthService } from '../../api/apiAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<any, 'AttendancePage'>;

const AttendancePage = ({ navigation }: Props) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = apiAuthService.getUserInfo();
        let role;

        if (!user) {
          const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
          if (!token) return;
          const me = await apiAuthService.getCurrentUser();
          role = (me as any)?.role;
        } else {
          role = (user as any)?.role;
        }

        if (!role) return;

        if (role === 'STUDENT') {
          return;
        } else if (role === 'LECTURER') {
          navigation.navigate('DashBoardPageLecturer');
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    loadAllSchedules();
  }, []);

  const loadAllSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (token) apiScheduleService.setAuthToken(token);

      const res = await apiScheduleService.getMySchedule();
      setSchedules(res.schedules || []);
    } catch (err: any) {
      console.error('Error loading schedules in AttendancePage:', err);
      setError(err?.message || 'Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView className="flex-1 px-4 pt-4 bg-gray-100">
      {error ? (
        <TouchableOpacity onPress={() => setError('')} className="mb-4">
          <ErrorMessage text={error} />
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <View className="bg-white rounded-2xl shadow-md p-6 items-center">
          <Text className="text-lg text-gray-600 font-medium">Đang tải lịch học...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <View className="bg-white rounded-2xl shadow-md p-6 items-center">
          <Text className="text-lg text-gray-600 font-medium mb-4">Không có lịch học sắp tới</Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-lg px-6 py-3"
            onPress={() => navigation.goBack()}>
            <Text className="text-white font-semibold text-base">Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        schedules.map((s) => (
          <View
            key={s.id}
            className="bg-white rounded-2xl shadow-md p-5 mb-4 border-l-4 border-blue-500">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="book" size={20} color="#3b82f6" />
              <Text className="ml-3 text-lg font-bold text-gray-800">{s.subjectName}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="schedule" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-600">
                {s.startTime} - {s.endTime}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="room" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-600">{s.classroomName || s.className}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="event" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-600">
                {s.date
                  ? new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'long' })
                  : ''}
              </Text>
            </View>
            {s.lecturerName && (
              <View className="flex-row items-center mb-4">
                <MaterialIcons name="person" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm text-gray-600">Giảng viên: {s.lecturerName}</Text>
              </View>
            )}
            
            {/* Attendance Buttons */}
            <View className="mt-4 pt-4 border-t border-gray-200">
              {!s.isOpen ? (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color="#d97706" />
                    <Text className="ml-2 text-sm text-yellow-700 font-medium">
                      Chưa mở điểm danh
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-yellow-600">
                    Giảng viên chưa mở điểm danh cho lớp này
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="w-full bg-green-600 rounded-lg py-3 px-4"
                  onPress={() =>
                    navigation.navigate('QuickAttendancePage', {
                      schedule: s,
                      scheduleId: s.sourceId || s.id,
                      className: s.className,
                      subjectName: s.subjectName,
                    })
                  }>
                  <View className="flex-row items-center justify-center">
                    <MaterialIcons name="camera-alt" size={18} color="white" />
                    <Text className="ml-2 text-white font-semibold">Điểm danh</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <DashBoardLayout
      defaultActiveTab="attendance"
      headerTitle="Điểm danh"
      headerSubtitle="Danh sách lớp sắp tới">
      {content}
    </DashBoardLayout>
  );
};

export default AttendancePage;