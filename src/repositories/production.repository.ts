import { BaseRepository } from './base.repository';
import { Production } from '../modules/pms/models/production.model';
import { Timestamp } from 'firebase-admin/firestore';

export class ProductionRepository extends BaseRepository<Production> {
  constructor() {
    super('productions');
  }

  protected mapRowToEntity(row: any): Production {
    return {
      id: row.id,
      productName: row.product_name,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      productionDate: Timestamp.fromDate(new Date(row.production_date)),
      status: row.status,
      assignedTeam: row.assigned_team || [],
      qualityCheck: row.quality_check || false,
      notes: row.notes || '',
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      createdBy: row.created_by,
    };
  }

  /**
   * Find productions with filters
   */
  async findWithFilters(filters: {
    status?: string;
    plantId?: string;
    productionDateFrom?: Date;
    productionDateTo?: Date;
  }, limit?: number, offset?: number): Promise<Production[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.plantId) {
      conditions.push(`plant_id = $${paramIndex}`);
      params.push(filters.plantId);
      paramIndex++;
    }
    if (filters.productionDateFrom) {
      conditions.push(`production_date >= $${paramIndex}`);
      params.push(filters.productionDateFrom);
      paramIndex++;
    }
    if (filters.productionDateTo) {
      conditions.push(`production_date <= $${paramIndex}`);
      params.push(filters.productionDateTo);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY production_date DESC, created_at DESC`;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }

    const result = await this.query(query, params);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Create production
   */
  async createProduction(data: {
    productName: string;
    quantity: number;
    unit: string;
    productionDate: Date;
    assignedTeam: string[];
    qualityCheck?: boolean;
    notes?: string;
    plantId?: string;
    createdBy?: string;
  }): Promise<Production> {
    const fields = [
      'product_name', 'quantity', 'unit', 'production_date',
      'status', 'assigned_team', 'quality_check', 'notes',
      'plant_id', 'created_by'
    ];
    const values = [
      data.productName,
      data.quantity,
      data.unit,
      data.productionDate,
      'planned', // Default status
      data.assignedTeam,
      data.qualityCheck || false,
      data.notes || null,
      data.plantId || null,
      data.createdBy || null,
    ];

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Update production
   */
  async updateProduction(id: string, data: Partial<Production>): Promise<Production | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.productName !== undefined) {
      updateFields.push(`product_name = $${paramIndex}`);
      values.push(data.productName);
      paramIndex++;
    }
    if (data.quantity !== undefined) {
      updateFields.push(`quantity = $${paramIndex}`);
      values.push(data.quantity);
      paramIndex++;
    }
    if (data.unit !== undefined) {
      updateFields.push(`unit = $${paramIndex}`);
      values.push(data.unit);
      paramIndex++;
    }
    if (data.productionDate !== undefined) {
      updateFields.push(`production_date = $${paramIndex}`);
      values.push(data.productionDate instanceof Timestamp ? data.productionDate.toDate() : new Date(data.productionDate));
      paramIndex++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }
    if (data.assignedTeam !== undefined) {
      updateFields.push(`assigned_team = $${paramIndex}`);
      values.push(data.assignedTeam);
      paramIndex++;
    }
    if (data.qualityCheck !== undefined) {
      updateFields.push(`quality_check = $${paramIndex}`);
      values.push(data.qualityCheck);
      paramIndex++;
    }
    if (data.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      values.push(data.notes);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }
}
