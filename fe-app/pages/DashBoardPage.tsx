import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { apiAuthService } from '../api/apiAuth';
import { apiScheduleService, Schedule } from '../api/apiScheduleService';
import ErrorMessage from '../components/ErrorMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

type Props = NativeStackScreenProps<any, 'DashBoardPage'>;

const DashBoardPage = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'
  >('home');

  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [error, setError] = useState<string>('');
  const [scheduleError, setScheduleError] = useState<string>('');

  // Get user info và current date
  const userInfo = apiAuthService.getUserInfo();
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Load schedules when component mounts
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      setError('');
      setScheduleError('');

      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (token) {
        apiScheduleService.setAuthToken(token);

        const [todayData, upcomingData] = await Promise.all([
          apiScheduleService.getTodaySchedules(),
          apiScheduleService.getUpcomingSchedules(),
        ]);

        setTodaySchedules(todayData);
        setUpcomingSchedules(upcomingData);
      } else {
        setScheduleError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
      }
    } catch (error: any) {
      console.error('Error loading schedules:', error);
      setScheduleError(error?.message || 'Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoadingSchedules(false);
    }
  };

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
            setError('');
            await apiAuthService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error: any) {
            console.error('Logout error:', error);
            setError(error?.message || 'Đăng xuất thất bại. Vui lòng thử lại.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      },
    ]);
  };

  const renderHomeContent = () => (
    <ScrollView className="flex-1 px-4 py-4">
      {/* Error Message (global) */}
      {error ? (
        <TouchableOpacity className="mb-4" onPress={() => setError('')} activeOpacity={0.7}>
          <ErrorMessage text={error} />
        </TouchableOpacity>
      ) : null}

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
          <TouchableOpacity
            className="rounded-full bg-white/20 p-2"
            onPress={handleLogout}
            activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Section */}
      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="schedule" size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Lịch học</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                setScheduleError('');
                loadSchedules();
              }}
              disabled={loadingSchedules}>
              <MaterialIcons
                name="refresh"
                size={18}
                color={loadingSchedules ? '#9ca3af' : '#2563eb'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SchedulePage')}>
              <Text className="text-sm text-blue-600">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error */}
        {scheduleError ? (
          <TouchableOpacity className="mb-3" onPress={() => setScheduleError('')} activeOpacity={0.7}>
            <ErrorMessage text={scheduleError} />
          </TouchableOpacity>
        ) : null}

        {/* Loading */}
        {loadingSchedules ? (
          <View className="rounded-lg bg-gray-50 p-4">
            <Text className="text-center text-gray-500">Đang tải lịch học...</Text>
          </View>
        ) : (
          <>
            {/* Today schedules */}
            {todaySchedules.length > 0 ? (
              <>
                <Text className="mb-2 font-semibold text-gray-700">Lịch học hôm nay</Text>
                {todaySchedules.map(item => (
                  <View key={item.id} className="mb-3 rounded-lg bg-gray-50 p-3">
                    <View className="mb-2 flex-row items-center">
                      <MaterialIcons name="book" size={16} color="#6b7280" />
                      <Text className="ml-2 font-medium text-gray-800">{item.subject}</Text>
                    </View>
                    <Text className="mb-1 text-sm text-gray-600">
                      {item.time} | {item.location}
                    </Text>
                    <Text className="mb-1 text-sm text-gray-600">Giảng viên: {item.lecturer}</Text>
                    <Text className="mb-3 text-sm text-gray-600">Chủ đề: {item.topic}</Text>

                    <TouchableOpacity
                      className="rounded-lg bg-black py-3"
                      onPress={() =>
                        navigation.navigate('StudentListPage', {
                          className: item.className,
                          scheduleId: item.scheduleId,
                          date: item.date,
                        })
                      }>
                      <View className="flex-row items-center justify-center">
                        <MaterialIcons name="camera" size={18} color="white" />
                        <Text className="ml-2 font-medium text-white">Điểm danh</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <Text className="text-center text-gray-500 text-base">Không có lịch học hôm nay.</Text>
            )}

            {/* Upcoming schedules */}
            {upcomingSchedules.length > 0 && (
              <>
                <Text className="mb-2 font-semibold text-gray-700">Lịch học sắp tới</Text>
                {upcomingSchedules.slice(0, 2).map(schedule => (
                  <View key={schedule.id} className="mb-3 rounded-lg bg-gray-50 p-3">
                    <View className="mb-2 flex-row items-center">
                      <MaterialIcons name="book" size={16} color="#6b7280" />
                      <Text className="ml-2 font-medium text-gray-800">{schedule.subjectName}</Text>
                    </View>
                    <Text className="mb-1 text-sm text-gray-600">
                      {schedule.startTime} - {schedule.endTime} | {schedule.classroomName} |{' '}
                      {new Date(schedule.date).toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </Text>
                    {schedule.lecturerName && (
                      <Text className="mb-1 text-sm text-gray-600">
                        Giảng viên: {schedule.lecturerName}
                      </Text>
                    )}
                    {schedule.topic && (
                      <Text className="mb-3 text-sm text-gray-600">Chủ đề: {schedule.topic}</Text>
                    )}
                    <TouchableOpacity
                      className="rounded-lg bg-black py-3"
                      onPress={() => navigation.navigate('SchedulePage')}>
                      <View className="flex-row items-center justify-center">
                        <MaterialIcons name="camera" size={18} color="white" />
                        <Text className="ml-2 font-medium text-white">Điểm danh</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

                {upcomingSchedules.length > 2 && (
                  <TouchableOpacity
                    className="items-center rounded-lg bg-gray-100 py-3"
                    onPress={() => navigation.navigate('SchedulePage')}>
                    <Text className="text-sm text-gray-600">
                      Còn {upcomingSchedules.length - 2} lớp học nữa {'>'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
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
