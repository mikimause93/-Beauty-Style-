import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentsScreen } from '../screens/Appointments/AppointmentsScreen';
import { BookAppointmentScreen } from '../screens/Appointments/BookAppointmentScreen';
import { AppointmentDetailScreen } from '../screens/Appointments/AppointmentDetailScreen';
import { SelectSalonScreen } from '../screens/Appointments/SelectSalonScreen';
import { SelectServiceScreen } from '../screens/Appointments/SelectServiceScreen';
import { ConfirmBookingScreen } from '../screens/Appointments/ConfirmBookingScreen';
import { AppointmentStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AppointmentStackParamList>();

export function AppointmentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="SelectSalon" component={SelectSalonScreen} />
      <Stack.Screen name="SelectService" component={SelectServiceScreen} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
    </Stack.Navigator>
  );
}
