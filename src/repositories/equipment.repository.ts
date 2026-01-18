import { BaseRepository } from './base.repository';
import { Equipment } from '../modules/maintenance/models/maintenance.model';
import { Timestamp } from 'firebase-admin/firestore';

export class EquipmentRepository extends BaseRepository<Equipment> {
  constructor() {
    super('equipment');
  }

  protected mapRowToEntity(row: any): Equipment {
    const specifications = typeof row.specifications === 'string'
      ? JSON.parse(row.specifications)
      : (row.specifications || {});

    return {
      id: row.id,
      name: row.name,
      type: specifications.type || row.type || '',
      serialNumber: row.serial_number || '',
      location: row.location || '',
      status: row.status,
      lastMaintenanceDate: row.last_maintenance_date ? Timestamp.fromDate(new Date(row.last_maintenance_date)) : null,
      nextMaintenanceDate: specifications.nextMaintenanceDate ? Timestamp.fromDate(new Date(specifications.nextMaintenanceDate)) : null,
      warrantyExpiry: row.warranty_expiry ? Timestamp.fromDate(new Date(row.warranty_expiry)) : null,
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
    };
  }

  /**
   * Find equipment by code
   */
  async findByCode(code: string): Promise<Equipment | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE code = $1 LIMIT 1`,
      [code]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Find equipment with filters
   */
  async findWithFilters(filters: {
    status?: string;
    plantId?: string;
  }, limit?: number, offset?: number): Promise<Equipment[]> {
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

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC`;

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
   * Create equipment
   */
  async createEquipment(data: {
    name: string;
    code?: string;
    type?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    status?: string;
    location?: string;
    plantId?: string;
    specifications?: any;
    createdBy?: string;
  }): Promise<Equipment> {
    const fields = [
      'name', 'code', 'type', 'manufacturer', 'model', 'serial_number',
      'purchase_date', 'warranty_expiry', 'status', 'location', 'plant_id',
      'specifications', 'created_by'
    ];
    const values = [
      data.name,
      data.code || null,
      data.type || null,
      data.manufacturer || null,
      data.model || null,
      data.serialNumber || null,
      data.purchaseDate || null,
      data.warrantyExpiry || null,
      data.status || 'active',
      data.location || null,
      data.plantId || null,
      JSON.stringify(data.specifications || {}),
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
   * Update equipment
   */
  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }
    if (data.type !== undefined) {
      // Update in specifications JSONB
      const existing = await this.findById(id);
      const specs = existing ? (this.mapRowToEntity(existing as any) as any).specifications || {} : {};
      specs.type = data.type;
      updateFields.push(`specifications = $${paramIndex}`);
      values.push(JSON.stringify(specs));
      paramIndex++;
    }
    if (data.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      values.push(data.location);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }
    if (data.lastMaintenanceDate !== undefined) {
      // Store in specifications
      const existing = await this.findById(id);
      const specs = existing ? (this.mapRowToEntity(existing as any) as any).specifications || {} : {};
      const lastMaintenanceDateValue = data.lastMaintenanceDate instanceof Timestamp 
        ? data.lastMaintenanceDate.toDate().toISOString() 
        : (typeof data.lastMaintenanceDate === 'string' ? new Date(data.lastMaintenanceDate).toISOString() : data.lastMaintenanceDate);
      specs.lastMaintenanceDate = lastMaintenanceDateValue;
      updateFields.push(`specifications = $${paramIndex}`);
      values.push(JSON.stringify(specs));
      paramIndex++;
    }
    if (data.nextMaintenanceDate !== undefined) {
      const existing = await this.findById(id);
      const specs = existing ? (this.mapRowToEntity(existing as any) as any).specifications || {} : {};
      const nextMaintenanceDateValue = data.nextMaintenanceDate instanceof Timestamp
        ? data.nextMaintenanceDate.toDate().toISOString()
        : (typeof data.nextMaintenanceDate === 'string' ? new Date(data.nextMaintenanceDate).toISOString() : data.nextMaintenanceDate);
      specs.nextMaintenanceDate = nextMaintenanceDateValue;
      updateFields.push(`specifications = $${paramIndex}`);
      values.push(JSON.stringify(specs));
      paramIndex++;
    }
    if (data.warrantyExpiry !== undefined) {
      updateFields.push(`warranty_expiry = $${paramIndex}`);
      const warrantyDate = data.warrantyExpiry instanceof Timestamp 
        ? data.warrantyExpiry.toDate() 
        : (typeof data.warrantyExpiry === 'string' ? new Date(data.warrantyExpiry) : data.warrantyExpiry);
      values.push(warrantyDate);
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
