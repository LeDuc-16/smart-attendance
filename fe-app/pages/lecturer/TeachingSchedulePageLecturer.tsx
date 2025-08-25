import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DashBoardLayoutLecturer from './DashBoardLayoutLecturer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiAuthService } from '../../api/apiAuth';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';

// --- Calendar Component (Dynamic) ---
const Calendar = ({ calendarDate, selectedDate, setSelectedDate, onPrevMonth, onNextMonth }) => {
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


const ScheduleCard = ({ subject, className, time, room, color }) => {
    const borderColor = color === 'blue' ? 'border-blue-500' : 'border-green-500';
    const locationColor = color === 'blue' ? 'text-blue-500' : 'text-green-500';

    return (
        <View className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${borderColor} mb-4`}>
            <Text className="font-bold text-gray-800 text-base">{subject}</Text>
            <Text className="text-sm text-gray-500 mb-3">{className}</Text>
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <MaterialIcons name="schedule" size={20} color="#6b7280" />
                    <Text className="text-gray-600 text-sm">{time}</Text>
                </View>
                <View className={`flex-row items-center gap-2`}>
                    <MaterialIcons name="location-on" size={20} color={color === 'blue' ? '#3b82f6' : '#22c55e'} />
                    <Text className={`font-semibold text-sm ${locationColor}`}>{room}</Text>
                </View>
            </View>
        </View>
    );
};


const TeachingSchedulePageLecturer = ({ navigation }: NativeStackScreenProps<any>) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userInfo = apiAuthService.getUserInfo();

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = apiAuthService.getAuthToken();
                if (token) {
                    apiScheduleService.setAuthToken(token);
                } else {
                    setError('Authentication token not found.');
                    setLoading(false);
                    return;
                }

                if (userInfo?.role === 'LECTURER') {
                    const response = await apiScheduleService.getMySchedule();
                    setSchedules(response.schedules);
                } else {
                    setSchedules([]);
                }

            } catch (err) {
                console.error('Failed to fetch schedule data:', err);
                setError('Failed to load schedule data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleData();
    }, []);

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
        filteredSchedules.map((schedule, index) => {
            const subject = schedule.subjectName;
            const className = `Lớp: ${schedule.className}`;
            const time = `${schedule.startTime} - ${schedule.endTime}`;
            const room = `Phòng: ${schedule.roomName}`;
            const color = index % 2 === 0 ? 'blue' : 'green';

            return (
                <ScheduleCard
                    key={schedule.id}
                    subject={subject}
                    className={className}
                    time={time}
                    room={room}
                    color={color}
                />
            );
        })
    ) : (
        <Text className="text-center text-gray-500 text-base">Không có lịch dạy vào ngày này.</Text>
    );

    return (
        <DashBoardLayoutLecturer
            headerTitle="Lịch giảng dạy"
            headerSubtitle="Xem và quản lý lịch dạy"
        >
            <ScrollView className="flex-1 bg-gray-50">
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
                                <Text className="text-center text-gray-500 text-base">Đang tải lịch dạy...</Text>
                            ) : error ? (
                                <Text className="text-center text-red-500 text-base">{error}</Text>
                            ) : (
                                <>{scheduleContent}</>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </DashBoardLayoutLecturer>
    );
};

export default TeachingSchedulePageLecturer;
