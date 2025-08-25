import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import DashBoarLayout from '../student/DashBoarLayout';

interface DashBoardLayoutLecturerProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'schedule' | 'attendance' | 'history' | 'notification' | 'profile';
  defaultActiveTab?: 'home' | 'schedule' | 'attendance' | 'history' | 'notification' | 'profile';
  onTabPress?: (tab: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
}

const DashBoardLayoutLecturer: React.FC<DashBoardLayoutLecturerProps> = ({
  children,
  activeTab,
  defaultActiveTab,
  onTabPress,
  headerTitle = 'Smart Attendance (Giảng viên)',
  headerSubtitle = 'Giao diện giảng viên',
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
      case 'HistoryPageLecturer':
        return 'history';
      case 'NotificationPageLecturer':
        return 'notification';
      case 'ProfilePageLecturer':
        return 'profile';
      default:
        return defaultActiveTab ?? 'home';
    }
  };

  const handleLecturerTabPress = (tab: string) => {
    if (onTabPress) return onTabPress(tab);

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
      case 'history':
        navigation.navigate('HistoryPageLecturer');
        break;
      case 'notification':
        navigation.navigate('NotificationPageLecturer');
        break;
      case 'profile':
        navigation.navigate('ProfilePageLecturer');
        break;
      default:
        // fallback to lecturer home
        navigation.navigate('DashBoardPageLecturer');
    }
  };

  // Render student DashBoarLayout but control its active tab and onTabPress
  return (
    <DashBoarLayout
      activeTab={activeTab ?? getLecturerTabFromRoute()}
      defaultActiveTab={defaultActiveTab}
      onTabPress={handleLecturerTabPress}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}>
      {children}
    </DashBoarLayout>
  );
};

export default DashBoardLayoutLecturer;
