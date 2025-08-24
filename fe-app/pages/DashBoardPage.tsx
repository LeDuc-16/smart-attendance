import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { apiAuthService } from '../api/apiAuth';
import React, { useState, useEffect } from 'react';
import { apiScheduleService, Schedule } from '../api/apiScheduleService';

type Props = NativeStackScreenProps<any, 'DashBoardPage'>;

const DashBoardPage = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'
  >('home');

  // Get user info và current date
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
        const fetchedSchedules = await apiScheduleService.getSchedulesForLecturer();
        setSchedules(fetchedSchedules);
      } catch (err) {
        console.error('Error fetching schedules for dashboard:', err);
        setScheduleError('Failed to load today\'s schedule.');
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  // Helper functions để lấy thông tin theo role
  const getUserName = () => {
    if (!userInfo) return 'Người dùng';
    if (userInfo.role === 'STUDENT') {
      return (userInfo as any).studentName || 'Sinh viên';
    } else if (userInfo.role === 'LECTURER') {
      return (userInfo as any).name || 'Giảng viên';
    }
    return 'Người dùng';
  };

  const getUserCode = () => {
    if (!userInfo) return 'N/A';
    if (userInfo.role === 'STUDENT') {
      return (userInfo as any).studentCode || 'N/A';
    } else if (userInfo.role === 'LECTURER') {
      return (userInfo as any).lecturerCode || 'N/A';
    }
    return 'N/A';
  };

  const getUserClass = () => {
    if (!userInfo) return 'N/A';
    if (userInfo.role === 'STUDENT') {
      return (userInfo as any).className || 'N/A';
    } else if (userInfo.role === 'LECTURER') {
      return (userInfo as any).academicRank || 'Giảng viên';
    }
    return 'N/A';
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);
  };

  const handleProfilePress = () => {
    Alert.alert('Tài khoản', 'Bạn muốn làm gì?', [
      {
        text: 'Đăng ký khuôn mặt',
        onPress: () => navigation.navigate('FaceRegisterPage'),
      },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: handleLogout,
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ]);
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
            // Gọi API logout
            await apiAuthService.logout();

            // Reset navigation stack và về trang Login
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
  const todaySchedules = schedules.flatMap(schedule => {
    const relevantStudyDays = schedule.weeks.flatMap(week =>
      week.studyDays.filter(studyDay => {
        const studyDate = new Date(studyDay.date);
        return (
          studyDate.getFullYear() === today.getFullYear() &&
          studyDate.getMonth() === today.getMonth() &&
          studyDate.getDate() === today.getDate()
        );
      })
    );

    return relevantStudyDays.map(studyDay => ({
      id: `${schedule.id}-${studyDay.date}`,
      subject: schedule.courseName,
      className: schedule.className,
      location: schedule.roomName,
      time: `${schedule.startTime.substring(0, 5)} - ${schedule.endTime.substring(0, 5)}`,
      lecturer: schedule.lecturerName,
      topic: 'Chưa có thông tin chủ đề', // Placeholder, as topic is not in API
      scheduleId: schedule.id, // Pass original schedule ID
      date: studyDay.date, // Pass date for navigation
    }));
  }).sort((a, b) => {
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  const renderHomeContent = () => (
    <ScrollView className="flex-1 px-4 py-4">
      {/* Welcome Card */}
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

          {/* Logout Button */}
          <TouchableOpacity
            className="rounded-full bg-white/20 p-2"
            onPress={handleLogout}
            activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="mb-4 flex-row gap-3"></View>

      {/* Schedule Section */}
      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="schedule" size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Lịch học hôm nay</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('TeachingSchedulePage')}> 
            <Text className="text-sm text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Class Item */}
        {loadingSchedules ? (
          <Text className="text-center text-gray-500 text-base">Đang tải lịch học...</Text>
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
              <Text className="mb-1 text-sm text-gray-600">Giảng viên: {item.lecturer}</Text>
              <Text className="mb-3 text-sm text-gray-600">
                Chủ đề: {item.topic}
              </Text>

              <TouchableOpacity
                className="rounded-lg bg-black py-3"
                onPress={() => navigation.navigate('StudentListPage', {
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
          <Text className="text-center text-gray-500 text-base">Không có lịch học hôm nay.</Text>
        )}

        {todaySchedules.length > 0 && (
          <TouchableOpacity className="items-center rounded-lg bg-gray-100 py-3" onPress={() => navigation.navigate('TeachingSchedulePage')}> 
            <Text className="text-sm text-gray-600">Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications Section */}
      <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="notifications" size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Thông báo mới</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-sm text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-lg bg-gray-50 p-3">
          <Text className="mb-1 font-medium text-gray-800">Thông báo thay đổi lịch học</Text>
          <Text className="text-sm text-gray-600">
            Lớp lập trình web ngày 25/01 chuyển từ phòng TC-201 sang phòng TC-202
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <DashBoardLayout
      activeTab={activeTab}
      onTabPress={handleTabPress}
      headerTitle="Smart Attendance"
      headerSubtitle="Giao diện chính"
      userRole={userInfo?.role as any}
      navigation={navigation as any}
    >
      {renderHomeContent()}
    </DashBoardLayout>
  );
};

export default DashBoardPage;