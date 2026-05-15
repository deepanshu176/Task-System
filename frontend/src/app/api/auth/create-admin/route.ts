import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Document } from 'mongodb';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/jwt-server';

const BCRYPT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Check if any admin exists already
    const adminRole = await db.collection('roles').findOne({ name: 'ADMIN' });
    const existingAdmin = await db.collection('users').findOne({ roleId: adminRole?._id });
    
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin user already exists' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create default permissions if they don't exist
    const defaultPermissions = [
      { name: 'CREATE_PROJECT', description: 'Create new projects' },
      { name: 'EDIT_PROJECT', description: 'Edit existing projects' },
      { name: 'DELETE_PROJECT', description: 'Delete projects' },
      { name: 'CREATE_TASK', description: 'Create new tasks' },
      { name: 'EDIT_TASK', description: 'Edit existing tasks' },
      { name: 'DELETE_TASK', description: 'Delete tasks' },
      { name: 'MANAGE_USERS', description: 'Manage users and roles' },
      { name: 'MANAGE_ROLES', description: 'Manage roles and permissions' },
      { name: 'VIEW_PROJECTS', description: 'View all projects' },
      { name: 'VIEW_TASKS', description: 'View all tasks' },
      { name: 'VIEW_USERS', description: 'View all users' }
    ];

    const permissionDocs: Document[] = [];
    for (const perm of defaultPermissions) {
      let permDoc = await db.collection('permissions').findOne({ name: perm.name });
      if (!permDoc) {
        const createdAt = new Date();
        const result = await db.collection('permissions').insertOne({
          name: perm.name,
          description: perm.description,
          createdAt,
          updatedAt: createdAt
        });
        permDoc = {
          _id: result.insertedId,
          name: perm.name,
          description: perm.description,
          createdAt,
          updatedAt: createdAt
        };
      }
      permissionDocs.push(permDoc);
    }

    // Get or create ADMIN role with all permissions
    let adminRoleDoc = await db.collection('roles').findOne({ name: 'ADMIN' });
    if (!adminRoleDoc) {
      const rolePermissions = permissionDocs.map(p => ({
        permissionId: p._id,
        permission: p
      }));
      
      const createdAt = new Date();
      const result = await db.collection('roles').insertOne({
        name: 'ADMIN',
        description: 'Administrator with full access',
        permissions: rolePermissions,
        createdAt,
        updatedAt: createdAt
      });
      adminRoleDoc = {
        _id: result.insertedId,
        name: 'ADMIN',
        description: 'Administrator with full access',
        permissions: rolePermissions,
        createdAt,
        updatedAt: createdAt
      };
    }

    // Get or create MEMBER role if it doesn't exist
    const memberRoleDoc = await db.collection('roles').findOne({ name: 'MEMBER' });
    if (!memberRoleDoc) {
      await db.collection('roles').insertOne({
        name: 'MEMBER',
        description: 'Standard member role',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create admin user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      roleId: adminRoleDoc?._id,
      isActive: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const user = await db.collection('users').findOne({ _id: result.insertedId });
    const token = generateToken({ userId: user?._id?.toString() || '' }, '7d');

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        data: {
          token,
          user: {
            id: user?._id?.toString(),
            email: user?.email,
            name: user?.name,
            role: 'ADMIN',
            isActive: user?.isActive
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
