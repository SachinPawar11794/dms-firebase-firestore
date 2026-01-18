import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { EmployeeRepository } from '../../../repositories/employee.repository';

export class EmployeeService {
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }
  async createEmployee(employeeData: CreateEmployeeDto, plantId?: string, createdBy?: string): Promise<Employee> {
    try {
      // Convert dates to ISO strings for storage
      const personalInfo = {
        ...employeeData.personalInfo,
        dateOfBirth: employeeData.personalInfo.dateOfBirth instanceof Date
          ? employeeData.personalInfo.dateOfBirth.toISOString()
          : new Date(employeeData.personalInfo.dateOfBirth).toISOString(),
      };

      const employmentInfo = {
        ...employeeData.employmentInfo,
        hireDate: employeeData.employmentInfo.hireDate instanceof Date
          ? employeeData.employmentInfo.hireDate.toISOString()
          : new Date(employeeData.employmentInfo.hireDate).toISOString(),
      };

      return await this.employeeRepository.createEmployee({
        employeeId: employeeData.employeeId,
        personalInfo,
        employmentInfo,
        documents: [],
        plantId,
        createdBy,
      });
    } catch (error: any) {
      logger.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      return await this.employeeRepository.findById(employeeId);
    } catch (error: any) {
      logger.error('Error getting employee:', error);
      throw new Error('Failed to get employee');
    }
  }

  async getEmployees(page: number = 1, limit: number = 50): Promise<{ employees: Employee[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const employees = await this.employeeRepository.findAll({}, limit, offset);
      const total = await this.employeeRepository.count();

      return { employees, total };
    } catch (error: any) {
      logger.error('Error getting employees:', error);
      throw new Error('Failed to get employees');
    }
  }

  async updateEmployee(employeeId: string, employeeData: UpdateEmployeeDto): Promise<Employee> {
    try {
      const updateData: Partial<Employee> = {};

      if (employeeData.personalInfo) {
        const personalInfo: any = { ...employeeData.personalInfo };
        if (employeeData.personalInfo.dateOfBirth) {
          personalInfo.dateOfBirth = employeeData.personalInfo.dateOfBirth instanceof Date
            ? Timestamp.fromDate(employeeData.personalInfo.dateOfBirth)
            : Timestamp.fromDate(new Date(employeeData.personalInfo.dateOfBirth));
        }
        updateData.personalInfo = personalInfo as any;
      }

      if (employeeData.employmentInfo) {
        const employmentInfo: any = { ...employeeData.employmentInfo };
        if (employeeData.employmentInfo.hireDate) {
          employmentInfo.hireDate = employeeData.employmentInfo.hireDate instanceof Date
            ? Timestamp.fromDate(employeeData.employmentInfo.hireDate)
            : Timestamp.fromDate(new Date(employeeData.employmentInfo.hireDate));
        }
        updateData.employmentInfo = employmentInfo as any;
      }

      if (employeeData.documents) {
        updateData.documents = employeeData.documents;
      }

      const updatedEmployee = await this.employeeRepository.updateEmployee(employeeId, updateData);
      if (!updatedEmployee) {
        throw new Error('Employee not found');
      }

      return updatedEmployee;
    } catch (error: any) {
      logger.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const deleted = await this.employeeRepository.delete(employeeId);
      if (!deleted) {
        throw new Error('Employee not found');
      }
    } catch (error: any) {
      logger.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  }
}

export const employeeService = new EmployeeService();
