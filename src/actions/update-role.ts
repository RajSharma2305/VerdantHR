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
      include: {
        employeeProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.employeeProfile?.status || 'Active'
    }));

    return { success: true, users: safeUsers };
  } catch (error) {
    console.error('Error in getUsersAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
}

import { getAdminAuth } from '@/lib/firebase-admin';
import type { Auth } from 'firebase-admin/auth';

export async function syncFirebaseUsersAction() {
  try {
    const adminAuth = await getAdminAuth();
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

export async function createUserAction(email: string, role: Role, password?: string, creatorRole?: Role) {
  try {
    const adminAuth = await getAdminAuth();
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
        status: creatorRole === Role.ORG_ADMIN ? 'Pending Approval' : 'Active',
      },
    });
    
    return { 
      success: true, 
      user: JSON.parse(JSON.stringify(newUser)), 
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

export async function deleteUserAction(userId: string) {
  try {
    const adminAuth = await getAdminAuth();
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 2. Delete related Employee profile and its dependencies
    if (user.employeeProfile) {
      const employeeId = user.employeeProfile.id;
      
      // Delete leave balances
      await prisma.leaveBalance.deleteMany({ where: { employeeId } });
      
      // Delete attendance logs
      await prisma.attendance.deleteMany({ where: { employeeId } });
      
      // Delete leave requests
      await prisma.leaveRequest.deleteMany({ where: { employeeId } });
      
      // Delete payrolls
      await prisma.payroll.deleteMany({ where: { employeeId } });
      
      // Deassociate assets
      await prisma.asset.updateMany({
        where: { allocatedToId: employeeId },
        data: { allocatedToId: null, status: 'AVAILABLE', allocatedDate: null }
      });
      
      // Delete raised help tickets
      await prisma.helpTicket.deleteMany({ where: { raisedById: employeeId } });
      
      // Deassociate tickets assigned to this employee
      await prisma.helpTicket.updateMany({
        where: { assignedToId: employeeId },
        data: { assignedToId: null }
      });

      // Delete tasks assigned to this employee
      await prisma.task.updateMany({
        where: { assignedToId: employeeId },
        data: { assignedToId: null }
      });
      
      // Delete employee profile
      await prisma.employee.delete({ where: { id: employeeId } });
    }

    // 3. Delete user audit logs, comments, attachments
    await prisma.auditLog.deleteMany({ where: { userId } });
    await prisma.taskComment.deleteMany({ where: { userId } });
    await prisma.taskAttachment.deleteMany({ where: { uploadedById: userId } });

    // 4. Delete Firebase user if possible
    try {
      if ('deleteUser' in adminAuth && typeof (adminAuth as Auth).deleteUser === 'function') {
        await (adminAuth as Auth).deleteUser(user.firebaseUid);
      }
    } catch (firebaseError) {
      console.warn('Could not delete user from Firebase (mock mode?):', firebaseError);
    }

    // 5. Delete User record
    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: `User ${user.email} deleted successfully.` };
  } catch (error) {
    console.error('Error in deleteUserAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' };
  }
}

export async function approveUserAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return { success: false, error: 'Employee profile not found.' };
    }

    await prisma.employee.update({
      where: { userId },
      data: { status: 'Active' }
    });

    return { success: true, message: `User status approved successfully.` };
  } catch (error) {
    console.error('Error in approveUserAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve user' };
  }
}

export async function requestDeleteUserAction(userId: string, requesterRole: Role) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role === Role.SUPER_ADMIN) {
      return { success: false, error: 'Cannot delete or request deletion of a SUPER_ADMIN user.' };
    }

    if (requesterRole === Role.ORG_ADMIN) {
      // Set status to 'Pending Deletion'
      if (user.employeeProfile) {
        await prisma.employee.update({
          where: { userId },
          data: { status: 'Pending Deletion' }
        });
      }
      return { success: true, requested: true, message: 'Deletion request submitted for approval.' };
    } else if (requesterRole === Role.SUPER_ADMIN) {
      // Direct deletion
      return deleteUserAction(userId);
    } else {
      return { success: false, error: 'Unauthorized to delete users.' };
    }
  } catch (error) {
    console.error('Error in requestDeleteUserAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to process deletion request' };
  }
}

export async function updateUserCredentialsAction(
  userId: string,
  newEmail?: string,
  newPassword?: string,
  requesterUserId?: string,
  requesterRole?: Role
) {
  try {
    const adminAuth = await getAdminAuth();
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // 1. Find target user first (supports querying by database id, firebaseUid, or email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { firebaseUid: userId },
          { email: userId }
        ]
      },
      include: { employeeProfile: true }
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    // 2. Authorization check
    const isSelf = requesterUserId === user.id || requesterUserId === user.firebaseUid || requesterUserId === user.email;
    const isAdmin = requesterRole === Role.SUPER_ADMIN || requesterRole === Role.ORG_ADMIN;

    if (!isSelf && !isAdmin) {
      return { success: false, error: 'Unauthorized to update these credentials.' };
    }

    // Prevent non-superadmins from modifying superadmin credentials
    if (user.role === Role.SUPER_ADMIN && requesterRole === Role.ORG_ADMIN && !isSelf) {
      return { success: false, error: 'Organization admins cannot modify Super Admin credentials.' };
    }

    // 3. Validate new email uniqueness if changing email
    let cleanEmail = newEmail ? newEmail.trim().toLowerCase() : undefined;
    if (cleanEmail && cleanEmail !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
      if (emailExists) {
        return { success: false, error: 'A user with this email already exists.' };
      }
    } else {
      cleanEmail = undefined; // No email change needed
    }

    // 4. Update in Firebase if applicable
    let firebaseUpdated = false;
    if (cleanEmail || newPassword) {
      if ('updateUser' in adminAuth && typeof (adminAuth as Auth).updateUser === 'function') {
        try {
          const updateParams: { email?: string; password?: string } = {};
          if (cleanEmail) updateParams.email = cleanEmail;
          if (newPassword) updateParams.password = newPassword;

          await (adminAuth as Auth).updateUser(user.firebaseUid, updateParams);
          firebaseUpdated = true;
        } catch (fbError) {
          console.error('Error updating user in Firebase:', fbError);
          return { success: false, error: fbError instanceof Error ? fbError.message : 'Failed to update credentials in Firebase.' };
        }
      }
    }

    // 5. Update in database
    const dataToUpdate: { email?: string } = {};
    if (cleanEmail) {
      dataToUpdate.email = cleanEmail;
    }

    if (cleanEmail) {
      // Update User email
      await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate
      });

      // Update Employee profile email if exists
      if (user.employeeProfile) {
        await prisma.employee.update({
          where: { userId: user.id },
          data: { email: cleanEmail }
        });
      }
    }

    // 6. Write audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: requesterUserId || null,
          action: 'UPDATE_CREDENTIALS',
          details: `Updated credentials for user ${user.email}${cleanEmail ? ` (new email: ${cleanEmail})` : ''}. Method: ${firebaseUpdated ? 'Firebase + DB' : 'Mock/DB'}`
        }
      });
    } catch (auditError) {
      console.warn('Failed to write audit log:', auditError);
    }

    return {
      success: true,
      message: cleanEmail 
        ? 'Successfully updated email and account details.' 
        : 'Successfully updated password.'
    };
  } catch (error) {
    console.error('Error in updateUserCredentialsAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
}

