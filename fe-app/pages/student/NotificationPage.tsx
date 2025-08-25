import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from 'App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiAuthService } from 'api/apiAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationPage'>;

type NotificationType = 'all' | 'unread' | 'schedule' | 'attendance';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  time: string;
  isRead: boolean;
  icon: string;
};

const fakeNotifications: Notification[] = [
  {
    id: '1',
    type: 'schedule',
    title: 'Thông báo thay đổi lịch học',
    description: 'Lớp lập trình web ngày 25/01 chuyển từ phòng TC-301 sang phòng TC-206',
    badge: 'Thay đổi lịch',
    badgeColor: '#bdbdbd',
    time: '22/01/2025 07:00',
    isRead: true,
    icon: 'event',
  },
  {
    id: '2',
    type: 'attendance',
    title: 'Điểm danh thành công',
    description: 'Bạn đã điểm danh thành công cho môn Cơ sở dữ liệu lúc 07:05',
    badge: 'Thành công',
    badgeColor: '#27ae60',
    time: '22/01/2025 07:05',
    isRead: false,
    icon: 'check-circle',
  },
  {
    id: '3',
    type: 'attendance',
    title: 'Nhắc nhở điểm danh',
    description: 'Thời gian điểm danh cho môn Lập trình Web đã bắt đầu. Hãy điểm danh sớm!',
    badge: 'Thông tin',
    badgeColor: '#2196f3',
    time: '22/01/2025 07:00',
    isRead: false,
    icon: 'notifications-active',
  },
  {
    id: '4',
    type: 'all',
    title: 'Cập nhật hệ thống',
    description:
      'Hệ thống sẽ bảo trì từ 22:00 - 02:00 đêm nay. Vui lòng hoàn thành điểm danh trước thời gian này.',
    badge: 'Cảnh báo',
    badgeColor: '#e53935',
    time: '22/01/2025 07:00',
    isRead: false,
    icon: 'warning',
  },
];

const NotificationPage = ({ navigation }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState<Notification[]>(fakeNotifications);

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
          // Lecturer should be redirected to the lecturer dashboard instead of
          // resetting to the student notification page (that would loop).
          navigation.reset({
            index: 0,
            routes: [{ name: 'DashBoardPageLecturer' }],
          });
        } else if (role !== 'STUDENT') {
          // fallback → đưa về dashboard chung
          navigation.reset({
            index: 0,
            routes: [{ name: 'DashBoardPage' }],
          });
        }
      } catch (e) {
        console.error('Role guard error:', e);
      }
    };

    checkRole();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filterNotifications = () => {
    if (selectedFilter === 'all') return notifications;
    if (selectedFilter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === selectedFilter);
  };

  const filterOptions: { type: NotificationType; label: string }[] = [
    { type: 'all', label: `Tất cả (${notifications.length})` },
    { type: 'unread', label: `Chưa đọc (${notifications.filter((n) => !n.isRead).length})` },
    {
      type: 'schedule',
      label: `Lịch học (${notifications.filter((n) => n.type === 'schedule').length})`,
    },
    {
      type: 'attendance',
      label: `Điểm danh (${notifications.filter((n) => n.type === 'attendance').length})`,
    },
  ];

  const content = (
    <ScrollView className="flex-1 px-2">
      {/* Filter tabs */}
      <View className="mb-4 flex-row px-2 pt-4">
        {filterOptions.map((f) => (
          <TouchableOpacity
            key={f.type}
            className={`mr-2 rounded-full border px-4 py-2 ${
              selectedFilter === f.type ? 'border-black bg-black' : 'border-gray-200 bg-gray-100'
            }`}
            onPress={() => setSelectedFilter(f.type)}>
            <Text
              className={`text-xs ${
                selectedFilter === f.type ? 'font-bold text-white' : 'text-gray-800'
              }`}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filterNotifications().map((notification) => (
        <View
          key={notification.id}
          className={`mb-3 rounded-xl border ${
            notification.isRead ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'
          } p-4`}>
          {/* Header */}
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name={notification.icon as any} size={20} color="#6366f1" />
              <Text className="ml-2 font-semibold text-gray-800">{notification.title}</Text>
            </View>
            {!!notification.badge && (
              <View
                style={{
                  backgroundColor: notification.badgeColor,
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                  {notification.badge}
                </Text>
              </View>
            )}
          </View>
          {/* Description */}
          <Text className="mb-1 text-sm text-gray-700">{notification.description}</Text>

          {/* Time & Action */}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{notification.time}</Text>
            {!notification.isRead ? (
              <TouchableOpacity onPress={() => handleMarkAsRead(notification.id)}>
                <Text className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  ✓ Đánh dấu đã đọc
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-xs font-medium text-green-600">✓ Đã đọc</Text>
            )}
          </View>
        </View>
      ))}
      {filterNotifications().length === 0 && (
        <View className="mt-12 flex-row items-center justify-center">
          <Text className="text-gray-400">Không có thông báo nào</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <DashBoardLayout
      defaultActiveTab="notification"
      headerTitle="Smart Attendance"
      headerSubtitle="Thông báo">
      {content}
    </DashBoardLayout>
  );
};

export default NotificationPage;
