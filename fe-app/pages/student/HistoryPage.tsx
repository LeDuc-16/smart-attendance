import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from '../../App';
import { apiAuthService } from '../../api/apiAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'HistoryPage'>;

type AttendanceStatus = 'Có mặt' | 'Đi muộn' | 'Vắng';

const statusBadgeStyle = {
  'Có mặt': { bg: '#def7ec', color: '#38b48f' },
  'Đi muộn': { bg: '#fff7db', color: '#eab308' },
  Vắng: { bg: '#fde8e8', color: '#ee5859' },
};

const fakeAttendanceHistory = [
  {
    id: '1',
    subject: 'Cơ sở dữ liệu',
    time: 'Thứ 3, 12/08/2025 - Phòng 207-B5',
    checkedAt: 'Điểm danh lúc: 07:32',
    status: 'Có mặt' as AttendanceStatus,
  },
  {
    id: '2',
    subject: 'Lập trình Web',
    time: 'Thứ 2, 11/08/2025 - Phòng 206-B5',
    checkedAt: 'Điểm danh lúc: 09:32',
    status: 'Đi muộn' as AttendanceStatus,
  },
  {
    id: '3',
    subject: 'Lập trình Web',
    time: 'Thứ 2, 11/08/2025 - Phòng 206-B5',
    checkedAt: 'Điểm danh lúc: 09:32',
    status: 'Vắng' as AttendanceStatus,
  },
];

const HistoryPage = ({ navigation }: Props) => {
  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = apiAuthService.getUserInfo();
        let role = user?.role;

        if (!role) {
          const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
          if (token) {
            const me = await apiAuthService.getCurrentUser();
            role = (me as any)?.role;
          }
        }

        if (role === 'LECTURER') {
          const state = (navigation as any).getState?.();
          const current = state?.routes?.[state.index]?.name;
          if (current !== 'DashBoardPageLecturer') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashBoardPageLecturer' }],
            });
          }
        } else if (role !== 'STUDENT') {
          // fallback: nếu không phải student thì đưa về dashboard chung
          const state = (navigation as any).getState?.();
          const current = state?.routes?.[state.index]?.name;
          if (current !== 'DashBoardPage') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashBoardPage' }],
            });
          }
        }
      } catch (e) {
        console.error('Role guard error:', e);
      }
    };

    checkRole();
  }, []);
  const content = (
    <ScrollView className="flex-1 px-2 py-4">
      {fakeAttendanceHistory.map((item) => (
        <View key={item.id} className="mb-3 rounded-xl border border-gray-200 bg-white p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900">{item.subject}</Text>
            <View
              style={{
                backgroundColor:
                  item.status === 'Có mặt'
                    ? '#10b981'
                    : item.status === 'Đi muộn'
                      ? '#eab308'
                      : '#ef4444',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{item.status}</Text>
            </View>
          </View>
          <Text className="mb-1 text-sm text-gray-600">{item.time}</Text>
          <Text className="text-xs text-gray-500">{item.checkedAt}</Text>
        </View>
      ))}
      {fakeAttendanceHistory.length === 0 && (
        <View className="mt-12 flex-row items-center justify-center">
          <Text className="text-gray-400">Chưa có lịch sử điểm danh</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <DashBoardLayout
      defaultActiveTab="history"
      headerTitle="Smart Attendance"
      headerSubtitle="Lịch sử điểm danh">
      {content}
    </DashBoardLayout>
  );
};

export default HistoryPage;
