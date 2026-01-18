import { BaseRepository } from './base.repository';
import { Plant } from '../models/plant.model';
import { Timestamp } from 'firebase-admin/firestore';

export class PlantRepository extends BaseRepository<Plant> {
  constructor() {
    super('plants');
  }

  protected mapRowToEntity(row: any): Plant {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      contactPerson: row.contact_person,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      isActive: row.is_active,
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  /**
   * Find plant by code
   */
  async findByCode(code: string): Promise<Plant | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE UPPER(code) = UPPER($1) LIMIT 1`,
      [code]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Get active plants only
   */
  async findActive(): Promise<Plant[]> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE is_active = true ORDER BY name ASC`
    );
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Create plant with all fields
   */
  async createPlant(data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
    createdBy?: string;
    updatedBy?: string;
  }): Promise<Plant> {
    const fields = [
      'name', 'code', 'address', 'city', 'state', 'country', 
      'postal_code', 'contact_person', 'contact_email', 'contact_phone',
      'is_active', 'created_by', 'updated_by'
    ];
    const values = [
      data.name,
      data.code.toUpperCase(),
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
      data.postalCode || null,
      data.contactPerson || null,
      data.contactEmail || null,
      data.contactPhone || null,
      data.isActive !== undefined ? data.isActive : true,
      data.createdBy || null,
      data.updatedBy || null,
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
   * Update plant
   */
  async updatePlant(id: string, data: Partial<Plant>): Promise<Plant | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }
    if (data.code !== undefined) {
      updateFields.push(`code = $${paramIndex}`);
      values.push(data.code.toUpperCase());
      paramIndex++;
    }
    if (data.address !== undefined) {
      updateFields.push(`address = $${paramIndex}`);
      values.push(data.address);
      paramIndex++;
    }
    if (data.city !== undefined) {
      updateFields.push(`city = $${paramIndex}`);
      values.push(data.city);
      paramIndex++;
    }
    if (data.state !== undefined) {
      updateFields.push(`state = $${paramIndex}`);
      values.push(data.state);
      paramIndex++;
    }
    if (data.country !== undefined) {
      updateFields.push(`country = $${paramIndex}`);
      values.push(data.country);
      paramIndex++;
    }
    if (data.postalCode !== undefined) {
      updateFields.push(`postal_code = $${paramIndex}`);
      values.push(data.postalCode);
      paramIndex++;
    }
    if (data.contactPerson !== undefined) {
      updateFields.push(`contact_person = $${paramIndex}`);
      values.push(data.contactPerson);
      paramIndex++;
    }
    if (data.contactEmail !== undefined) {
      updateFields.push(`contact_email = $${paramIndex}`);
      values.push(data.contactEmail);
      paramIndex++;
    }
    if (data.contactPhone !== undefined) {
      updateFields.push(`contact_phone = $${paramIndex}`);
      values.push(data.contactPhone);
      paramIndex++;
    }
    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      values.push(data.isActive);
      paramIndex++;
    }
    if (data.updatedBy !== undefined) {
      updateFields.push(`updated_by = $${paramIndex}`);
      values.push(data.updatedBy);
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

  /**
   * Check if plant is used by any users
   */
  async isUsedByUsers(plantId: string): Promise<boolean> {
    const result = await this.query(
      `SELECT COUNT(*) FROM users WHERE plant = $1`,
      [plantId]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }
}
