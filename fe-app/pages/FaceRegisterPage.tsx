import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginBackGround from './LoginBackGround';
import { StatusBar } from 'expo-status-bar';
import FaceApiManager from '../utils/faceApiSetup';
import { setupFaceApiEnvironment } from '../utils/polyfills';

type Props = NativeStackScreenProps<any, 'FaceRegisterPage'>;

// Helper function để tính trung bình các descriptors
const calculateAverageDescriptor = (descriptors: number[][]): number[] => {
  if (descriptors.length === 0) return [];

  const descriptorLength = descriptors[0].length;
  const avgDescriptor = new Array(descriptorLength).fill(0);

  // Tính tổng
  descriptors.forEach((descriptor) => {
    descriptor.forEach((value, index) => {
      avgDescriptor[index] += value;
    });
  });

  // Tính trung bình
  return avgDescriptor.map((sum) => sum / descriptors.length);
};

const FaceRegisterPage = () => {
  const navigation = useNavigation<Props['navigation']>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [faceDescriptors, setFaceDescriptors] = useState<number[][]>([]);
  const [instruction, setInstruction] = useState('Hướng mặt thẳng vào camera');
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceApiReady, setFaceApiReady] = useState(false);

  const instructions = [
    'Hướng mặt thẳng vào camera',
    'Xoay mặt sang trái',
    'Xoay mặt sang phải',
    'Nghiêng đầu lên',
    'Nghiêng đầu xuống',
  ];

  useEffect(() => {
    const initializeFaceApi = async () => {
      try {
        setupFaceApiEnvironment();
        const faceApiManager = FaceApiManager.getInstance();
        await faceApiManager.initialize();
        setFaceApiReady(true);
        console.log('Face-api ready for use');
      } catch (error) {
        console.error('Failed to initialize face-api:', error);
        Alert.alert(
          'Lỗi',
          'Không thể khởi tạo hệ thống nhận dạng khuôn mặt. Vui lòng kiểm tra kết nối hoặc khởi động lại ứng dụng.'
        );
        setFaceApiReady(false);
      }
    };

    if (!permission?.granted) {
      requestPermission();
    }

    initializeFaceApi();
  }, [permission, requestPermission]);

  const captureFaceDescriptor = async () => {
    if (!cameraRef.current) return;

    // Chỉ cho phép chụp khi face-api đã sẵn sàng
    if (!faceApiReady) {
      Alert.alert('Thông báo', 'Hệ thống nhận dạng khuôn mặt chưa sẵn sàng. Vui lòng đợi.');
      return;
    }

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo) {
        try {
          const faceApiManager = FaceApiManager.getInstance();
          const detections = await faceApiManager.detectFaces(photo.uri);

          if (detections.length > 0) {
            const realDescriptor = Array.from(detections[0].descriptor) as number[];
            setFaceDescriptors((prev) => [...prev, realDescriptor]);

            // Move to next instruction
            if (currentStep < instructions.length - 1) {
              setCurrentStep((prev) => prev + 1);
              setInstruction(instructions[currentStep + 1]);
              Alert.alert(
                'Thành công',
                `Đã thu thập ảnh ${currentStep + 1}/${instructions.length}`
              );
            } else {
              Alert.alert('Hoàn thành', 'Đã thu thập đủ dữ liệu khuôn mặt!');
            }
          } else {
            Alert.alert('Thông báo', 'Không phát hiện khuôn mặt. Vui lòng thử lại.');
          }
        } catch (error) {
          console.error('Face detection error:', error);
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận dạng khuôn mặt. Vui lòng thử lại.');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (faceDescriptors.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thu thập ít nhất 1 ảnh khuôn mặt');
      return;
    }

    try {
      // Gửi face data lên backend sử dụng apiFaceRegisterService
      const descriptorStrings = faceDescriptors.map((desc) => JSON.stringify(desc));

      // Mock API call - thay thế cho apiFaceRegisterService.registerMultipleFaces
      const results = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Đăng ký khuôn mặt thành công',
            data: {
              userId: '20210001',
              faces: descriptorStrings.length,
            },
          });
        }, 1000);
      });

      Alert.alert('Thành công', 'Đăng ký khuôn mặt thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (err: any) {
      console.error('Face registration error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể đăng ký khuôn mặt');
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <LoginBackGround>
        <View style={styles.container}>
          <Text style={styles.message}>Chúng tôi cần quyền truy cập camera</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Cấp quyền camera</Text>
          </TouchableOpacity>
        </View>
      </LoginBackGround>
    );
  }

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
            <Text className="mb-4 text-center text-sm text-gray-600">{instruction}</Text>

            <View className="mb-2 flex-row items-center justify-center">
              <View
                className={`mr-2 h-2 w-2 rounded-full ${faceApiReady ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <Text className="text-xs text-gray-500">
                {faceApiReady
                  ? 'Hệ thống nhận dạng: Sẵn sàng'
                  : 'Hệ thống nhận dạng: Đang khởi tạo...'}
              </Text>
            </View>

            <View className="mb-4 h-64 w-full overflow-hidden rounded-xl">
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
            </View>

            <Text className="mb-2 text-center text-sm text-gray-600">
              Đã thu thập: {faceDescriptors.length}/{instructions.length} ảnh
            </Text>

            <TouchableOpacity
              className={`mb-2 w-full rounded-xl px-4 py-3 ${
                isProcessing || !faceApiReady ? 'bg-gray-400' : 'bg-blue-600'
              }`}
              onPress={captureFaceDescriptor}
              disabled={isProcessing || !faceApiReady}>
              <Text className="text-center font-bold text-white">
                {isProcessing
                  ? 'Đang xử lý...'
                  : !faceApiReady
                    ? 'Đang khởi tạo hệ thống...'
                    : `Chụp ảnh (${currentStep + 1}/${instructions.length})`}
              </Text>
            </TouchableOpacity>

            {faceDescriptors.length > 0 && (
              <TouchableOpacity
                className="mb-2 w-full rounded-xl bg-green-600 px-4 py-3"
                onPress={handleSubmit}>
                <Text className="text-center font-bold text-white">Hoàn thành đăng ký</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default FaceRegisterPage;
