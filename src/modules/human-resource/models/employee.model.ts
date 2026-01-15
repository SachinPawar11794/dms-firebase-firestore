import { Timestamp } from 'firebase-admin/firestore';

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half-day';
export type EmploymentType = 'full-time' | 'part-time' | 'contract';

export interface Employee {
  id: string;
  employeeId: string; // Unique employee ID
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    dateOfBirth: Timestamp;
  };
  employmentInfo: {
    department: string;
    position: string;
    hireDate: Timestamp;
    salary: number;
    employmentType: EmploymentType;
  };
  documents: string[]; // Storage URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Timestamp;
  checkIn: Timestamp | null;
  checkOut: Timestamp | null;
  status: AttendanceStatus;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateEmployeeDto {
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    dateOfBirth: Date | string;
  };
  employmentInfo: {
    department: string;
    position: string;
    hireDate: Date | string;
    salary: number;
    employmentType: EmploymentType;
  };
}

export interface UpdateEmployeeDto {
  personalInfo?: Partial<CreateEmployeeDto['personalInfo']>;
  employmentInfo?: Partial<CreateEmployeeDto['employmentInfo']>;
  documents?: string[];
}

export interface CreateAttendanceDto {
  employeeId: string;
  date: Date | string;
  checkIn?: Date | string;
  checkOut?: Date | string;
  status: AttendanceStatus;
  notes?: string;
}
