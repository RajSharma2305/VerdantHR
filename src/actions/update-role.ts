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
