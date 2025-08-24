import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginBackGround from './LoginBackGround';
import { apiFaceService } from '../api/apiFace';

const instructions = [
  'Ngẩng nhẹ, trán rõ',
  'Hơi ngước xuống, cằm rõ',
  'Quay sang trái một chút',
  'Quay sang phải một chút',
  'Nhìn thẳng vào camera',
];

const positions = ['top', 'bottom', 'left', 'right', 'center'] as const;

const FaceRegisterPage = () => {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<any>(null);

  const [images, setImages] = useState<Array<{ uri: string; type?: string; name?: string } | null>>(
    Array(5).fill(null)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) requestPermission();

    // If the user already has registered faces, skip this page and go to dashboard
    (async () => {
      try {
        const { apiAuthService } = await import('../api/apiAuth');
        const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
        if (!token) return;
        apiFaceService.setAuthToken(token);
        const has = await apiFaceService.hasRegisteredFaces();
        if (has) {
          navigation.navigate('AttendancePage');
        }
      } catch (err) {
        // ignore - don't block the user
      }
    })();
  }, []);

  const ensurePermission = async () => {
    if (!permission || !permission.granted) await requestPermission();
  };

  const captureImage = async () => {
    try {
      await ensurePermission();
      if (!cameraRef.current) throw new Error('Camera not ready');

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo.uri) return;

      setImages((prev) => {
        const copy = [...prev];
        copy[currentIndex] = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `capture-${Date.now()}.jpg`,
        };
        return copy;
      });
      setCurrentIndex((ci) => Math.min(4, ci + 1));
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể chụp ảnh.');
    }
  };

  const resetImages = () => {
    setImages(Array(5).fill(null));
    setCurrentIndex(0);
  };

  const submitImages = async () => {
    if (images.some((img) => !img)) {
      Alert.alert('Lỗi', 'Vui lòng chụp đủ 5 ảnh.');
      return;
    }

    setLoading(true);
    try {
      const { apiAuthService } = await import('../api/apiAuth');
      let token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (!token) throw new Error('JWT token không tồn tại');

      apiFaceService.setAuthToken(token);

      const imageFiles: any = {};
      positions.forEach((pos, idx) => {
        const it = images[idx];
        imageFiles[pos] = {
          uri: it!.uri,
          type: it!.type || 'image/jpeg',
          name: it!.name || `${pos}-${Date.now()}.jpg`,
        };
      });

      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log('Register face payload:', imageFiles);
        } catch (_) {}
      }

      const resp = await apiFaceService.registerFace(imageFiles);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Register face response:', resp);
      }

      Alert.alert('Thành công', 'Đăng ký khuôn mặt thành công!');
      resetImages(); // Clear images after success
      navigation.navigate('AttendancePage');
    } catch (err: any) {
      console.error(err);
      // Extract specific error message for face detection failure
      let errorMessage = err?.message || 'Đăng ký thất bại';
      if (errorMessage.includes('Face detection failed for image')) {
        errorMessage += '\nVui lòng chụp lại ảnh theo hướng dẫn.';
      }
      Alert.alert('Lỗi', errorMessage, [
        {
          text: 'Chụp lại toàn bộ',
          onPress: resetImages,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginBackGround>
      <View className="flex-1 items-center justify-center px-4">
        <View className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
          <Text className="mb-2 text-center text-xl font-extrabold text-gray-800">
            ĐĂNG KÝ KHUÔN MẶT
          </Text>
          <Text className="mb-6 text-center text-sm text-gray-500">
            Hoàn tất 5 ảnh theo hướng dẫn
          </Text>

          <View className="mb-4 h-80 w-full overflow-hidden rounded-lg bg-black">
            {!permission?.granted ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-400">Ứng dụng cần quyền camera</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {/* CameraView must not have children; overlay is a sibling absolutely positioned */}
                <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
                <View className="absolute top-2 w-full items-center">
                  <Text className="font-bold text-white">{instructions[currentIndex]}</Text>
                </View>
              </View>
            )}
          </View>

          <View className="mb-4 flex-row justify-between">
            {positions.map((pos, idx) => (
              <TouchableOpacity
                key={pos}
                onPress={() => setCurrentIndex(idx)}
                className="flex-1 items-center">
                <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-200">
                  {images[idx] ? (
                    <Image source={{ uri: images[idx]!.uri }} className="h-full w-full" />
                  ) : (
                    <Text className="text-xs">{pos}</Text>
                  )}
                </View>
                <Text className="mt-1 text-xs text-gray-500">{pos}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="mb-3 rounded-2xl bg-blue-700 p-4"
            onPress={captureImage}
            disabled={loading}>
            <Text className="text-center font-bold text-white">Chụp tại đây</Text>
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-2xl bg-yellow-400 p-3"
              onPress={() => {
                const copy = [...images];
                copy[currentIndex] = null;
                setImages(copy);
              }}>
              <Text className="text-center font-bold text-black">Chụp lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-2xl p-3 ${images.every(Boolean) ? 'bg-green-600' : 'bg-gray-300'}`}
              onPress={submitImages}
              disabled={!images.every(Boolean) || loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-center font-bold ${images.every(Boolean) ? 'text-white' : 'text-gray-500'}`}>
                  Đăng ký
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LoginBackGround>
  );
};

export default FaceRegisterPage;