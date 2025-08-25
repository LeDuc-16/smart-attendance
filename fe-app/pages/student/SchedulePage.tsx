import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ErrorMessage from '../../components/ErrorMessage';
import DashBoardLayout from './DashBoarLayout';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';
import { apiAuthService } from '../../api/apiAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<any, 'SchedulePage'>;

interface StudentScheduleCardProps {
    schedule: Schedule;
}

export const StudentScheduleCard: React.FC<StudentScheduleCardProps> = ({ schedule }) => {
    const subject = schedule.subjectName;
    const time = `${schedule.startTime} - ${schedule.endTime}`;
    const room = schedule.classroomName;
    const date = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN', { weekday: 'long' }) : '';
    const lecturerName = schedule.lecturerName;
    const isOpen = schedule.isOpen;

    return (
        <View className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${isOpen ? 'border-green-500' : 'border-blue-500'} mb-4`}>
            <View className="flex-row items-center mb-2">
                <MaterialIcons name="book" size={20} color="#6b7280" />
                <Text className="ml-2 font-bold text-gray-800 text-base">{subject}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-1">
                <MaterialIcons name="schedule" size={16} color="#6b7280" /> {time} | <MaterialIcons name="location-on" size={16} color="#6b7280" /> {room} | {date}
            </Text>
            {lecturerName && (
                <Text className="text-sm text-gray-600 mb-1">
                    <MaterialIcons name="person" size={16} color="#6b7280" /> Giảng viên: {lecturerName}
                </Text>
            )}
            <View className="mt-2">
                {isOpen ? (
                    <Text className="text-sm text-green-600">Đang mở điểm danh</Text>
                ) : (
                    <Text className="text-sm text-red-600">Hiện tại giảng viên chưa mở điểm danh</Text>
                )}
            </View>
        </View>
    );
};

interface CalendarProps {
    calendarDate: Date;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

// --- Calendar Component (Dynamic) ---
const Calendar: React.FC<CalendarProps> = ({ calendarDate, selectedDate, setSelectedDate, onPrevMonth, onNextMonth }) => {
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon,...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust firstDayOfMonth to be 0=Mon, 6=Sun
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const dates = Array.from({ length: offset + daysInMonth }, (_, i) => {
        return i >= offset ? i - offset + 1 : null;
    });

    // Pad the end of the array with nulls to make it a multiple of 7
    while (dates.length % 7 !== 0) {
        dates.push(null);
    }

    const weeks = [];
    for (let i = 0; i < dates.length; i += 7) {
        weeks.push(dates.slice(i, i + 7));
    }

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

    return (
        <View className="bg-white rounded-xl shadow-md p-4">
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={onPrevMonth}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#6b7280" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-800">{`${monthNames[month]}, ${year}`}</Text>
                <TouchableOpacity onPress={onNextMonth}>
                    <MaterialIcons name="arrow-forward-ios" size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>
            <View className="flex-row justify-around">
                {weekDays.map(day => <Text key={day} className="font-semibold text-sm text-gray-500 w-8 text-center">{day}</Text>)}
            </View>
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-around mt-2">
                    {week.map((date, dateIndex) => (
                        <View key={dateIndex} className="py-1 w-8 h-8 items-center justify-center">
                            {date ? (
                                <TouchableOpacity
                                    onPress={() => setSelectedDate(new Date(year, month, date))}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        selectedDate &&
                                        date === selectedDate.getDate() &&
                                        month === selectedDate.getMonth() &&
                                        year === selectedDate.getFullYear()
                                        ? 'bg-blue-500' : ''
                                    }`}
                                >
                                    <Text className={`text-sm ${
                                        selectedDate &&
                                        date === selectedDate.getDate() &&
                                        month === selectedDate.getMonth() &&
                                        year === selectedDate.getFullYear()
                                        ? 'text-white font-bold' : 'text-gray-800'
                                    }`}>
                                        {date}
                                    </Text>
                                </TouchableOpacity>
                            ) : <View className="w-8 h-8" />}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};


const SchedulePage = ({ navigation }: Props) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());


  useEffect(() => {
    loadAllSchedules();
  }, []);

  const loadAllSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const token = apiAuthService.getAuthToken() || (await AsyncStorage.getItem('jwtToken'));
      if (token) apiScheduleService.setAuthToken(token);

      const res = await apiScheduleService.getMySchedule();
      setSchedules(res.schedules || []);
    } catch (err: any) {
      console.error('Error loading schedules in SchedulePage:', err);
      setError(err?.message || 'Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filteredSchedules = schedules.filter(schedule => {
    const studyDate = new Date(schedule.date);
    return (
        studyDate.getFullYear() === selectedDate.getFullYear() &&
        studyDate.getMonth() === selectedDate.getMonth() &&
        studyDate.getDate() === selectedDate.getDate()
    );
  });

  const scheduleContent = filteredSchedules.length > 0 ? (
    filteredSchedules.map((s) => (
        <StudentScheduleCard key={s.id} schedule={s} />
    ))
  ) : (
    <Text className="text-center text-gray-500 text-base">Không có lịch học vào ngày này.</Text>
  );

  const content = (
    <ScrollView className="flex-1 p-4">
        <View className="p-4">
            <Calendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarDate={calendarDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
            />

            <View className="mt-6">
                <Text className="font-bold text-lg text-gray-800 mb-2">
                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <View className="space-y-4">
                    {loading ? (
                        <Text className="text-center text-gray-500 text-base">Đang tải lịch học...</Text>
                    ) : error ? (
                        <TouchableOpacity onPress={() => setError('')} className="mb-4">
                            <ErrorMessage text={error} />
                        </TouchableOpacity>
                    ) : (
                        <>{scheduleContent}</>
                    )}
                </View>
            </View>
        </View>
    </ScrollView>
  );

  const anyOpen = schedules.some((s) => s.isOpen === true);
  const headerSubtitle = anyOpen
    ? 'Có lịch đang mở điểm danh'
    : 'Hiện tại giảng viên chưa mở điểm danh';

  return (
    <DashBoardLayout
      defaultActiveTab="schedule"
      headerTitle="Lịch học"
      headerSubtitle={headerSubtitle}>
      {content}
    </DashBoardLayout>
  );
};

export default SchedulePage;