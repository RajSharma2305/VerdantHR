'use server';

import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function updateUserRoleAction(userId: string, newRole: Role) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!Object.values(Role).includes(newRole)) {
      return { success: false, error: 'Invalid role selection' };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    };

    return { success: true, user: safeUser };
  } catch (error) {
    console.error('Error in updateUserRoleActionServer:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
}

export async function getUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role
    }));

    return { success: true, users: safeUsers };
  } catch (error) {
    console.error('Error in getUsersAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
}

import { adminAuth } from '@/lib/firebase-admin';
import { Auth } from 'firebase-admin/auth';

export async function syncFirebaseUsersAction() {
  try {
    if (!('listUsers' in adminAuth) || typeof (adminAuth as Auth).listUsers !== 'function') {
      return { success: false, error: 'Firebase Admin Auth is running in mock mode and cannot list users.' };
    }

    const listUsersResult = await (adminAuth as Auth).listUsers();
    const syncedUsers = [];

    for (const userRecord of listUsersResult.users) {
      if (!userRecord.email) continue;

      // Determine starting role based on email context
      let role: Role = Role.EMPLOYEE;
      if (userRecord.email.toLowerCase().includes('superadmin')) {
        role = Role.SUPER_ADMIN;
      } else if (userRecord.email.toLowerCase().includes('admin')) {
        role = Role.ORG_ADMIN;
      }

      const existingUser = await prisma.user.findUnique({
        where: { firebaseUid: userRecord.uid }
      });

      let updatedOrCreated;
      if (existingUser) {
        updatedOrCreated = await prisma.user.update({
          where: { firebaseUid: userRecord.uid },
          data: {
            email: userRecord.email,
          }
        });
      } else {
        updatedOrCreated = await prisma.user.create({
          data: {
            firebaseUid: userRecord.uid,
            email: userRecord.email,
            role: role,
          }
        });
      }
      syncedUsers.push(updatedOrCreated);
    }

    return { success: true, count: syncedUsers.length };
  } catch (error) {
    console.error('Error in syncFirebaseUsersAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown sync error' };
  }
}

export async function createUserAction(email: string, role: Role, password?: string) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existing) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    let firebaseUid = `mock-uid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    let firebaseCreated = false;

    // Create in Firebase Auth if Admin SDK is configured
    if ('createUser' in adminAuth && typeof (adminAuth as Auth).createUser === 'function') {
      try {
        const userRecord = await (adminAuth as Auth).createUser({
          email: email.toLowerCase(),
          emailVerified: true,
          password: password || 'Password123!', 
        });
        firebaseUid = userRecord.uid;
        firebaseCreated = true;
      } catch (fbError) {
        console.error('Error creating user in Firebase Auth:', fbError);
        return { success: false, error: fbError instanceof Error ? fbError.message : 'Failed to register account in Firebase.' };
      }
    }

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        role: role,
        firebaseUid: firebaseUid
      }
    });

    // Automatically create a matching Employee profile
    const count = await prisma.employee.count();
    const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    
    const emailParts = email.split('@');
    const namePart = emailParts[0];
    const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    await prisma.employee.create({
      data: {
        employeeId,
        userId: newUser.id,
        email: email.toLowerCase(),
        firstName,
        lastName: 'Employee',
        joiningDate: new Date(),
        employmentType: 'Full-time',
        status: 'Active',
      },
    });
    
    return { 
      success: true, 
      user: newUser, 
      firebaseCreated,
      message: firebaseCreated 
        ? `Successfully registered user in Firebase and database. Password: "${password || 'Password123!'}"`
        : `Database user profile created in Mock development mode.`
    };
  } catch (error) {
    console.error('Error in createUserAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
}
