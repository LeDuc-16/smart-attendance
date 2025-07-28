
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import LoginBackGround from './LoginBackGround';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceRegisterPage'>;

const FaceRegisterPage = () => {
    const navigation = useNavigation<Props['navigation']>();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const requestPermissions = async () => {
        const camera = await ImagePicker.requestCameraPermissionsAsync();
        const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!camera.granted || !media.granted) {
            Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền để truy cập camera');
        }
    };

    const handleCapture = async () => {
        await requestPermissions();
        const result = await ImagePicker.launchCameraAsync({
            base64: true,
            quality: 0.7,
            cameraType: ImagePicker.CameraType.front
        });

        if (!result.canceled && result.assets?.length) {
            const photo = result.assets[0];
            setImageUri(photo.uri);
            setBase64Data(photo.base64 || null);
        }
    };

    const handleSubmit = async () => {
        if (!base64Data) {
            Alert.alert('Thông báo', 'Vui lòng chụp ảnh trước');
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch('http://<YOUR_BACKEND_HOST>/api/faces/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Data }),
            });

            const result = await response.json();
            if (response.ok) {
                Alert.alert('Thành công', result.message || 'Đăng ký thành công');
                navigation.navigate('Login');
            } else {
                console.error(result);
                Alert.alert('Lỗi', result.message || 'Đăng ký thất bại');
            }
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể gửi ảnh');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <LoginBackGround>
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="mb-2 text-center text-2xl font-bold text-white">Smart Attendance</Text>
                    <Text className="mb-8 text-center text-sm text-white">Đăng ký khuôn mặt</Text>

                    <View className="w-full max-w-xs rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
                        <Text className="mb-1 text-center text-xl font-bold text-gray-800">
                            ĐĂNG KÝ KHUÔN MẶT
                        </Text>
                        <Text className="mb-4 text-center text-sm text-gray-600">
                            Vui lòng chụp ảnh khuôn mặt
                        </Text>

                        <TouchableOpacity
                            className="mb-4 h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-gray-100"
                            onPress={handleCapture}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Text className="text-gray-500">Chạm để chụp ảnh</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mb-2 w-full rounded-xl bg-blue-600 px-4 py-3"
                            onPress={handleSubmit}
                            disabled={isProcessing}>
                            <Text className="text-center font-bold text-white">
                                {isProcessing ? 'Đang gửi...' : 'Gửi ảnh đăng ký'}
                            </Text>
                        </TouchableOpacity>

                        {/* Nút CHỤP LẠI - chỉ hiện khi đã có ảnh */}
                        {imageUri && (
                            <TouchableOpacity
                                className="mb-2 w-full rounded-xl border border-yellow-400 bg-yellow-100 px-4 py-3"
                                onPress={handleCapture}>
                                <Text className="text-center font-medium text-yellow-800">Chụp lại</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="w-full rounded-xl border border-gray-300 px-4 py-3"
                            onPress={() => navigation.navigate('Login')}>
                            <Text className="text-center font-medium text-gray-700">Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="absolute bottom-0 w-full items-center justify-center p-2">
                    <Text className="text-xs text-white">© 2025 Trường Đại Học Thủy Lợi</Text>
                </View>
            </LoginBackGround>

            <StatusBar style="light" />
        </>
    );
};

export default FaceRegisterPage;