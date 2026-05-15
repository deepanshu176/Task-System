import bcrypt from 'bcrypt';
import { Db, Document } from 'mongodb';

const BCRYPT_ROUNDS = 10;

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lumina.local';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
export const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

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

export async function ensureDefaultAdmin(db: Db) {
  const permissionDocs: Document[] = [];

  for (const permission of defaultPermissions) {
    let permissionDoc = await db.collection('permissions').findOne({ name: permission.name });

    if (!permissionDoc) {
      const createdAt = new Date();
      const result = await db.collection('permissions').insertOne({
        ...permission,
        createdAt,
        updatedAt: createdAt
      });
      permissionDoc = {
        _id: result.insertedId,
        ...permission,
        createdAt,
        updatedAt: createdAt
      };
    }

    permissionDocs.push(permissionDoc);
  }

  let adminRole = await db.collection('roles').findOne({ name: 'ADMIN' });

  if (!adminRole) {
    const createdAt = new Date();
    const permissions = permissionDocs.map((permission) => ({
      permissionId: permission._id,
      permission
    }));
    const result = await db.collection('roles').insertOne({
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions,
      createdAt,
      updatedAt: createdAt
    });
    adminRole = {
      _id: result.insertedId,
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions,
      createdAt,
      updatedAt: createdAt
    };
  }

  const existingAdmin = await db.collection('users').findOne({ email: DEFAULT_ADMIN_EMAIL });
  const password = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, BCRYPT_ROUNDS);

  if (!existingAdmin) {
    const now = new Date();
    await db.collection('users').insertOne({
      email: DEFAULT_ADMIN_EMAIL,
      password,
      name: DEFAULT_ADMIN_NAME,
      roleId: adminRole._id,
      isActive: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      createdAt: now,
      updatedAt: now
    });
    return;
  }

  const passwordMatches = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, existingAdmin.password);
  const updates: Document = {
    roleId: adminRole._id,
    isActive: true,
    updatedAt: new Date()
  };

  if (!passwordMatches) {
    updates.password = password;
    updates.loginAttempts = 0;
    updates.lastLoginAttempt = null;
  }

  await db.collection('users').updateOne(
    { _id: existingAdmin._id },
    { $set: updates }
  );
}
