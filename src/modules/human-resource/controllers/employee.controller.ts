import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { employeeService } from '../services/employee.service';
import { attendanceService } from '../services/attendance.service';
import { ResponseHelper } from '../../../utils/response';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateAttendanceDto } from '../models/employee.model';

export class EmployeeController {
  async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeData: CreateEmployeeDto = req.body;
      const employee = await employeeService.createEmployee(employeeData);
      ResponseHelper.success(res, employee, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);

      if (!employee) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Employee not found', 404);
        return;
      }

      ResponseHelper.success(res, employee);
    } catch (error: any) {
      next(error);
    }
  }

  async getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const { employees, total } = await employeeService.getEmployees(page, limit);
      ResponseHelper.paginated(res, employees, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employeeData: UpdateEmployeeDto = req.body;

      const employee = await employeeService.updateEmployee(id, employeeData);
      ResponseHelper.success(res, employee);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id);
      ResponseHelper.success(res, { message: 'Employee deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async createAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendanceData: CreateAttendanceDto = req.body;
      const attendance = await attendanceService.createAttendance(attendanceData);
      ResponseHelper.success(res, attendance, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const { attendance, total } = await attendanceService.getAttendanceByEmployeeId(employeeId, page, limit);
      ResponseHelper.paginated(res, attendance, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
