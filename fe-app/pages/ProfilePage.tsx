import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { apiAuthService } from '../api/apiAuth';
import DashBoardLayout from './DashBoarLayout';
import { RootStackParamList } from '../App';
import { apiAuthService } from '../api/apiAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilePage'>;

const ProfilePage = ({ navigation }: Props) => {
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'attendance' | 'stats' | 'notification' | 'profile'>('profile');
    const userInfo = apiAuthService.getUserInfo();

    // Lấy thông tin user thực từ API
    const userInfo = apiAuthService.getUserInfo();

    // Helper functions để lấy thông tin theo role
    const getUserName = () => {
        if (!userInfo) return 'Người dùng';
        if (userInfo.role === 'STUDENT') {
            return (userInfo as any).studentName || 'Sinh viên';
        } else if (userInfo.role === 'LECTURER') {
            return (userInfo as any).name || 'Giảng viên';
        }
        return 'Người dùng';
    };

    const getUserCode = () => {
        if (!userInfo) return 'N/A';
        if (userInfo.role === 'STUDENT') {
            return (userInfo as any).studentCode || 'N/A';
        } else if (userInfo.role === 'LECTURER') {
            return (userInfo as any).lecturerCode || 'N/A';
        }
        return 'N/A';
    };

    const getUserEmail = () => {
        if (!userInfo) return 'N/A';
        return userInfo.email || 'N/A';
    };

    const getUserClass = () => {
        if (!userInfo) return 'N/A';
        if (userInfo.role === 'STUDENT') {
            return (userInfo as any).className || 'N/A';
        } else if (userInfo.role === 'LECTURER') {
            return (userInfo as any).academicRank || 'Giảng viên';
        }
        return 'N/A';
    };

    const getUserMajor = () => {
        if (!userInfo || userInfo.role !== 'STUDENT') return null;
        return (userInfo as any).majorName || null;
    };

    const getUserFaculty = () => {
        if (!userInfo) return null;
        if (userInfo.role === 'STUDENT') {
            return (userInfo as any).facultyName || null;
        }
        return null;
    };

    const getUserRole = () => {
        if (!userInfo) return 'N/A';
        return userInfo.role === 'STUDENT' ? 'Sinh viên' : 'Giảng viên';
    };

    // Giả sử trạng thái khuôn mặt - có thể lấy từ API khác 
    const getFaceStatus = () => {
        // Tạm thời fake, 
        return 'Chưa đăng ký';
    };

    const handleTabPress = (tab: string) => {
        setActiveTab(tab as any);
    };

    const handleLogout = async () => {
        try {
            await apiAuthService.logout();

            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        } catch (error) {
            console.error('Logout error:', error);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        }
    };

    if (!userInfo) {
        return (
            <DashBoardLayout
                activeTab={activeTab}
                onTabPress={handleTabPress}
                headerTitle="Smart Attendance"
                headerSubtitle="Thông tin cá nhân"
            >
                <ScrollView className="flex-1 px-2 py-4">
                    <View className="rounded-xl border border-gray-200 bg-white p-4 mx-1">
                        <View className="items-center justify-center py-8">
                            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                            <Text className="text-red-500 mt-2">Không thể tải thông tin người dùng</Text>
                            <TouchableOpacity
                                className="mt-4 bg-blue-500 px-4 py-2 rounded"
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text className="text-white">Đăng nhập lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </DashBoardLayout>
        );
    }

    return (
        <DashBoardLayout
            activeTab={activeTab}
            onTabPress={handleTabPress}
            headerTitle="Smart Attendance"
            headerSubtitle="Thông tin cá nhân"
            userRole={userInfo?.role as any}
            navigation={navigation as any}
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
                            <Text className="text-gray-900 font-semibold">{userInfo?.role === 'STUDENT' ? (userInfo as any)?.studentName : (userInfo as any)?.name}</Text>

                        </View>

                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Mã:</Text>
                            <Text className="text-gray-900">{userInfo?.role === 'STUDENT' ? (userInfo as any)?.studentCode : (userInfo as any)?.lecturerCode}</Text>
                        </View>

                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Email:</Text>
                            <Text className="text-gray-900">{userInfo?.email}</Text>
                        </View>

                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Lớp:</Text>
                            <Text className="text-gray-900">{userInfo?.role === 'STUDENT' ? (userInfo as any)?.className : ''}</Text>
                        </View>

                        {userInfo.role === 'STUDENT' && (
                            <>
                                <View className="flex-row items-center py-1">
                                    <Text className="text-gray-600 w-32">Lớp:</Text>
                                    <Text className="text-gray-900">{getUserClass()}</Text>
                                </View>

                                {getUserMajor() && (
                                    <View className="flex-row items-center py-1">
                                        <Text className="text-gray-600 w-32">Ngành:</Text>
                                        <Text className="text-gray-900">{getUserMajor()}</Text>
                                    </View>
                                )}

                                {getUserFaculty() && (
                                    <View className="flex-row items-center py-1">
                                        <Text className="text-gray-600 w-32">Khoa:</Text>
                                        <Text className="text-gray-900">{getUserFaculty()}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {userInfo.role === 'LECTURER' && getUserClass() !== 'Giảng viên' && (
                            <View className="flex-row items-center py-1">
                                <Text className="text-gray-600 w-32">Học hàm:</Text>
                                <Text className="text-gray-900">{getUserClass()}</Text>
                            </View>
                        )}

                        <View className="flex-row items-center py-1">
                            <Text className="text-gray-600 w-32">Trạng thái khuôn mặt:</Text>
                            <View className="ml-1 bg-black px-2 py-1 rounded-full">
                                <Text className="text-xs text-white font-semibold">{userInfo?.faceId ? 'Đã đăng ký' : 'Chưa đăng ký'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="my-3">
                        {getFaceStatus() === 'Chưa đăng ký' && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center mb-2 bg-blue-500 py-2 rounded"
                                onPress={() => {
                                    // Navigate to face registration page
                                    // navigation.navigate('FaceRegisterPage');
                                }}
                            >
                                <MaterialIcons name="face" size={20} color="white" />
                                <Text className="ml-2 text-base text-white font-medium">Đăng ký lại</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-red-500 py-2 rounded"
                            onPress={handleLogout}
                        >
                            <MaterialIcons name="logout" size={20} color="white" />
                            <Text className="ml-2 text-base text-white font-medium">Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </DashBoardLayout>
    );
};

export default ProfilePage;
