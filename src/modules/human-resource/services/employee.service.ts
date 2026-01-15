import { db } from '../../../config/firebase.config';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class EmployeeService {
  async createEmployee(employeeData: CreateEmployeeDto): Promise<Employee> {
    try {
      const now = Timestamp.now();

      // Convert dates to Timestamps
      const dateOfBirth = employeeData.personalInfo.dateOfBirth instanceof Date
        ? Timestamp.fromDate(employeeData.personalInfo.dateOfBirth)
        : Timestamp.fromDate(new Date(employeeData.personalInfo.dateOfBirth));

      const hireDate = employeeData.employmentInfo.hireDate instanceof Date
        ? Timestamp.fromDate(employeeData.employmentInfo.hireDate)
        : Timestamp.fromDate(new Date(employeeData.employmentInfo.hireDate));

      const employee: Omit<Employee, 'id'> = {
        employeeId: employeeData.employeeId,
        personalInfo: {
          ...employeeData.personalInfo,
          dateOfBirth,
        },
        employmentInfo: {
          ...employeeData.employmentInfo,
          hireDate,
        },
        documents: [],
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection('employees').add(employee);

      return {
        id: docRef.id,
        ...employee,
      };
    } catch (error: any) {
      logger.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const employeeDoc = await db.collection('employees').doc(employeeId).get();

      if (!employeeDoc.exists) {
        return null;
      }

      return {
        id: employeeDoc.id,
        ...(employeeDoc.data() as Omit<Employee, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting employee:', error);
      throw new Error('Failed to get employee');
    }
  }

  async getEmployees(page: number = 1, limit: number = 50): Promise<{ employees: Employee[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const employeesSnapshot = await db
        .collection('employees')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db.collection('employees').count().get();
      const total = totalSnapshot.data().count;

      const employees: Employee[] = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Employee, 'id'>),
      }));

      return { employees, total };
    } catch (error: any) {
      logger.error('Error getting employees:', error);
      throw new Error('Failed to get employees');
    }
  }

  async updateEmployee(employeeId: string, employeeData: UpdateEmployeeDto): Promise<Employee> {
    try {
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (employeeData.personalInfo) {
        updateData['personalInfo'] = employeeData.personalInfo;
        if (employeeData.personalInfo.dateOfBirth) {
          updateData['personalInfo.dateOfBirth'] = employeeData.personalInfo.dateOfBirth instanceof Date
            ? Timestamp.fromDate(employeeData.personalInfo.dateOfBirth)
            : Timestamp.fromDate(new Date(employeeData.personalInfo.dateOfBirth));
        }
      }

      if (employeeData.employmentInfo) {
        updateData['employmentInfo'] = employeeData.employmentInfo;
        if (employeeData.employmentInfo.hireDate) {
          updateData['employmentInfo.hireDate'] = employeeData.employmentInfo.hireDate instanceof Date
            ? Timestamp.fromDate(employeeData.employmentInfo.hireDate)
            : Timestamp.fromDate(new Date(employeeData.employmentInfo.hireDate));
        }
      }

      if (employeeData.documents) {
        updateData.documents = employeeData.documents;
      }

      await db.collection('employees').doc(employeeId).update(updateData);

      const updatedEmployee = await this.getEmployeeById(employeeId);
      if (!updatedEmployee) {
        throw new Error('Employee not found after update');
      }

      return updatedEmployee;
    } catch (error: any) {
      logger.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      await db.collection('employees').doc(employeeId).delete();
    } catch (error: any) {
      logger.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  }
}

export const employeeService = new EmployeeService();
