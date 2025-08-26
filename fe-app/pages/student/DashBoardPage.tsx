import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { apiAuthService } from '../../api/apiAuth';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';
import ErrorMessage from '../../components/ErrorMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentScheduleCard } from './SchedulePage'; // Import StudentScheduleCard

type Props = NativeStackScreenProps<any, 'DashBoardPage'>;

interface DashboardScheduleItemProps {
  schedule: Schedule;
  navigation: any; // Assuming navigation prop is passed down
  setError: (error: string) => void;
}

const DashboardScheduleItem: React.FC<DashboardScheduleItemProps> = ({
  schedule,
  navigation,
  setError,
}) => {
  const handleAttendance = () => {
    try {
      setError('');
      if (schedule.isOpen === false) {
        Alert.alert('Chưa mở điểm danh', 'Giảng viên chưa mở điểm danh cho lớp này.');
        return;
      }
      navigation.navigate('QuickAttendancePage', { schedule }); // Navigate to the quick attendance page
    } catch (error: any) {
      setError('Không thể mở trang điểm danh. Vui lòng thử lại.');
    }
  };

  return (
    <View className="mb-3">
      <StudentScheduleCard schedule={schedule} />
      <TouchableOpacity
        className="mt-2 rounded-lg bg-black py-3" // Added mt-2 for spacing
        onPress={handleAttendance}>
        <View className="flex-row items-center justify-center">
          <MaterialIcons name="camera" size={18} color="white" />
          <Text className="ml-2 font-medium text-white">Điểm danh</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const DashBoardPage = ({ navigation }: Props) => {
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
    const checkRole = async () => {
      try {
        const user = apiAuthService.getUserInfo();
        let role;

        if (!user) {
          const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
          if (!token) return; // chưa login
          const me = await apiAuthService.getCurrentUser();
          role = (me as any)?.role;
        } else {
          role = (user as any)?.role;
        }

        if (!role) return;

        if (role === 'STUDENT') {
          // ở lại trang DashBoardPage (giao diện student)
          return;
        } else if (role === 'LECTURER') {
          // Giảng viên chuyển sang trang riêng
          // avoid resetting if already on the lecturer dashboard
          const state = (navigation as any).getState?.();
          const current = state?.routes?.[state.index]?.name;
          if (current !== 'DashBoardPageLecturer') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashBoardPageLecturer' }],
            });
          }
        } else {
          // ADMIN hoặc role khác
          const state = (navigation as any).getState?.();
          const current = state?.routes?.[state.index]?.name;
          if (current !== 'AdminDashboard') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }], // nếu có trang admin
            });
          }
        }
      } catch (e) {
        console.error('Role guard error:', e);
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, []); // Empty dependency array means it runs once on mount

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      setError(''); // Clear previous global errors
      setScheduleError(''); // Clear previous schedule errors

      // Set auth token for schedule service
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (token) {
        apiScheduleService.setAuthToken(token);

        // Load today's schedules and upcoming schedules
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
            setError(''); // Clear any errors
            // Gọi API logout
            await apiAuthService.logout();

            // Reset navigation stack và về trang Login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error: any) {
            console.error('Logout error:', error);
            setError(error?.message || 'Đăng xuất thất bại. Vui lòng thử lại.');
            // Still navigate to login even if logout API fails
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
            <Text className="ml-2 text-lg font-semibold text-gray-800">Lịch học hôm nay</Text>
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
            <TouchableOpacity
              onPress={() => {
                try {
                  setScheduleError('');
                  navigation.navigate('SchedulePage');
                } catch (error: any) {
                  setScheduleError('Không thể mở trang lịch học. Vui lòng thử lại.');
                }
              }}>
              <Text className="text-sm text-blue-600">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
        </View>

        {scheduleError ? (
          <TouchableOpacity
            className="mb-3"
            onPress={() => setScheduleError('')}
            activeOpacity={0.7}>
            <ErrorMessage text={scheduleError} />
          </TouchableOpacity>
        ) : null}

        {loadingSchedules ? (
          <View className="rounded-lg bg-gray-50 p-4">
            <Text className="text-center text-gray-500">Đang tải lịch học...</Text>
          </View>
        ) : todaySchedules.length > 0 ? (
          <>
            {todaySchedules.slice(0, 1).map((schedule) => (
              <DashboardScheduleItem
                key={schedule.id}
                schedule={schedule}
                navigation={navigation}
                setError={setError}
              />
            ))}
          </>
        ) : (
          <View className="rounded-lg bg-gray-50 p-4">
            <Text className="text-center text-gray-500">Không có lịch học hôm nay</Text>
          </View>
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
      defaultActiveTab="home"
      headerTitle="Smart Attendance"
      headerSubtitle="Giao diện chính">
      {renderHomeContent()}
    </DashBoardLayout>
  );
};

export default DashBoardPage;
