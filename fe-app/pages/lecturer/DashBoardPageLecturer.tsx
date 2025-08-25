import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import DashBoarLayout from '../student/DashBoarLayout';

export type RootStackParamList = {
  // ...other routes
  DashBoardPageLecturer: undefined; // or specify params
};

type Props = NativeStackScreenProps<RootStackParamList, 'DashBoardPageLecturer'>;

const DashBoardPageLecturer: React.FC<Props> = () => {
  const content = (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>DashBoardPageLecturer</Text>
        <Text style={{ marginTop: 8, color: '#666' }}>
          This page reuses the student DashBoarLayout.
        </Text>
      </View>
    </ScrollView>
  );

  return <DashBoarLayout>{content}</DashBoarLayout>;
};

export default DashBoardPageLecturer;
