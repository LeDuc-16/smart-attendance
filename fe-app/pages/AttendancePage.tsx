import React, { useState, useEffect } from 'react';
import { apiScheduleService, Schedule, Course, Class, Room } from '../api/apiScheduleService';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface ClassDataItem {
  id: number;
  subject: string;
  className: string;
  location: string;
  time: string;
  status: 'open' | 'closed';
  attendance: string;
  date: string; // Added date field
}

// --- Dữ liệu mẫu ---
const allClassesData: ClassDataItem[] = [
  {
    id: 1,
    subject: 'Lập trình ứng dụng di động',
    className: '64KTPM3',
    location: '207-B5',
    time: '07:00 - 09:00',
    status: 'open',
    attendance: '48/50 có mặt',
    date: '2025-08-24', // Example date
  },
  {
    id: 2,
    subject: 'Lập trình ứng dụng di động',
    className: '64KTPM3',
    location: '207-B5',
    time: '07:00 - 09:00',
    status: 'closed',
    attendance: 'Chưa điểm danh',
    date: '2025-08-24', // Example date
  },
  {
    id: 3,
    subject: 'Cấu trúc dữ liệu',
    className: '64KTPM1',
    location: '301-A1',
    time: '09:00 - 11:00',
    status: 'open',
    attendance: '30/35 có mặt',
    date: '2025-08-25', // Example date for another day
  },
];

// --- Các thành phần giao diện ---

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPress: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, onPress }) => {
  const formattedDate = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <View style={styles.dateNavigatorContainer}>
      <TouchableOpacity onPress={handlePreviousDay}>
        <Icon name="chevron-back" size={24} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress} style={styles.dateNavigatorCenter}>
        <Text style={styles.dateNavigatorToday}>
          {selectedDate.toDateString() === new Date().toDateString() ? 'Hôm nay' : 'Ngày đã chọn'}
        </Text>
        <Text style={styles.dateNavigatorDate}>{formattedDate}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNextDay}>
        <Icon name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

interface ClassCardProps {
  item: ClassDataItem;
  navigation: NavigationProp<any>;
}

const ClassCard = ({ item, navigation }: ClassCardProps) => {
  const isOpen = item.status === 'open';

  const handleViewDetails = () => {
    navigation.navigate('StudentListPage', { className: item.className });
  };

  return (
    <View style={[styles.card, isOpen && styles.cardOpen]}>
      <Text style={styles.cardSubject}>{item.subject}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardClass}>Lớp: {item.className}</Text>
        <View style={styles.cardIconText}>
          <Icon name="time-outline" size={16} color="#555" />
          <Text style={styles.cardInfoText}>{item.time}</Text>
        </View>
      </View>
      <View style={[styles.cardIconText, { marginBottom: 12 }]}>
        <Icon name="location-outline" size={16} color={isOpen ? '#007BFF' : '#555'} />
        <Text style={[styles.cardInfoText, isOpen && { color: '#007BFF', fontWeight: 'bold' }]}>
          {item.location}
        </Text>
      </View>
      <Text style={styles.cardStatusText}>
        Trạng thái: {isOpen ? 'Đang mở' : 'Đã đóng'}
      </Text>
      <Text style={styles.cardAttendanceText}>{item.attendance}</Text>
      {isOpen && (
        <View style={styles.cardActionsOpen}>
          <TouchableOpacity onPress={handleViewDetails}>
            <Text style={styles.cardDetailsLink}>Xem chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardButtonOpen}>
            <Text style={styles.cardButtonTextWhite}>Điểm danh</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isOpen && (
        <View style={styles.cardActionsOpen}>
          <TouchableOpacity onPress={handleViewDetails}>
            <Text style={styles.cardDetailsLink}>Xem chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardButtonClose}>
            <Text style={styles.cardButtonTextWhite}>Đã đóng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- Màn hình chính ---

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedSchedules, fetchedCourses, fetchedClasses, fetchedRooms] = await Promise.all([
          apiScheduleService.getSchedules(),
          apiScheduleService.getCourses(),
          apiScheduleService.getClasses(),
          apiScheduleService.getRooms(),
        ]);
        setSchedules(fetchedSchedules);
        setCourses(fetchedCourses);
        setClasses(fetchedClasses);
        setRooms(fetchedRooms);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const showMode = () => {
    setShowDatePicker(true);
  };

  const getFormattedTime = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  };

  const filteredClassesData: ClassDataItem[] = schedules
    .filter(schedule => {
      // Filter schedules by selected date
      return schedule.weeks.some(week =>
        week.studyDays.some(studyDay => {
          const studyDate = new Date(studyDay.date);
          return studyDate.toDateString() === selectedDate.toDateString();
        })
      );
    })
    .map(schedule => {
      const course = courses.find(c => c.id === schedule.courseId);
      const classInfo = classes.find(cl => cl.id === schedule.classId);
      const room = rooms.find(r => r.id === schedule.roomId);

      return {
        id: schedule.id,
        subject: course?.courseName || 'N/A',
        className: classInfo?.className || 'N/A',
        location: room?.roomCode || 'N/A',
        time: getFormattedTime(schedule.startTime, schedule.endTime),
        status: 'open', // Assuming all fetched schedules are 'open' for now
        attendance: 'Chưa điểm danh', // Placeholder
        date: selectedDate.toISOString().split('T')[0], // Use selected date for consistency
      };
    });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn lớp điểm danh</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPress={showMode}
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
        {filteredClassesData.length > 0 ? (
          filteredClassesData.map(item => <ClassCard key={item.id} item={item} navigation={navigation} />)
        ) : (
          <Text style={styles.noDataText}>Không có lớp học nào vào ngày này.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- StyleSheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  dateNavigatorCenter: {
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
    paddingHorizontal: 24,
  },
  cardButtonTextWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AttendanceScreen;
