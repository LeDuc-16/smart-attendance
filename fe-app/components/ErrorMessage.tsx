// components/ErrorMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function ErrorMessage({ text }: { text: string }) {
  return (
    <View className="bg-red-500 p-1">
      <Text className="text-white text-center">{text}</Text>
    </View>
  );
}
