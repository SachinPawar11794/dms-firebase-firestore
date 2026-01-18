import { Attendance, CreateAttendanceDto } from '../models/employee.model';
import { logger } from '../../../utils/logger';
import { AttendanceRepository } from '../../../repositories/attendance.repository';
import { EmployeeRepository } from '../../../repositories/employee.repository';

export class AttendanceService {
  private attendanceRepository: AttendanceRepository;
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
  }
  async createAttendance(attendanceData: CreateAttendanceDto, createdBy?: string): Promise<Attendance> {
    try {
      // Find employee by employeeId to get UUID
      const employee = await this.employeeRepository.findByEmployeeId(attendanceData.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const date = attendanceData.date instanceof Date
        ? attendanceData.date
        : new Date(attendanceData.date);

      const checkInTime = attendanceData.checkIn
        ? (attendanceData.checkIn instanceof Date
            ? attendanceData.checkIn
            : new Date(attendanceData.checkIn))
        : undefined;

      const checkOutTime = attendanceData.checkOut
        ? (attendanceData.checkOut instanceof Date
            ? attendanceData.checkOut
            : new Date(attendanceData.checkOut))
        : undefined;

      return await this.attendanceRepository.createAttendance({
        employeeId: employee.id, // Use UUID from employees table
        date,
        checkInTime,
        checkOutTime,
        status: attendanceData.status,
        notes: attendanceData.notes,
        createdBy,
      });
    } catch (error: any) {
      logger.error('Error creating attendance:', error);
      throw new Error('Failed to create attendance');
    }
  }

  async getAttendanceByEmployeeId(employeeId: string, page: number = 1, limit: number = 50): Promise<{ attendance: Attendance[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const attendance = await this.attendanceRepository.findByEmployeeId(employeeId, limit, offset);
      const total = await this.attendanceRepository.count({ employeeId });

      return { attendance, total };
    } catch (error: any) {
      logger.error('Error getting attendance:', error);
      throw new Error('Failed to get attendance');
    }
  }
}

export const attendanceService = new AttendanceService();
