import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from '../App';

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
        description: 'Hệ thống sẽ bảo trì từ 22:00 - 02:00 đêm nay. Vui lòng hoàn thành điểm danh trước thời gian này.',
        badge: 'Cảnh báo',
        badgeColor: '#e53935',
        time: '22/01/2025 07:00',
        isRead: false,
        icon: 'warning',
    },
];

const filterOptions: { type: NotificationType; label: string }[] = [
    { type: 'all', label: `Tất cả (${fakeNotifications.length})` },
    { type: 'unread', label: `Chưa đọc (${fakeNotifications.filter(n => !n.isRead).length})` },
    { type: 'schedule', label: `Lịch học (${fakeNotifications.filter(n => n.type === 'schedule').length})` },
    { type: 'attendance', label: `Điểm danh (${fakeNotifications.filter(n => n.type === 'attendance').length})` },
];

const NotificationPage = ({ navigation }: Props) => {
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'>('notification');
    const [selectedFilter, setSelectedFilter] = useState<NotificationType>('all');
    const [notifications, setNotifications] = useState<Notification[]>(fakeNotifications);

    const handleTabPress = (tab: string) => {
        setActiveTab(tab as any);
        switch (tab) {
            case 'home':
                navigation.navigate('DashBoardPage');
                break;
            case 'attendance':
                navigation.navigate('AttendancePage');
                break;
            case 'notification':
                break;
            case 'profile':
                navigation.navigate('ProfilePage');
                break;
            default:
                break;
        }
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(current => current.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const filterNotifications = () => {
        if (selectedFilter === 'all') return notifications;
        if (selectedFilter === 'unread') return notifications.filter(n => !n.isRead);
        return notifications.filter(n => n.type === selectedFilter);
    };

    return (
        <DashBoardLayout
            activeTab={activeTab}
            onTabPress={handleTabPress}
            headerTitle="Smart Attendance"
            headerSubtitle="Thông báo"
        >
            {/* Filter tabs */}
            <View className="flex-row mb-4 px-2 pt-4">
                {filterOptions.map(f => (
                    <TouchableOpacity
                        key={f.type}
                        className={`px-4 py-2 mr-2 rounded-full border ${selectedFilter === f.type ? 'bg-black border-black' : 'bg-gray-100 border-gray-200'}`}
                        onPress={() => setSelectedFilter(f.type)}
                    >
                        <Text className={`text-xs ${selectedFilter === f.type ? 'text-white font-bold' : 'text-gray-800'}`}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1 px-2">
                {filterNotifications().map(notification => (
                    <View
                        key={notification.id}
                        className={`mb-3 rounded-xl border ${notification.isRead ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'} p-4`}
                    >
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row items-center">
                                <MaterialIcons name={notification.icon as any} size={20} color="#6366f1" />
                                <Text className="ml-2 font-semibold text-gray-800">{notification.title}</Text>
                            </View>
                            {!!notification.badge && (
                                <View style={{ backgroundColor: notification.badgeColor, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{notification.badge}</Text>
                                </View>
                            )}
                        </View>
                        {/* Description */}
                        <Text className="text-sm text-gray-700 mb-1">{notification.description}</Text>

                        {/* Time & Action */}
                        <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-xs text-gray-400">{notification.time}</Text>
                            {!notification.isRead
                                ? (
                                    <TouchableOpacity onPress={() => handleMarkAsRead(notification.id)}>
                                        <Text className="text-xs py-1 px-2 bg-gray-100 rounded font-medium text-gray-800">
                                            ✓ Đánh dấu đã đọc
                                        </Text>
                                    </TouchableOpacity>
                                )
                                : (
                                    <Text className="text-xs text-green-600 font-medium">✓ Đã đọc</Text>
                                )
                            }
                        </View>
                    </View>
                ))}
                {filterNotifications().length === 0 && (
                    <View className="flex-row items-center justify-center mt-12">
                        <Text className="text-gray-400">Không có thông báo nào</Text>
                    </View>
                )}
            </ScrollView>
        </DashBoardLayout>
    );
};

export default NotificationPage;
