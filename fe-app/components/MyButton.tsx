import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, GestureResponderEvent } from 'react-native';

interface MyButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  isLoading?: boolean;
  buttonClassName?: string;
  textClassName?: string;
  spinnerColor?: string;
}

export default function MyButton({
  title,
  onPress,
  isLoading = false,
  buttonClassName = 'mb-4 sm:mb-6 md:mb-8 flex-row items-center justify-center rounded-xl bg-blue-800 p-3 sm:p-4 md:p-5 shadow-lg transition-transform active:scale-95 w-full',
  textClassName = 'ml-2 text-center text-base sm:text-lg md:text-xl font-bold text-white',
  spinnerColor = '#fff',
}: MyButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className={buttonClassName}
      activeOpacity={0.8}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={spinnerColor} style={{ marginRight: 8 }} />
          <Text className={textClassName}>Đang xử lý...</Text>
        </>
      ) : (
        <Text className={textClassName}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
