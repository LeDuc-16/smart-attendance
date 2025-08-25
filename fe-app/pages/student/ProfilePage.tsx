import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { apiAuthService } from 'api/apiAuth';
import { RootStackParamList } from 'App';
import DashBoardLayout from './DashBoarLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilePage'>;

const ProfilePage = ({ navigation }: Props) => {
  // Lấy thông tin user thực từ API
  const userInfo = apiAuthService.getUserInfo();

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

  const getUserEmail = () => {
    if (!userInfo) return 'N/A';
    return userInfo.email || 'N/A';
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

  const getUserMajor = () => {
    if (!userInfo || userInfo.role !== 'STUDENT') return null;
    return (userInfo as any).majorName || null;
  };

  const getUserFaculty = () => {
    if (!userInfo) return null;
    if (userInfo.role === 'STUDENT') {
      return (userInfo as any).facultyName || null;
    }
    return null;
  };

  const getUserRole = () => {
    if (!userInfo) return 'N/A';
    return userInfo.role === 'STUDENT' ? 'Sinh viên' : 'Giảng viên';
  };

  // Giả sử trạng thái khuôn mặt - có thể lấy từ API khác
  const getFaceStatus = () => {
    // Tạm thời fake,
    return 'Chưa đăng ký';
  };

  const handleLogout = async () => {
    try {
      await apiAuthService.logout();

      // Avoid resetting if we're already on Login
      const state = (navigation as any).getState?.();
      const current = state?.routes?.[state.index]?.name;
      if (current !== 'Login') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      const state = (navigation as any).getState?.();
      const current = state?.routes?.[state.index]?.name;
      if (current !== 'Login') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  if (!userInfo) {
    const content = (
      <ScrollView className="flex-1 px-2 py-4">
        <View className="mx-1 rounded-xl border border-gray-200 bg-white p-4">
          <View className="items-center justify-center py-8">
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text className="mt-2 text-red-500">Không thể tải thông tin người dùng</Text>
            <TouchableOpacity
              className="mt-4 rounded bg-blue-500 px-4 py-2"
              onPress={() => navigation.navigate('Login')}>
              <Text className="text-white">Đăng nhập lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );

    return (
      <DashBoardLayout
        defaultActiveTab="profile"
        headerTitle="Smart Attendance"
        headerSubtitle="Thông tin cá nhân">
        {content}
      </DashBoardLayout>
    );
  }

  const content = (
    <ScrollView className="flex-1 px-2 py-4">
      <View className="mx-1 rounded-xl border border-gray-200 bg-white p-4">
        {/* Header */}
        <View className="mb-2 flex-row items-center">
          <MaterialIcons name="person-outline" size={20} color="#666" />
          <Text className="ml-2 text-base font-semibold text-gray-800">Thông tin cá nhân</Text>
        </View>

        {/* Avatar */}
        <View className="my-3 items-center">
          <View className="mb-2 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <MaterialIcons name="person" size={48} color="#bdbdbd" />
          </View>
        </View>

        {/* Info Grid */}
        <View className="mb-2">
          <View className="flex-row items-center py-1">
            <Text className="w-32 text-gray-600">Họ và tên:</Text>
            <Text className="font-semibold text-gray-900">{getUserName()}</Text>
          </View>

          <View className="flex-row items-center py-1">
            <Text className="w-32 text-gray-600">
              {userInfo.role === 'STUDENT' ? 'Mã sinh viên:' : 'Mã giảng viên:'}
            </Text>
            <Text className="text-gray-900">{getUserCode()}</Text>
          </View>

          <View className="flex-row items-center py-1">
            <Text className="w-32 text-gray-600">Email:</Text>
            <Text className="text-gray-900">{getUserEmail()}</Text>
          </View>

          <View className="flex-row items-center py-1">
            <Text className="w-32 text-gray-600">Vai trò:</Text>
            <Text className="text-gray-900">{getUserRole()}</Text>
          </View>

          {userInfo.role === 'STUDENT' && (
            <>
              <View className="flex-row items-center py-1">
                <Text className="w-32 text-gray-600">Lớp:</Text>
                <Text className="text-gray-900">{getUserClass()}</Text>
              </View>

              {getUserMajor() && (
                <View className="flex-row items-center py-1">
                  <Text className="w-32 text-gray-600">Ngành:</Text>
                  <Text className="text-gray-900">{getUserMajor()}</Text>
                </View>
              )}

              {getUserFaculty() && (
                <View className="flex-row items-center py-1">
                  <Text className="w-32 text-gray-600">Khoa:</Text>
                  <Text className="text-gray-900">{getUserFaculty()}</Text>
                </View>
              )}
            </>
          )}

          {userInfo.role === 'LECTURER' && getUserClass() !== 'Giảng viên' && (
            <View className="flex-row items-center py-1">
              <Text className="w-32 text-gray-600">Học hàm:</Text>
              <Text className="text-gray-900">{getUserClass()}</Text>
            </View>
          )}

          <View className="flex-row items-center py-1">
            <Text className="w-32 text-gray-600">Trạng thái khuôn mặt:</Text>
            <View
              className={`ml-1 rounded-full px-2 py-1 ${getFaceStatus() === 'Đã đăng ký' ? 'bg-green-500' : 'bg-black'}`}>
              <Text className="text-xs font-semibold text-white">{getFaceStatus()}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="my-3">
          {getFaceStatus() === 'Chưa đăng ký' && (
            <TouchableOpacity
              className="mb-2 flex-row items-center justify-center rounded bg-blue-500 py-2"
              onPress={() => {
                // Navigate to face registration page
                // navigation.navigate('FaceRegisterPage');
              }}>
              <MaterialIcons name="face" size={20} color="white" />
              <Text className="ml-2 text-base font-medium text-white">Đăng ký lại</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center rounded bg-red-500 py-2"
            onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text className="ml-2 text-base font-medium text-white">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <DashBoardLayout
      defaultActiveTab="profile"
      headerTitle="Smart Attendance"
      headerSubtitle="Thông tin cá nhân">
      {content}
    </DashBoardLayout>
  );
};

export default ProfilePage;
