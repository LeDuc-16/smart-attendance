import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';

type Props = NativeStackScreenProps<any, 'StatsPage'>;

const StatsPage = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'
  >('stats');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);

    switch (tab) {
      case 'home':
        navigation.navigate('DashBoardPage');
        break;
      case 'schedule':
        navigation.navigate('SchedulePage');
        break;
      case 'attendance':
        navigation.navigate('AttendancePage');
        break;
      default:
        Alert.alert('Thông báo', `Tính năng ${tab} đang phát triển`);
    }
  };

  const renderStatsContent = () => (
    <ScrollView className="flex-1 px-4 py-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800">Thống kê điểm danh</Text>
        <Text className="text-gray-600">Học kỳ I - 2024/2025</Text>
      </View>

      {/* Summary Cards */}
      <View className="mb-4 flex-row gap-3">
        <View className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <MaterialIcons name="check-circle" size={24} color="#10b981" />
          <Text className="mt-2 text-2xl font-bold text-gray-800">85%</Text>
          <Text className="text-sm text-gray-500">Tỷ lệ có mặt</Text>
        </View>
        <View className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <MaterialIcons name="schedule" size={24} color="#f59e0b" />
          <Text className="mt-2 text-2xl font-bold text-gray-800">12</Text>
          <Text className="text-sm text-gray-500">Buổi vắng</Text>
        </View>
      </View>

      {/* Attendance by Subject */}
      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Theo môn học</Text>

        <View className="mb-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-medium text-gray-800">Cơ sở dữ liệu</Text>
            <Text className="font-semibold text-green-600">90%</Text>
          </View>
          <View className="h-2 rounded-full bg-gray-200">
            <View className="h-2 w-[90%] rounded-full bg-green-500" />
          </View>
        </View>

        <View className="mb-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-medium text-gray-800">Lập trình Web</Text>
            <Text className="font-semibold text-blue-600">85%</Text>
          </View>
          <View className="h-2 rounded-full bg-gray-200">
            <View className="h-2 w-[85%] rounded-full bg-blue-500" />
          </View>
        </View>

        <View className="mb-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-medium text-gray-800">Lập trình Mobile</Text>
            <Text className="font-semibold text-yellow-600">75%</Text>
          </View>
          <View className="h-2 rounded-full bg-gray-200">
            <View className="h-2 w-[75%] rounded-full bg-yellow-500" />
          </View>
        </View>
      </View>

      {/* Recent Attendance */}
      <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Điểm danh gần đây</Text>

        {[
          { subject: 'Cơ sở dữ liệu', date: '21/01', status: 'Có mặt', color: 'green' },
          { subject: 'Lập trình Web', date: '20/01', status: 'Có mặt', color: 'green' },
          { subject: 'Lập trình Mobile', date: '19/01', status: 'Vắng', color: 'red' },
          { subject: 'Cơ sở dữ liệu', date: '18/01', status: 'Có mặt', color: 'green' },
        ].map((item, index) => (
          <View
            key={index}
            className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-50 p-3">
            <View>
              <Text className="font-medium text-gray-800">{item.subject}</Text>
              <Text className="text-sm text-gray-600">{item.date}/2025</Text>
            </View>
            <View className={`rounded-full px-3 py-1 bg-${item.color}-100`}>
              <Text className={`text-sm font-medium text-${item.color}-700`}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <DashBoardLayout activeTab={activeTab} onTabPress={handleTabPress}>
      {renderStatsContent()}
    </DashBoardLayout>
  );
};

export default StatsPage;
