import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import LoginPage from './pages/LoginPage';
import ForgetPassPage from './pages/ForgetPassPage';
import OtpPage from './pages/OtpPage';
import FaceRegisterPage from './pages/FaceRegisterPage';
import { ChangePassPage } from './pages/ChangePassPage';
import { RootStackParamList } from './types/navigation';

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
        <Stack.Screen name="FaceRegisterPage" component={FaceRegisterPage} />
        <Stack.Screen name="ChangePassPage" component={ChangePassPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
