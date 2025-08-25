import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayoutLecturer from './DashBoardLayoutLecturer';
import { apiAuthService } from '../../api/apiAuth';
import React, { useState, useEffect } from 'react';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';

type Props = NativeStackScreenProps<any, 'DashBoardPageLecturer'>;

const DashBoardPageLecturer = ({ navigation }: Props) => {
  const userInfo = apiAuthService.getUserInfo();
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      setScheduleError(null);
      try {
        const token = apiAuthService.getAuthToken();
        if (!token) {
          setScheduleError('Authentication token not found.');
          setLoadingSchedules(false);
          return;
        }
        apiScheduleService.setAuthToken(token);
        const response = await apiScheduleService.getMySchedule();
        setSchedules(response.schedules);
      } catch (err) {
        console.error('Error fetching schedules for dashboard:', err);
        setScheduleError("Failed to load today's schedule.");
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  const getUserName = () => {
    if (!userInfo) return 'Người dùng';
    return (userInfo as any).name || 'Giảng viên';
  };

  const getUserCode = () => {
    if (!userInfo) return 'N/A';
    return (userInfo as any).lecturerCode || 'N/A';
  };

  const getUserClass = () => {
    if (!userInfo) return 'N/A';
    return (userInfo as any).academicRank || 'Giảng viên';
  };

  const handleLogout = async () => {
    Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiAuthService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      },
    ]);
  };

  const today = new Date();
  const todaySchedules = schedules
    .filter(schedule => {
      const studyDate = new Date(schedule.date);
      return (
        studyDate.getFullYear() === today.getFullYear() &&
        studyDate.getMonth() === today.getMonth() &&
        studyDate.getDate() === today.getDate()
      );
    })
    .map(schedule => ({
      id: schedule.id.toString(),
      subject: schedule.subjectName,
      className: (schedule as any).className || '',
      location: schedule.classroomName,
      time: `${schedule.startTime} - ${schedule.endTime}`,
      lecturer: schedule.lecturerName || '',
      topic: schedule.topic || 'Chưa có thông tin chủ đề',
      scheduleId: schedule.id,
      date: schedule.date,
    }))
    .sort((a, b) => {
      const timeA = a.time.split(' - ')[0];
      const timeB = b.time.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });

  const renderHomeContent = () => (
    <ScrollView className="flex-1 px-4 py-4">
      <View className="mb-4 rounded-2xl bg-blue-500 p-6 shadow-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="mb-1 text-lg font-bold text-white">Xin chào, {getUserName()}!</Text>
            <Text className="mb-3 text-sm text-blue-100">
              {getUserCode()} | {getUserClass()}
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-white opacity-80">Hôm nay</Text>
                <Text className="text-lg font-semibold text-white">{currentDate}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="rounded-full bg-white/20 p-2"
            onPress={handleLogout}
            activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="schedule" size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Lịch dạy hôm nay</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SchedulePageLecturer')}> 
            <Text className="text-sm text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loadingSchedules ? (
          <Text className="text-center text-gray-500 text-base">Đang tải lịch dạy...</Text>
        ) : scheduleError ? (
          <Text className="text-center text-red-500 text-base">Lỗi: {scheduleError}</Text>
        ) : todaySchedules.length > 0 ? (
          todaySchedules.map(item => (
            <View key={item.id} className="mb-3 rounded-lg bg-gray-50 p-3">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="book" size={16} color="#6b7280" />
                <Text className="ml-2 font-medium text-gray-800">{item.subject}</Text>
              </View>
              <Text className="mb-1 text-sm text-gray-600">{item.time} | {item.location}</Text>
              <Text className="mb-1 text-sm text-gray-600">Lớp: {item.className}</Text>
              <Text className="mb-3 text-sm text-gray-600">
                Chủ đề: {item.topic}
              </Text>

              <TouchableOpacity
                className="rounded-lg bg-black py-3"
                onPress={() => navigation.navigate('AttendancePageLecturer', {
                  className: item.className,
                  scheduleId: item.scheduleId,
                  date: item.date,
                })}>
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="camera" size={18} color="white" />
                  <Text className="ml-2 font-medium text-white">Điểm danh</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-500 text-base">Không có lịch dạy hôm nay.</Text>
        )}
      </View>

      <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="notifications" size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Thông báo mới</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationPageLecturer')}> 
            <Text className="text-sm text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-lg bg-gray-50 p-3">
          <Text className="mb-1 font-medium text-gray-800">Thông báo thay đổi lịch dạy</Text>
          <Text className="text-sm text-gray-600">
            Lớp lập trình web ngày 25/01 chuyển từ phòng TC-201 sang phòng TC-202
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <DashBoardLayoutLecturer>
      {renderHomeContent()}
    </DashBoardLayoutLecturer>
  );
};

export default DashBoardPageLecturer;