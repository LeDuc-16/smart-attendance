import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Dữ liệu mẫu cho các buổi điểm danh
const attendanceData = [
  {
    session: 1,
    date: '07/08/2025',
    present: 48,
    absent: 2,
  },
  {
    session: 2,
    date: '09/08/2025',
    present: 48,
    absent: 2,
  },
  {
    session: 3,
    date: '11/08/2025',
    present: 48,
    absent: 2,
  },
];

const AttendanceReportScreen = () => {
  const [selectedClass, setSelectedClass] = useState('64KTPM3');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Báo cáo và thống kê</Text>

        <Text style={styles.label}>Chọn lớp học phần</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClass}
            onValueChange={(itemValue) => setSelectedClass(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Lập trình ứng dụng di động - 64KTPM3" value="64KTPM3" />
            <Picker.Item label="Cơ sở dữ liệu - 64KTPM1" value="64KTPM1" />
            <Picker.Item label="Mạng máy tính - 64KTPM2" value="64KTPM2" />
          </Picker>
        </View>

        <Text style={styles.subHeader}>Chi tiết các buổi điểm danh</Text>

        {attendanceData.map((item, index) => (
          <TouchableOpacity key={index} style={styles.sessionCard}>
            <View>
              <Text style={styles.sessionTitle}>{`Buổi ${item.session} - ${item.date}`}</Text>
              <Text style={styles.sessionDetails}>{`Có mặt: ${item.present}, Vắng: ${item.absent}`}</Text>
            </View>
            <Text style={styles.arrow}>〉</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Xuất báo cáo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Để chừa không gian cho nút button ở dưới
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 25,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sessionDetails: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  exportButton: {
    backgroundColor: '#4285F4', // Màu xanh dương giống Google
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceReportScreen;
