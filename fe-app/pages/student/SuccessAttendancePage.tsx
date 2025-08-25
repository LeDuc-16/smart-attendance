import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import LoginBackGround from './LoginBackGround';
import { apiAuthService } from '../../api/apiAuth';
import DashBoardLayout from './DashBoarLayout';

type RouteParams = {
  scheduleId?: number;
  className?: string;
  subjectName?: string;
  attendanceTime?: string;
  studentName?: string;
  studentCode?: string;
};

const SuccessAttendancePage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const getUserInfo = () => {
      const user = apiAuthService.getUserInfo();
      setUserInfo(user);
    };
    getUserInfo();
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleString('vi-VN');
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const goToHome = () => {
    navigation.navigate('DashBoardPage');
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <LoginBackGround>
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-green-500">
          <MaterialIcons name="check" size={48} color="white" />
        </View>

        {/* Success Message */}
        <Text className="mb-4 text-center text-3xl font-bold text-white">
          Điểm danh thành công!
        </Text>
        <Text className="mb-8 text-center text-lg text-white/80">
          Chúc bạn có một buổi học hiệu quả.
        </Text>

        {/* Attendance Details */}
        <View className="mb-8 w-full rounded-2xl bg-white/10 p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-white/80">Sinh viên:</Text>
            <Text className="font-medium text-white">
              {params?.studentName || userInfo?.name || userInfo?.studentName || 'Sinh viên'}
            </Text>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-white/80">MSV:</Text>
            <Text className="font-medium text-white">
              {params?.studentCode || userInfo?.studentCode || userInfo?.code || 'N/A'}
            </Text>
          </View>

          {params?.subjectName && (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-white/80">Môn học:</Text>
              <Text className="font-medium text-white">{params.subjectName}</Text>
            </View>
          )}

          {params?.className && (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-white/80">Lớp học:</Text>
              <Text className="font-medium text-white">{params.className}</Text>
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <Text className="text-white/80">Thời gian:</Text>
            <Text className="font-medium text-white">{formatTime(params?.attendanceTime)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="mb-4 w-full rounded-full bg-blue-600 py-4"
            onPress={goToHome}>
            <Text className="text-center text-lg font-medium text-white">Về trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full rounded-full bg-white/20 py-4"
            onPress={() => navigation.navigate('DashBoardLayout')}>
            <Text className="text-center text-lg font-medium text-white">Xem lịch sử điểm danh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LoginBackGround>
  );
};

export default SuccessAttendancePage;
