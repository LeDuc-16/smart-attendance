import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface LoginBackGroundProps {
  children: React.ReactNode;
}

const LoginBackGround = ({ children }: LoginBackGroundProps) => {
  return (
    //Bat su kien ngoai out put 
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View className="flex-1 bg-blue-900">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-white sm:-left-36 sm:-top-36 sm:h-72 sm:w-72 md:-left-48 md:-top-48 md:h-96 md:w-96" />
            <View className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-white sm:-bottom-24 sm:-right-24 sm:h-48 sm:w-48 md:-bottom-32 md:-right-32 md:h-64 md:w-64" />
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginBackGround;
