import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

interface DashBoardLayoutProps {
  children: React.ReactNode;
  // `activeTab` when provided acts as a controlled prop (layout will reflect it).
  activeTab?: 'home' | 'schedule' | 'attendance' | 'history' | 'notification' | 'profile';
  // `defaultActiveTab` sets the initial highlighted tab but won't control it afterwards.
  defaultActiveTab?: 'home' | 'schedule' | 'attendance' | 'history' | 'notification' | 'profile';
  onTabPress?: (tab: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
}

const DashBoardLayout: React.FC<DashBoardLayoutProps> = ({
  children,
  activeTab,
  defaultActiveTab,
  onTabPress,
  headerTitle = 'Smart Attendance',
  headerSubtitle = 'Giao diện chính',
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  // Auto-detect current tab from route name if not explicitly set
  const getCurrentTabFromRoute = () => {
    const routeName = route.name;
    switch (routeName) {
      case 'DashBoardPage':
        return 'home';
      case 'SchedulePage':
        return 'schedule';
      case 'AttendancePage':
      case 'StudentPage':
        return 'attendance';
      case 'HistoryPage':
        return 'history';
      case 'NotificationPage':
        return 'notification';
      case 'ProfilePage':
        return 'profile';
      default:
        return defaultActiveTab ?? 'home';
    }
  };

  // local active state used when parent doesn't control the active tab.
  // Initialize from route-based detection, then `defaultActiveTab`, then `activeTab`, fall back to 'home'.
  const [localActiveTab, setLocalActiveTab] = useState<
    'home' | 'schedule' | 'attendance' | 'history' | 'notification' | 'profile'
  >(getCurrentTabFromRoute());

  // Update local state when route changes or when activeTab prop changes
  useEffect(() => {
    if (activeTab !== undefined) {
      setLocalActiveTab(activeTab);
    } else {
      setLocalActiveTab(getCurrentTabFromRoute());
    }
  }, [activeTab, route.name]);

  const displayedActiveTab = activeTab ?? localActiveTab;

  // Default tabs
  const tabs = [
    { id: 'home', icon: 'home', label: 'Trang chủ' },
    { id: 'schedule', icon: 'schedule', label: 'Lịch học' },
    { id: 'attendance', icon: 'camera', label: 'Điểm danh' },
    { id: 'history', icon: 'bar-chart', label: 'Lịch sử' },
    { id: 'notification', icon: 'notifications', label: 'Thông báo' },
    { id: 'profile', icon: 'person', label: 'Cá nhân' },
  ];

  // Centralized handler: pages can pass their own `onTabPress` to override behavior.
  const handleTabPress = (tab: string) => {
    // update local state so the UI responds even when parent doesn't control activeTab
    setLocalActiveTab(tab as any);

    // If parent passed a handler, prefer that (avoid double navigation)
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

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
      case 'history':
        navigation.navigate('HistoryPage');
        break;
      case 'profile':
        navigation.navigate('ProfilePage');
        break;
      case 'notification':
        navigation.navigate('NotificationPage');
        break;
      default:
        Alert.alert('Thông báo', `Tính năng ${tab} đang phát triển`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', position: 'relative' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header động */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800">{headerTitle}</Text>
        <Text className="text-sm text-gray-500">{headerSubtitle}</Text>
      </View>

      {/* Main Content - add bottom padding so tab doesn't cover content */}
      <View style={{ flex: 1, paddingBottom: 80 }}>{children}</View>

      {/* Bottom Tab Navigation - fixed to bottom */}
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
              onPress={() => handleTabPress(tab.id)}
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

export default DashBoardLayout;
