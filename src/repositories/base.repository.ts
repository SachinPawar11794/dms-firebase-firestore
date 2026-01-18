import { Pool, QueryResult } from 'pg';
import { pool } from '../config/database.config';

/**
 * Base repository class with common database operations
 */
export abstract class BaseRepository<T> {
  protected pool: Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = pool;
    this.tableName = tableName;
  }

  /**
   * Execute a query and return results
   * Made public so subclasses can use it for custom queries
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error(`Database query error in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Find all records with optional filters
   */
  async findAll(filters?: Record<string, any>, limit?: number, offset?: number): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });
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
   * Count records with optional filters
   */
  async count(filters?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const fields = Object.keys(data);
    const values = Object.values(data);
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
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await this.query(query, [...values, id]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to entity
   * Override this method in child classes to handle specific mappings
   */
  protected abstract mapRowToEntity(row: any): T;

  /**
   * Map entity to database row
   * Override this method in child classes to handle specific mappings
   */
  protected mapEntityToRow(entity: Partial<T>): any {
    return entity;
  }
}
