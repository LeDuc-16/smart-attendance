import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiScheduleService, Schedule } from '../../api/apiSchedule';
import { apiAuthService } from '../../api/apiAuth';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import DashBoardLayoutLecturer from './DashBoardLayoutLecturer';

// --- Các thành phần giao diện ---

const DateNavigator: React.FC<{
    calendarDate: Date;
    selectedDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onPress: () => void;
}> = ({ calendarDate, selectedDate, onPrevMonth, onNextMonth, onPress }) => {
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    return (
        <View style={styles.dateNavigatorContainer}>
            <TouchableOpacity onPress={onPrevMonth} style={styles.arrowButton}>
                <Icon name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress} style={styles.dateDisplayArea}>
                <Text style={styles.dateNavigatorToday}>{`${monthNames[month]}, ${year}`}</Text>
                <Text style={styles.dateNavigatorDate}>
                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNextMonth} style={styles.arrowButton}>
                <Icon name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
        </View>
    );
};

type ClassItem = {
  id: string;
  subject: string;
  className: string;
  location: string;
  time: string;
  status: 'present' | 'past' | 'future';
  attendanceStatusText: string;
  attendance: string;
  date: string;
};

interface ClassCardProps {
  item: ClassItem;
  navigation: NavigationProp<ParamListBase>;
}

const ClassCard: React.FC<ClassCardProps> = ({ item, navigation }) => {
  const handleOpenAttendance = () => {
    if (navigation) {
      navigation.navigate('StudentListPage', {
        className: item.className,
        scheduleId: item.id,
        date: item.date,
      });
    } else {
      console.error('Navigation object is undefined in ClassCard');
      Alert.alert('Error', 'Navigation is not available.');
    }
  };

  return (
    <View style={[styles.card, item.attendanceStatusText === 'Đang mở' && styles.cardOpen]}>
      <Text style={styles.cardSubject}>{item.subject}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardClass}>Lớp: {item.className}</Text>
        <View style={styles.cardIconText}>
          <Icon name="time-outline" size={16} color="#555" />
          <Text style={styles.cardInfoText}>{item.time}</Text>
        </View>
      </View>
      <View style={[styles.cardIconText, { marginBottom: 12 }]}>
        <Icon name="location-outline" size={16} color={item.attendanceStatusText === 'Đang mở' ? '#007BFF' : '#555'} />
        <Text style={[styles.cardInfoText, item.attendanceStatusText === 'Đang mở' && { color: '#007BFF', fontWeight: 'bold' }]}>
          {item.location}
        </Text>
      </View>
      <Text style={styles.cardStatusText}>
        Trạng thái: {item.attendanceStatusText}
      </Text>
      <Text style={styles.cardAttendanceText}>{item.attendance}</Text>
      
      {item.status === 'present' ? ( 
        <TouchableOpacity style={styles.cardButtonOpen} onPress={handleOpenAttendance}> 
          <Text style={styles.cardButtonTextWhite}>Mở điểm danh</Text>
        </TouchableOpacity>
      ) : item.status === 'future' ? ( 
        <TouchableOpacity style={[styles.cardButtonOpen, { backgroundColor: '#ccc' }]} disabled={true}>
          <Text style={styles.cardButtonTextWhite}>Chưa đến ngày mở điểm danh</Text>
        </TouchableOpacity>
      ) : ( 
        <TouchableOpacity style={[styles.cardButtonOpen, { backgroundColor: '#ccc' }]} disabled={true}>
          <Text style={styles.cardButtonTextWhite}>Đã đóng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- Màn hình chính ---

const AttendancePageLecturer = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = apiAuthService.getAuthToken();
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }
            apiScheduleService.setAuthToken(token);
            const response = await apiScheduleService.getMySchedule();
            setSchedules(response.schedules);
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError('Failed to load schedules.');
        } finally {
            setLoading(false);
        }
    };
    fetchSchedules();
  }, []);

  const handleDateChange = (_event: any, date?: Date | undefined) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const showMode = (currentMode: 'date' | 'time' | 'datetime') => {
    setShowDatePicker(true);
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const transformedClassesData = schedules
    .filter(schedule => {
      const studyDate = new Date(schedule.date);
      return (
        studyDate.getFullYear() === selectedDate.getFullYear() &&
        studyDate.getMonth() === selectedDate.getMonth() &&
        studyDate.getDate() === selectedDate.getDate()
      );
    })
    .map(schedule => {
      const classDate = new Date(schedule.date);
      const today = new Date();

      let status = '';
      if (
        classDate.getFullYear() === today.getFullYear() &&
        classDate.getMonth() === today.getMonth() &&
        classDate.getDate() === today.getDate()
      ) {
        status = 'present';
      } else if (classDate < today) {
        status = 'past';
      } else {
        status = 'future';
      }

      const scheduleStartTime = new Date(schedule.date + ' ' + schedule.startTime);
      const scheduleEndTime = new Date(schedule.date + ' ' + schedule.endTime);
      const now = new Date();

      let attendanceStatusText = '';
      if (now >= scheduleStartTime && now <= scheduleEndTime) {
        attendanceStatusText = 'Đang mở';
      } else if (now < scheduleStartTime) {
        attendanceStatusText = 'Sắp diễn ra';
      } else {
        attendanceStatusText = 'Đã đóng';
      }

      return {
        id: schedule.id.toString(),
        subject: schedule.subjectName,
        className: (schedule as any).className || '',
        location: `Phòng: ${(schedule as any).roomName || schedule.classroomName || ''}`,
        time: `${schedule.startTime} - ${schedule.endTime}`,
        status: status,
        attendanceStatusText: attendanceStatusText,
        attendance: 'Chưa có dữ liệu điểm danh',
        date: schedule.date,
      };
    });

  transformedClassesData.sort((a, b) => {
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  return (
    <DashBoardLayoutLecturer>
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
        >
        <DateNavigator
            selectedDate={selectedDate}
            calendarDate={selectedDate}
            onPrevMonth={handlePrevDay}
            onNextMonth={handleNextDay}
            onPress={() => showMode('date')}
        />
        {showDatePicker && (
            <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            />
        )}
        {loading ? (
            <Text style={styles.noDataText}>Đang tải lịch học...</Text>
        ) : error ? (
            <Text style={[styles.noDataText, { color: 'red' }]}>Lỗi: {error}</Text>
        ) : transformedClassesData.length > 0 ? (
            transformedClassesData.map(item => <ClassCard key={item.id} item={item} navigation={navigation} />)
        ) : (
            <Text style={styles.noDataText}>Không có lớp học nào vào ngày này.</Text>
        )}
        </ScrollView>
    </DashBoardLayoutLecturer>
  );
};

// --- StyleSheet ---

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  scrollViewContent: {
    padding: 16,
  },
  dateNavigatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  arrowButton: {
    padding: 5, 
  },
  dateDisplayArea: {
    flex: 1, 
    alignItems: 'center',
  },
  dateNavigatorToday: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  dateNavigatorDate: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardOpen: {
    borderColor: '#007BFF',
    borderWidth: 1.5,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardClass: {
    fontSize: 14,
    color: '#555',
  },
  cardIconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  cardStatusText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cardAttendanceText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  cardActionsOpen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDetailsLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  cardButtonClose: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cardButtonOpen: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardButtonTextWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default AttendancePageLecturer;
