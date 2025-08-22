import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { apiAuthService } from '../api/apiAuth';

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

    // Handle navigation based on tab
    switch (tab) {
      case 'schedule':
        navigation.navigate('SchedulePage');
        break;
      case 'attendance':
        navigation.navigate('AttendancePage');
        break;
      case 'stats':
        navigation.navigate('StatsPage');
        break;
      case 'profile':
        handleProfilePress();
        break;
      default:
        Alert.alert('Thông báo', `Tính năng ${tab} đang phát triển`);
    }
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
            // Dù có lỗi API cũng vẫn đăng xuất local
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
          <TouchableOpacity>
            <Text className="text-sm text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Class Item */}
        <View className="mb-3 rounded-lg bg-gray-50 p-3">
          <View className="mb-2 flex-row items-center">
            <MaterialIcons name="book" size={16} color="#6b7280" />
            <Text className="ml-2 font-medium text-gray-800">Cơ sở dữ liệu</Text>
          </View>
          <Text className="mb-1 text-sm text-gray-600">07:00 - 09:30 | TC-201</Text>
          <Text className="mb-1 text-sm text-gray-600">Giáng viên: TS. Nguyễn Văn A</Text>
          <Text className="mb-3 text-sm text-gray-600">
            Chủ đề: Chương 3: Thiết kế CSDL quan hệ
          </Text>

          <TouchableOpacity
            className="rounded-lg bg-black py-3"
            onPress={() => navigation.navigate('AttendancePage')}>
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="camera" size={18} color="white" />
              <Text className="ml-2 font-medium text-white">Điểm danh</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center rounded-lg bg-gray-100 py-3">
          <Text className="text-sm text-gray-600">Còn 3 lớp học nữa {'>'} </Text>
        </TouchableOpacity>
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
    <DashBoardLayout activeTab={activeTab} onTabPress={handleTabPress}>
      {renderHomeContent()}
    </DashBoardLayout>
  );
};

export default DashBoardPage;
