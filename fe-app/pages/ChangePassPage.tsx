import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

type Props = NativeStackScreenProps<any, 'ChangePassPage'>;

export const ChangePassPage = () => {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="mb-4 text-center text-2xl font-bold">Change Password Page</Text>
      <Text className="text-center text-gray-600">This is where you can change</Text>
    </View>
  );
};
