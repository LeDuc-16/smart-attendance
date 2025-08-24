import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginBackGround from './LoginBackGround';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const ensurePermission = async () => {
    if (!permission || !permission.granted) await requestPermission();
  };

  const captureImage = async () => {
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
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
      setError('Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const resetImages = () => {
    setImages(Array(5).fill(null));
    setCurrentIndex(0);
    setError(''); // Clear errors when resetting
    setSuccess(''); // Clear success when resetting
  };

  const submitImages = async () => {
    if (images.some((img) => !img)) {
      setError('Vui lòng chụp đủ 5 ảnh.');
      return;
    }

    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
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

      // Show success message
      setSuccess('Đăng ký khuôn mặt thành công!');
      resetImages(); // Clear images after success

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigation.navigate('DashBoardPage');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      // Extract specific error message for face detection failure
      let errorMessage = err?.message || 'Đăng ký thất bại';
      if (errorMessage.includes('Face detection failed for image')) {
        errorMessage =
          'Không phát hiện được khuôn mặt trong ảnh. Vui lòng chụp lại ảnh theo hướng dẫn.';
      }
      setError(errorMessage);
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

          {error ? <ErrorMessage text={error} /> : null}
          {success ? <SuccessMessage text={success} /> : null}

          <View className="mb-4 h-80 w-full overflow-hidden rounded-lg bg-black">
            {!permission?.granted ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-400">Ứng dụng cần quyền camera</Text>
              </View>
            ) : (
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
                <View className="absolute top-2 w-full items-center">
                  <Text className="font-bold text-white">{instructions[currentIndex]}</Text>
                </View>
              </CameraView>
            )}
          </View>

          <View className="mb-4 flex-row justify-between">
            {positions.map((pos, idx) => (
              <TouchableOpacity
                key={pos}
                onPress={() => {
                  setCurrentIndex(idx);
                  setError(''); // Clear error when user selects a position
                  setSuccess(''); // Clear success when user selects a position
                }}
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

          {error && (
            <TouchableOpacity className="mb-3 rounded-2xl bg-red-500 p-3" onPress={resetImages}>
              <Text className="text-center font-bold text-white">Chụp lại toàn bộ</Text>
            </TouchableOpacity>
          )}

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-2xl bg-yellow-400 p-3"
              onPress={() => {
                const copy = [...images];
                copy[currentIndex] = null;
                setImages(copy);
                setError(''); // Clear error when user takes action
                setSuccess(''); // Clear success when user takes action
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

          <TouchableOpacity
            className="mb-3 rounded-2xl bg-gray-700 p-4 mt-4"
            onPress={navigation.goBack}
            disabled={loading}>
            <Text className="text-center font-bold text-white">Quay lại đăng nhập</Text>
          </TouchableOpacity>

        </View>
      </View>
    </LoginBackGround>
  );
};

export default FaceRegisterPage;
