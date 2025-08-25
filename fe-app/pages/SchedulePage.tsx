import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ErrorMessage from '../components/ErrorMessage';
import { apiAuthService } from '../api/apiAuth';
import { apiScheduleService, Schedule } from '../api/apiSchedule';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<any, 'SchedulePage'>;

const SchedulePage = ({ navigation }: Props) => {
  // State cho schedule
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userInfo = apiAuthService.getUserInfo();

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
      console.error('Error loading schedules in SchedulePage:', err);
      setError(err?.message || 'Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: string) => {
    switch (tab) {
      case 'home':
        navigation.navigate('DashBoardPage');
        break;
      case 'schedule':
        if (userInfo?.role === 'LECTURER') {
          navigation.navigate('TeachingSchedulePage');
        } else {
          navigation.navigate('SchedulePage');
        }
        break;
      case 'attendance':
        // đã ở đây
        break;
      case 'stats':
        navigation.navigate('StatsPage');
        break;
      case 'notification':
        navigation.navigate('NotificationPage');
        break;
      case 'profile':
        navigation.navigate('ProfilePage');
        break;
      default:
        break;
    }
  };

  const renderScheduleContent = () => (
    <ScrollView className="flex-1 p-4">
      {error ? (
        <TouchableOpacity onPress={() => setError('')} className="mb-4">
          <ErrorMessage text={error} />
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <View className="rounded-lg bg-gray-50 p-4">
          <Text className="text-center text-gray-500">Đang tải lịch học...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <View className="items-center rounded-lg bg-gray-50 p-4">
          <Text className="mb-3 text-center text-gray-500">Không có lịch học sắp tới</Text>
          <TouchableOpacity
            className="rounded-lg bg-blue-500 px-4 py-2"
            onPress={() => navigation.goBack()}>
            <Text className="text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        schedules.map((s) => (
          <View key={s.id} className="mb-3 rounded-lg bg-gray-50 p-3">
            <View className="mb-2 flex-row items-center">
              <MaterialIcons name="book" size={16} color="#6b7280" />
              <Text className="ml-2 font-medium text-gray-800">{s.subjectName}</Text>
            </View>
            <Text className="mb-1 text-sm text-gray-600">
              {s.startTime} - {s.endTime} | {s.classroomName} |{' '}
              {s.date ? new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'long' }) : ''}
            </Text>
            {s.lecturerName && (
              <Text className="mb-1 text-sm text-gray-600">Giảng viên: {s.lecturerName}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  return renderScheduleContent();
};

export default SchedulePage;
