import { connectDB } from './db';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'admin@lumina.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const ADMIN_NAME = 'System Admin';

async function seedAdmin() {
  try {
    const db = await connectDB();
    
    // 1. Create/Ensure Permissions
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

    const permissionDocs = [];
    for (const perm of defaultPermissions) {
      let permDoc = await db.collection('permissions').findOne({ name: perm.name });
      if (!permDoc) {
        const result = await db.collection('permissions').insertOne({
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        permDoc = await db.collection('permissions').findOne({ _id: result.insertedId });
      }
      permissionDocs.push(permDoc);
    }

    // 2. Create/Ensure ADMIN Role
    let adminRole = await db.collection('roles').findOne({ name: 'ADMIN' });
    if (!adminRole) {
      const rolePermissions = permissionDocs.map(p => ({
        permissionId: p!._id,
        permission: p
      }));
      
      const result = await db.collection('roles').insertOne({
        name: 'ADMIN',
        description: 'Administrator with full access',
        permissions: rolePermissions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      adminRole = await db.collection('roles').findOne({ _id: result.insertedId });
    }

    // 3. Create ADMIN User
    const existingAdmin = await db.collection('users').findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.collection('users').insertOne({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      roleId: adminRole!._id,
      isActive: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    process.exit();
  }
}

seedAdmin();
