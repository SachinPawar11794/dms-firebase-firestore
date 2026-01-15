import { db } from '../../../config/firebase.config';
import { Attendance, CreateAttendanceDto } from '../models/employee.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class AttendanceService {
  async createAttendance(attendanceData: CreateAttendanceDto): Promise<Attendance> {
    try {
      const now = Timestamp.now();
      const date = attendanceData.date instanceof Date
        ? Timestamp.fromDate(attendanceData.date)
        : Timestamp.fromDate(new Date(attendanceData.date));

      const checkIn = attendanceData.checkIn
        ? (attendanceData.checkIn instanceof Date
            ? Timestamp.fromDate(attendanceData.checkIn)
            : Timestamp.fromDate(new Date(attendanceData.checkIn)))
        : null;

      const checkOut = attendanceData.checkOut
        ? (attendanceData.checkOut instanceof Date
            ? Timestamp.fromDate(attendanceData.checkOut)
            : Timestamp.fromDate(new Date(attendanceData.checkOut)))
        : null;

      const attendance: Omit<Attendance, 'id'> = {
        employeeId: attendanceData.employeeId,
        date,
        checkIn,
        checkOut,
        status: attendanceData.status,
        notes: attendanceData.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection('attendance').add(attendance);

      return {
        id: docRef.id,
        ...attendance,
      };
    } catch (error: any) {
      logger.error('Error creating attendance:', error);
      throw new Error('Failed to create attendance');
    }
  }

  async getAttendanceByEmployeeId(employeeId: string, page: number = 1, limit: number = 50): Promise<{ attendance: Attendance[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const attendanceSnapshot = await db
        .collection('attendance')
        .where('employeeId', '==', employeeId)
        .orderBy('date', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db
        .collection('attendance')
        .where('employeeId', '==', employeeId)
        .count()
        .get();
      const total = totalSnapshot.data().count;

      const attendance: Attendance[] = attendanceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Attendance, 'id'>),
      }));

      return { attendance, total };
    } catch (error: any) {
      logger.error('Error getting attendance:', error);
      throw new Error('Failed to get attendance');
    }
  }
}

export const attendanceService = new AttendanceService();
