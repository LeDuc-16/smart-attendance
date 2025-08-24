import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiScheduleService } from '../api/apiScheduleService';
import { apiAuthService } from '../api/apiAuth';

const StudentListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { className, scheduleId, date } = route.params; // Get params from navigation

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = apiAuthService.getAuthToken();
        // console.log('Auth Token:', token); // Removed this line
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }
        apiScheduleService.setAuthToken(token);
        const fetchedStudents = await apiScheduleService.getStudentsByClass(className); // Changed API call
        
        // Transform data to match existing student card structure
        const transformedStudents = fetchedStudents.map(student => ({
          id: student.id,
          name: student.studentName,
          studentCode: student.studentCode,
          status: 'absent', // Default status, as it's not in API response
        }));

        setStudents(transformedStudents);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student list.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [className]); // Re-fetch if className changes

  const handleStudentPress = (studentId) => {
    Alert.alert('Student Details', `Student ID: ${studentId}`);
    // Here you might navigate to a student detail page or mark attendance
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách sinh viên</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <View style={styles.classInfo}>
        <Text style={styles.classInfoText}>Lớp: {className}</Text>
        <Text style={styles.classInfoText}>Ngày: {new Date(date).toLocaleDateString('vi-VN')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Đang tải danh sách sinh viên...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      ) : students.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          {students.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => handleStudentPress(student.id)}
            >
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentCode}>{student.studentCode}</Text>
              <Text style={[styles.studentStatus, student.status === 'present' ? styles.statusPresent : styles.statusAbsent]}>
                {student.status === 'present' ? 'Có mặt' : 'Vắng mặt'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noStudentsText}>Không có sinh viên nào trong lớp này.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  classInfo: {
    padding: 16,
    backgroundColor: '#E6F2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#B3D9FF',
  },
  classInfoText: {
    fontSize: 16,
    color: '#0056B3',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 2,
  },
  studentCode: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
  studentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusPresent: {
    color: '#28a745',
  },
  statusAbsent: {
    color: '#dc3545',
  },
  noStudentsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default StudentListPage;
