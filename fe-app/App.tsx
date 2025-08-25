import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import LoginPage from './pages/student/LoginPage';
import ForgetPassPage from './pages/student/ForgetPassPage';
import { ChangePassPage } from './pages/student/ChangePassPage';
import DashBoardPage from './pages/student/DashBoardPage';
import AttendancePage from './pages/student/AttendancePage';
import StatsPage from 'pages/student/HistoryPage';
import FaceRegisterPage from './pages/student/FaceRegisterPage';
import StudentPage from './pages/student/StudentPage';
import SchedulePage from './pages/student/SchedulePage';
import OtpPage from 'pages/student/OtpPage';
import NewPassWordPage from 'pages/student/NewPassWordPage';
import NotificationPage from 'pages/student/NotificationPage';
import ProfilePage from 'pages/student/ProfilePage';
import HistoryPage from 'pages/student/HistoryPage';
import DashBoardPageLecturer from 'pages/lecturer/DashBoardPageLecturer';
import TeachingSchedulePageLecturer from './pages/lecturer/TeachingSchedulePageLecturer';
import AttendancePageLecturer from './pages/lecturer/AttendancePageLecturer';
import ReportPageLecturer from './pages/lecturer/ReportPageLecturer';
import StudentListPage from './pages/lecturer/StudentListPage';

// Define the type for your stack navigator routes
export type RootStackParamList = {
  Login: undefined;
  ForgetPass: undefined;
  OtpPage: undefined;
  ChangePassPage: undefined;
  NewPassWordPage: { otpCode: string };
  FaceRegisterPage: undefined;
  DashBoardPage: undefined;
  AttendancePage: undefined;
  SchedulePage: undefined;
  StudentPage: undefined;
  NotificationPage: undefined;
  ProfilePage: undefined;
  HistoryPage: undefined;
  DashBoardPageLecturer: undefined;
  SchedulePageLecturer: undefined;
  AttendancePageLecturer: undefined;
  ReportPageLecturer: undefined;
  StudentListPage: { className: string; scheduleId: string; date: string };
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
        <Stack.Screen name="FaceRegisterPage" component={FaceRegisterPage} />
        <Stack.Screen name="SchedulePage" component={SchedulePage} />
        <Stack.Screen name="StudentPage" component={StudentPage} />
        <Stack.Screen name="AttendancePage" component={AttendancePage} />
        <Stack.Screen name="NotificationPage" component={NotificationPage} />
        <Stack.Screen name="ProfilePage" component={ProfilePage} />
        <Stack.Screen name="HistoryPage" component={HistoryPage} />
        <Stack.Screen name="DashBoardPageLecturer" component={DashBoardPageLecturer} />
        <Stack.Screen name="SchedulePageLecturer" component={TeachingSchedulePageLecturer} />
        <Stack.Screen name="AttendancePageLecturer" component={AttendancePageLecturer} />
        <Stack.Screen name="ReportPageLecturer" component={ReportPageLecturer} />
        <Stack.Screen name="StudentListPage" component={StudentListPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
