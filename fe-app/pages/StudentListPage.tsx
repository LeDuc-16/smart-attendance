import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { apiScheduleService, Student } from '../api/apiScheduleService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StudentDetailCard from '../components/StudentDetailCard';

type StudentListRouteParams = {
  className: string;
};

type StudentListPageProps = NativeStackScreenProps<Record<string, StudentListRouteParams>, 'StudentListPage'>;

const StudentListPage: React.FC<StudentListPageProps> = ({ navigation }) => {
  const route = useRoute<RouteProp<Record<string, StudentListRouteParams>, 'StudentListPage'>>();
  const { className } = route.params;

  console.log('StudentListPage: Received className:', className);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStudentDetailCard, setShowStudentDetailCard] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedStudents = await apiScheduleService.getStudents();
        console.log('StudentListPage: Fetched students (before filter):', fetchedStudents);
        const filteredStudents = fetchedStudents.filter(student => {
          console.log(`Student: ${student.studentName}, Class: ${student.className}`);
          return student.className === className;
        });
        setStudents(filteredStudents);
      } catch (err: any) {
        console.error('Failed to fetch students:', err);
        setError('Failed to load student data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [className]);

  const handleStudentCardPress = (student: Student) => {
    setSelectedStudent({ name: student.studentName, id: student.studentCode });
    setShowStudentDetailCard(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách sinh viên lớp {className}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : students.length > 0 ? (
          students.map((student) => (
            <TouchableOpacity key={student.id} style={styles.studentCard} onPress={() => handleStudentCardPress(student)}>
              <Text style={styles.studentName}>{student.studentName}</Text>
              <Text style={styles.studentCode}>Mã SV: {student.studentCode}</Text>
              <Text style={styles.studentEmail}>Email: {student.email}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>Không có sinh viên nào trong lớp này.</Text>
        )}
      </ScrollView>
      {showStudentDetailCard && selectedStudent && (
        <View style={styles.overlay}>
          <StudentDetailCard
            studentName={selectedStudent.name}
            studentId={selectedStudent.id}
            isVisible={showStudentDetailCard}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowStudentDetailCard(false)}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentCode: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#555',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StudentListPage;