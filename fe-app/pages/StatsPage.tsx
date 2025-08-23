import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'StatsPage'>;

type AttendanceStatus = 'Có mặt' | 'Đi muộn' | 'Vắng';

const statusBadgeStyle = {
    'Có mặt': { bg: '#def7ec', color: '#38b48f' },
    'Đi muộn': { bg: '#fff7db', color: '#eab308' },
    'Vắng': { bg: '#fde8e8', color: '#ee5859' },
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

const StatsPage = ({ navigation }: Props) => {
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'>('stats');

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
                navigation.navigate('NotificationPage');
                break;
            case 'profile':
                navigation.navigate('ProfilePage');
                break;
            case 'stats':
                break;
            default:
                break;
        }
    };

    return (
        <DashBoardLayout
            activeTab={activeTab}
            onTabPress={handleTabPress}
            headerTitle="Smart Attendance"
            headerSubtitle="Lịch sử điểm danh"
        >
            <ScrollView className="flex-1 px-2 py-4">
                {fakeAttendanceHistory.map(item => (
                    <View
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 mb-3"
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-semibold text-gray-900">{item.subject}</Text>
                            <View
                                style={{
                                    backgroundColor: statusBadgeStyle[item.status].bg,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text
                                    style={{
                                        color: statusBadgeStyle[item.status].color,
                                        fontWeight: 'bold',
                                        fontSize: 13,
                                    }}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-xs text-gray-700 mb-1">{item.time}</Text>
                        <Text className="text-xs text-gray-500">{item.checkedAt}</Text>
                    </View>
                ))}
                {fakeAttendanceHistory.length === 0 && (
                    <View className="flex-row items-center justify-center mt-12">
                        <Text className="text-gray-400">Chưa có lịch sử điểm danh</Text>
                    </View>
                )}
            </ScrollView>
        </DashBoardLayout>
    );
};

export default StatsPage;
