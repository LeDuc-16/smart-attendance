import React from 'react';
import { Text, TextInput, View, TextInputProps, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MyInputProps extends TextInputProps {
  label: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconSize?: number;
  error?: string;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
}

export default function MyInput({
  label,
  labelClassName = 'text-gray-700 font-semibold mb-2 text-sm sm:text-base md:text-lg',
  inputClassName = 'ml-3 flex-1 text-gray-800 text-sm sm:text-base md:text-lg',
  containerClassName = 'mb-1 w-full',
  iconName,
  iconColor = '#6B7280',
  iconSize = 22,
  error,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}: MyInputProps) {
  return (
    <View className={containerClassName}>
      <Text className={labelClassName}>{label}</Text>
      <View className="w-full flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors focus:border-blue-500 sm:p-4 md:p-5">
        {iconName && <MaterialIcons name={iconName} size={iconSize} color={iconColor} />}
        <TextInput
          className={inputClassName}
          placeholderTextColor="#9CA3AF"
          style={{
            paddingVertical: 4,
            fontSize: 16,
            lineHeight: 20,
          }}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <MaterialIcons name={rightIcon} size={iconSize} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="mt-1 text-xs font-bold italic text-red-500 sm:text-sm md:text-base">
          {error}
        </Text>
      )}
    </View>
  );
}
