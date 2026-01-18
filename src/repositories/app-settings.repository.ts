import { BaseRepository } from './base.repository';
import { AppSettings } from '../modules/shared/models/app-settings.model';
import { Timestamp } from 'firebase-admin/firestore';

export class AppSettingsRepository extends BaseRepository<AppSettings> {
  constructor() {
    super('app_settings');
  }

  protected mapRowToEntity(row: any): AppSettings {
    // Repository returns raw database row with key/value, but AppSettings interface doesn't have these
    // We'll return it as-is and let the service handle the mapping
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      updatedBy: row.updated_by,
    } as any;
  }

  /**
   * Find settings by key
   */
  async findByKey(key: string): Promise<AppSettings | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE key = $1 LIMIT 1`,
      [key]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Create or update settings by key
   */
  async upsertByKey(key: string, value: any, description?: string, updatedBy?: string): Promise<AppSettings> {
    const existing = await this.findByKey(key);
    
    if (existing) {
      // Update existing
      const existingData = existing as any;
      const result = await this.query(
        `UPDATE ${this.tableName} 
         SET value = $1, description = $2, updated_by = $3 
         WHERE key = $4 
         RETURNING *`,
        [JSON.stringify(value), description || existingData.description, updatedBy || null, key]
      );
      return this.mapRowToEntity(result.rows[0]);
    } else {
      // Create new
      const result = await this.query(
        `INSERT INTO ${this.tableName} (key, value, description, updated_by) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [key, JSON.stringify(value), description || null, updatedBy || null]
      );
      return this.mapRowToEntity(result.rows[0]);
    }
  }
}
