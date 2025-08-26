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
    .filter((schedule) => {
      const studyDate = new Date(schedule.date);
      return (
studyDate.getFullYear() === today.getFullYear() &&
        studyDate.getMonth() === today.getMonth() &&
        studyDate.getDate() === today.getDate()
      );
    })
    .map((schedule) => {
      console.log(
        'DashBoard mapping schedule:',
        schedule.id,
        'isOpen:',
        schedule.isOpen,
        'sourceId:',
        schedule.sourceId
      );
      return {
        id: schedule.id.toString(),
        subject: schedule.subjectName,
        className: schedule.className || '',
        location: schedule.roomName || '',
        time: `${schedule.startTime} - ${schedule.endTime}`,
        lecturer: schedule.lecturerName || '',
        topic: schedule.topic || 'Chưa có thông tin chủ đề',
        scheduleId: schedule.id,
        sourceId: schedule.sourceId, // Include sourceId in mapped data
        date: schedule.date,
        isOpen: schedule.isOpen || false, // Include isOpen status
      };
    })
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
          <Text className="text-center text-base text-gray-500">Đang tải lịch dạy...</Text>
        ) : scheduleError ? (
<Text className="text-center text-base text-red-500">Lỗi: {scheduleError}</Text>
        ) : todaySchedules.length > 0 ? (
          todaySchedules.map((item) => (
            <View key={item.id} className="mb-3 rounded-lg bg-gray-50 p-3">
              <View className="mb-2 flex-row items-center">
                <MaterialIcons name="book" size={16} color="#6b7280" />
                <Text className="ml-2 font-medium text-gray-800">{item.subject}</Text>
              </View>
              <Text className="mb-1 text-sm text-gray-600">
                {item.time} | {item.location}
              </Text>
              <Text className="mb-1 text-sm text-gray-600">Lớp: {item.className}</Text>
              <Text className="mb-3 text-sm text-gray-600">Chủ đề: {item.topic}</Text>

              <TouchableOpacity
                className={`rounded-lg py-3 ${item.isOpen ? 'bg-red-600' : 'bg-black'}`}
                onPress={() => {
                  const actionText = item.isOpen ? 'Đóng điểm danh' : 'Mở điểm danh';
                  const confirmText = item.isOpen ? 'đóng điểm danh' : 'mở điểm danh';

                  Alert.alert(actionText, `Bạn có chắc chắn muốn ${confirmText} cho lớp này?`, [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: actionText,
                      onPress: async () => {
                        try {
                          const token = apiAuthService.getAuthToken();
                          if (!token) throw new Error('Token không tồn tại');
                          apiScheduleService.setAuthToken(token);
                          // prefer sourceId when available (preserved original backend id), fallback to scheduleId
                          const scheduleIdToUse = (item as any).sourceId ?? item.scheduleId;
                          console.log(
                            `DashBoard ${item.isOpen ? 'close' : 'open'}Attendance: item.sourceId =`,
                            (item as any).sourceId,
                            'item.scheduleId =',
                            item.scheduleId,
                            'using =',
                            scheduleIdToUse
                          );

                          const result = item.isOpen
                            ? await apiScheduleService.closeAttendance(scheduleIdToUse)
                            : await apiScheduleService.openAttendance(scheduleIdToUse);

                          Alert.alert('Thành công', result?.message || `Đã ${confirmText}`);

                          // Update local state immediately before refresh
                          setSchedules((prev) =>
                            prev.map((s) =>
                              (s.sourceId || s.id) === scheduleIdToUse
                                ? { ...s, isOpen: !item.isOpen }
                                : s
                            )
);

                          // Then refresh from server to get authoritative state
                          setLoadingSchedules(true);
                          const response = await apiScheduleService.getMySchedule();
                          setSchedules(response.schedules);
                        } catch (err: any) {
                          console.error(`${item.isOpen ? 'Close' : 'Open'} attendance error:`, err);
                          Alert.alert('Lỗi', err?.message || `${actionText} thất bại`);
                        } finally {
                          setLoadingSchedules(false);
                        }
                      },
                    },
                  ]);
                }}>
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name={item.isOpen ? 'close' : 'camera'} size={18} color="white" />
                  <Text className="ml-2 font-medium text-white">
                    {item.isOpen ? 'Đóng điểm danh' : 'Mở điểm danh'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-center text-base text-gray-500">Không có lịch dạy hôm nay.</Text>
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

  return <DashBoardLayoutLecturer>{renderHomeContent()}</DashBoardLayoutLecturer>;
};

export default DashBoardPageLecturer;