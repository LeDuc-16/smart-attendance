import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StudentDetailCardProps {
  studentName: string;
  studentId: string;
  isVisible: boolean;
}

const StudentDetailCard: React.FC<StudentDetailCardProps> = ({ studentName, studentId, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View className="bg-white rounded-lg shadow-md p-4 m-4 w-80">
      <Text className="text-lg font-bold mb-2">Thông tin sinh viên</Text>
      <View className="flex-row justify-between mb-1">
        <Text className="text-base font-semibold">Họ tên:</Text>
        <Text className="text-base">{studentName}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-base font-semibold">Mã SV:</Text>
        <Text className="text-base">{studentId}</Text>
      </View>
    </View>
  );
};

export default StudentDetailCard;
