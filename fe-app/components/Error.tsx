import React from 'react';
import { View, Text } from 'react-native';

interface ErrorProps {
  message?: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View className="bg-red-100 p-2 rounded-lg my-1">
      <Text className="text-red-600 text-sm">{message}</Text>
    </View>
  );
};

export default Error;
