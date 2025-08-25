import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

interface DashBoardLayoutLecturerProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'schedule' | 'attendance' | 'report';
  defaultActiveTab?: 'home' | 'schedule' | 'attendance' | 'report';
  onTabPress?: (tab: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const DashBoardLayoutLecturer: React.FC<DashBoardLayoutLecturerProps> = ({
  children,
  activeTab,
  defaultActiveTab,
  onTabPress,
  headerTitle = 'Smart Attendance (Giảng viên)',
  headerSubtitle = 'Giao diện giảng viên',
  showBackButton = false,
  onBackPress,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const getLecturerTabFromRoute = () => {
    const routeName = route.name;
    switch (routeName) {
      case 'DashBoardPageLecturer':
        return 'home';
      case 'SchedulePageLecturer':
        return 'schedule';
      case 'AttendancePageLecturer':
        return 'attendance';
      case 'ReportPageLecturer':
        return 'report';
      case 'StudentListPage':
        return 'attendance'; // StudentListPage is part of attendance flow
      default:
        return defaultActiveTab ?? 'home';
    }
  };

  const [localActiveTab, setLocalActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'report'
  >(getLecturerTabFromRoute());

  useEffect(() => {
    if (activeTab !== undefined) {
      setLocalActiveTab(activeTab);
    } else {
      setLocalActiveTab(getLecturerTabFromRoute());
    }
  }, [activeTab, route.name]);

  const displayedActiveTab = activeTab ?? localActiveTab;

  const tabs = [
    { id: 'home', icon: 'home', label: 'Trang chủ' },
    { id: 'schedule', icon: 'schedule', label: 'Lịch dạy' },
    { id: 'attendance', icon: 'camera', label: 'Điểm danh' },
    { id: 'report', icon: 'bar-chart', label: 'Báo cáo' },
  ];

  const handleLecturerTabPress = (tab: string) => {
    setLocalActiveTab(tab as any);

    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    switch (tab) {
      case 'home':
        navigation.navigate('DashBoardPageLecturer');
        break;
      case 'schedule':
        navigation.navigate('SchedulePageLecturer');
        break;
      case 'attendance':
        navigation.navigate('AttendancePageLecturer');
        break;
      case 'report':
        navigation.navigate('ReportPageLecturer');
        break;
      default:
        Alert.alert('Thông báo', `Tính năng ${tab} đang phát triển`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', position: 'relative' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="bg-white px-4 py-3 shadow-sm flex-row items-center">
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress || navigation.goBack} className="mr-2 p-2">
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <View>
          <Text className="text-lg font-semibold text-gray-800">{headerTitle}</Text>
          <Text className="text-sm text-gray-500">{headerSubtitle}</Text>
        </View>
      </View>

      <View style={{ flex: 1, paddingBottom: 80 }}>{children}</View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
          paddingVertical: 8,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 6,
        }}>
        <View className="flex-row justify-around">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 items-center px-1 py-2 ${displayedActiveTab === tab.id ? 'bg-blue-50' : ''} rounded-lg`}
              onPress={() => handleLecturerTabPress(tab.id)}
              activeOpacity={0.7}>
              <MaterialIcons
                name={tab.icon as any}
                size={24}
                color={displayedActiveTab === tab.id ? '#2563eb' : '#6b7280'}
              />
              <Text
                className={`mt-1 text-center text-xs ${displayedActiveTab === tab.id ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashBoardLayoutLecturer;