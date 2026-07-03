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
