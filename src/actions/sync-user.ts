'use server';

import { adminAuth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function syncUserAction(idToken: string) {
  try {
    if (!idToken) {
      return { success: false, error: 'Token is required' };
    }

    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    if (!email) {
      return { success: false, error: 'Email is required from identity provider' };
    }

    // Determine the role to assign on creation
    let roleToAssign: Role = Role.EMPLOYEE;
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail.includes('superadmin')) {
      roleToAssign = Role.SUPER_ADMIN;
    } else if (lowerEmail.includes('admin')) {
      roleToAssign = Role.ORG_ADMIN;
    } else {
      // Fallback: If this is the very first user in the database, make them SUPER_ADMIN
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        roleToAssign = Role.SUPER_ADMIN;
      }
    }

    // Save/Update User in database (avoiding upsert to prevent replica set transactions requirement)
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: uid }
    });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          role: roleToAssign,
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email,
          role: roleToAssign,
        }
      });
    }

    // Check if employee profile exists, if not create a default draft profile
    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      // Generate a unique employee code
      const count = await prisma.employee.count();
      const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
      
      const emailParts = email.split('@');
      const namePart = emailParts[0];
      const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      
      await prisma.employee.create({
        data: {
          employeeId,
          userId: user.id,
          email,
          firstName,
          lastName: 'Employee',
          joiningDate: new Date(),
          employmentType: 'Full-time',
          status: 'Active',
        },
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error in syncUserAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
