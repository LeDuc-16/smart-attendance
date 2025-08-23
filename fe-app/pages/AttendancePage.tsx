import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ClassDataItem {
  id: number;
  subject: string;
  className: string;
  location: string;
  time: string;
  status: 'open' | 'closed';
  attendance: string;
}

// --- Dữ liệu mẫu ---
const classesData: ClassDataItem[] = [
  {
    id: 1,
    subject: 'Lập trình ứng dụng di động',
    className: '64KTPM3',
    location: '207-B5',
    time: '07:00 - 09:00',
    status: 'open',
    attendance: '48/50 có mặt',
  },
  {
    id: 2,
    subject: 'Lập trình ứng dụng di động',
    className: '64KTPM3',
    location: '207-B5',
    time: '07:00 - 09:00',
    status: 'closed',
    attendance: 'Chưa điểm danh',
  },
];

// --- Các thành phần giao diện ---

const DateNavigator = () => (
  <View style={styles.dateNavigatorContainer}>
    <TouchableOpacity>
      <Icon name="chevron-back" size={24} color="#666" />
    </TouchableOpacity>
    <View style={styles.dateNavigatorCenter}>
      <Text style={styles.dateNavigatorToday}>Hôm nay</Text>
      <Text style={styles.dateNavigatorDate}>Thứ 5, 07/08/2025</Text>
    </View>
    <TouchableOpacity>
      <Icon name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  </View>
);

const ClassCard = ({ item }: { item: ClassDataItem }) => {
  const isOpen = item.status === 'open';

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
          <TouchableOpacity>
            <Text style={styles.cardDetailsLink}>Xem chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardButtonOpen}>
            <Text style={styles.cardButtonTextWhite}>Điểm danh</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isOpen && (
        <View style={styles.cardActionsOpen}>
          <TouchableOpacity>
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn lớp điểm danh</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <DateNavigator />
        {classesData.map(item => (
          <ClassCard key={item.id} item={item} />
        ))}
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
