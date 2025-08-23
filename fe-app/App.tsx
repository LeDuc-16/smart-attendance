import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import LoginPage from './pages/LoginPage';
import ForgetPassPage from './pages/ForgetPassPage';
import OtpPage from './pages/OtpPage';
import { ChangePassPage } from './pages/ChangePassPage';
import NewPassWordPage from './pages/NewPassWordPage';
import DashBoardPage from './pages/DashBoardPage';
import AttendancePage from './pages/AttendancePage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';
import TeachingSchedulePage from './pages/TeachingSchedulePage';
import DashBoarLayout from './pages/DashBoarLayout';
// Define the type for your stack navigator routes
export type RootStackParamList = {
  Login: undefined;
  ForgetPass: undefined;
  OtpPage: undefined;
  ChangePassPage: undefined;
  NewPassWordPage: { otpCode: string };
  DashBoardPage: undefined;
  AttendancePage: undefined;
  NotificationPage: undefined;
  ProfilePage: undefined;
  StatsPage: undefined;
  TeachingSchedulePage: undefined;
};

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Ẩn header để giữ UI clean
        }}>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="ForgetPass" component={ForgetPassPage} />
        <Stack.Screen name="OtpPage" component={OtpPage} />
        <Stack.Screen name="ChangePassPage" component={ChangePassPage} />
        <Stack.Screen name="NewPassWordPage" component={NewPassWordPage} />
        <Stack.Screen name="DashBoardPage" component={DashBoardPage} />
        <Stack.Screen name="AttendancePage">
          {(props) => (
            <DashBoarLayout activeTab="attendance" userRole="LECTURER" navigation={props.navigation as any}>
              <AttendancePage {...props} />
            </DashBoarLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="NotificationPage" component={NotificationPage} />
        <Stack.Screen name="ProfilePage" component={ProfilePage} />
        <Stack.Screen name="StatsPage" component={StatsPage} />
        <Stack.Screen name="TeachingSchedulePage" component={TeachingSchedulePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
