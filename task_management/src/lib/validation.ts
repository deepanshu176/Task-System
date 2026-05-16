import { z } from 'zod';

// Auth Schemas
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

// User Schemas
export const createUserSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  roleId: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Role Schemas
export const createRoleSchema = z.object({
  name: z.string()
    .min(1, 'Role name is required')
    .max(50)
    .regex(/^[A-Z_]+$/, 'Role name must be uppercase with underscores only'),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string()).optional()
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string()).optional()
});

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100)
    .trim(),
  description: z.string().max(1000).optional(),
  memberIds: z.array(z.string()).optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  memberIds: z.array(z.string()).optional()
});

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200)
    .trim(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional()
});

// Permission Schemas
export const createPermissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});
