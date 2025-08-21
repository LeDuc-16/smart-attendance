// components/SuccessMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function SuccessMessage({ text }: { text: string }) {
  return (
    <View className="bg-green-500 p-2 rounded-md">
      <Text className="text-white">{text}</Text>
    </View>
  );
}
