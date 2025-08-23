import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilePage'>;

const fakeUser = {
    name: 'Nguyễn Văn Nam',
    code: '20210001',
    email: '20210001@e.tlu.edu.vn',
    className: 'IT6-01',
    faceStatus: 'Đã đăng ký', // hoặc 'Chưa đăng ký'
};

const ProfilePage = ({ navigation }: Props) => {
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'>('profile');

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
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        // Gọi modal xác nhận nếu muốn
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <DashBoardLayout
            activeTab={activeTab}
            onTabPress={handleTabPress}
            headerTitle="Smart Attendance"
            headerSubtitle="Thông tin cá nhân"
        >
            <ScrollView className="flex-1 px-2 py-4">
                <View className="rounded-xl border border-gray-200 bg-white p-4 mx-1">
                    {/* Header */}
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="person-outline" size={20} color="#666" />
                        <Text className="ml-2 text-base text-gray-800 font-semibold">Thông tin cá nhân</Text>
                    </View>

                    {/* Avatar */}
                    <View className="items-center my-3">
                        <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-2">
                            <MaterialIcons name="person" size={48} color="#bdbdbd" />
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View className="mb-2">
                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Họ và tên:</Text>
                            <Text className="text-gray-900 font-semibold">{fakeUser.name}</Text>
                        </View>
                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Mã sinh viên:</Text>
                            <Text className="text-gray-900">{fakeUser.code}</Text>
                        </View>
                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Email:</Text>
                            <Text className="text-gray-900">{fakeUser.email}</Text>
                        </View>
                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Lớp:</Text>
                            <Text className="text-gray-900">{fakeUser.className}</Text>
                        </View>
                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Trạng thái khuôn mặt:</Text>
                            <View className="ml-1 bg-black px-2 py-1 rounded-full">
                                <Text className="text-xs text-white font-semibold">{fakeUser.faceStatus}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="my-3">
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-pink-500 py-2 rounded"
                            onPress={handleLogout}
                        >
                            <Text className="text-base text-white font-medium">Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </DashBoardLayout>
    );
};

export default ProfilePage;
