import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DashBoardLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile' | 'report';
  onTabPress?: (tab: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
  userRole?: 'STUDENT' | 'LECTURER';
  navigation: any;
}

const DashBoardLayout: React.FC<DashBoardLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabPress,
  headerTitle = 'Smart Attendance',
  headerSubtitle = 'Giao diện chính',
  userRole = 'STUDENT',
  navigation,
}) => {
  const studentTabs = [
    { id: 'DashBoardPage', icon: 'home', label: 'Trang chủ' },
    { id: 'StudentAttendanceViewPage', icon: 'camera', label: 'Điểm danh' },
    { id: 'StatsPage', icon: 'bar-chart', label: 'Lịch sử' },
    { id: 'NotificationPage', icon: 'notifications', label: 'Thông báo' },
    { id: 'ProfilePage', icon: 'person', label: 'Cá nhân' },
  ];

  const lecturerTabs = [
    { id: 'DashBoardPage', icon: 'home', label: 'Trang chủ' },
    { id: 'TeachingSchedulePage', icon: 'schedule', label: 'Lịch học' },
    { id: 'AttendancePage', icon: 'camera', label: 'Điểm danh' },
    { id: 'report', icon: 'assessment', label: 'Báo cáo' },
  ];

  const tabs = userRole === 'LECTURER' ? lecturerTabs : studentTabs;

  const handleTabPressInternal = (tabId: string) => {
    if (onTabPress) {
      onTabPress(tabId);
    }
    navigation.navigate(tabId);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header động */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800">{headerTitle}</Text>
        <Text className="text-sm text-gray-500">{headerSubtitle}</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1">{children}</View>

      {/* Bottom Tab Navigation */}
      <View className="border-t border-gray-200 bg-white px-2 py-2 shadow-lg">
        <View className="flex-row justify-around">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 items-center px-1 py-2 ${activeTab === tab.id ? 'bg-blue-50' : ''} rounded-lg`}
              onPress={() => handleTabPressInternal(tab.id)}
              activeOpacity={0.7}>
              <MaterialIcons
                name={tab.icon as any}
                size={24}
                color={activeTab === tab.id ? '#2563eb' : '#6b7280'}
              />
              <Text
                className={`mt-1 text-center text-xs ${activeTab === tab.id ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashBoardLayout;
