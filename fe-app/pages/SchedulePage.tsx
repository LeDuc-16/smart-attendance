import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';

type Props = NativeStackScreenProps<any, 'SchedulePage'>;

const SchedulePage = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'
  >('schedule');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);

    switch (tab) {
      case 'home':
        navigation.navigate('DashBoardPage');
        break;
      case 'attendance':
        navigation.navigate('AttendancePage');
        break;
      case 'profile':
        // Handle profile
        break;
      default:
        Alert.alert('Thông báo', `Tính năng ${tab} đang phát triển`);
    }
  };

  const renderScheduleContent = () => (
    <ScrollView className="flex-1 px-4 py-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800">Lịch học</Text>
        <Text className="text-gray-600">Tuần 15/01 - 21/01/2025</Text>
      </View>

      {/* Today's Classes */}
      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Hôm nay - 21/01</Text>

        <View className="mb-3 rounded-lg bg-blue-50 p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-medium text-gray-800">Cơ sở dữ liệu</Text>
            <View className="rounded-full bg-blue-500 px-2 py-1">
              <Text className="text-xs text-white">Sắp tới</Text>
            </View>
          </View>
          <Text className="mb-1 text-sm text-gray-600">07:00 - 09:30 | TC-201</Text>
          <Text className="text-sm text-gray-600">TS. Nguyễn Văn A</Text>
        </View>

        <View className="mb-3 rounded-lg bg-gray-50 p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-medium text-gray-800">Lập trình Web</Text>
            <View className="rounded-full bg-green-500 px-2 py-1">
              <Text className="text-xs text-white">Đã điểm danh</Text>
            </View>
          </View>
          <Text className="mb-1 text-sm text-gray-600">13:00 - 15:30 | TC-202</Text>
          <Text className="text-sm text-gray-600">ThS. Trần Thị B</Text>
        </View>
      </View>

      {/* Week View */}
      <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Lịch tuần</Text>

        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'].map((day, index) => (
          <View key={day} className="mb-2 rounded-lg bg-gray-50 p-3">
            <Text className="mb-1 font-medium text-gray-800">{day}</Text>
            <Text className="text-sm text-gray-600">
              {index === 0 ? 'Lập trình Mobile (07:00 - 09:30)' : 'Không có lớp'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <DashBoardLayout activeTab={activeTab} onTabPress={handleTabPress}>
      {renderScheduleContent()}
    </DashBoardLayout>
  );
};

export default SchedulePage;
