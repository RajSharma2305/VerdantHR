'use server';

import prisma from '@/lib/prisma';
import { 
  Role, 
  LeaveType, 
  LeaveStatus, 
  AttendanceStatus, 
  AssetStatus, 
  TicketStatus, 
  TicketPriority 
} from '@prisma/client';

// -------------------------------------------------------------
// SEED SAMPLE DATA ACTION
// -------------------------------------------------------------
export async function seedSampleDataAction() {
  try {
    console.log("Seeding sample data...");

    // 1. Create Organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Verdant Enterprise',
          code: 'VE'
        }
      });
    }

    // 2. Create Departments
    const deptData = [
      { name: 'Engineering', code: 'ENG' },
      { name: 'HR Operations', code: 'HR' },
      { name: 'Finance', code: 'FIN' }
    ];
    const departments = [];
    for (const d of deptData) {
      let dept = await prisma.department.findUnique({ where: { code: d.code } });
      if (!dept) {
        dept = await prisma.department.create({
          data: {
            name: d.name,
            code: d.code,
            organizationId: org.id
          }
        });
      }
      departments.push(dept);
    }
    const engDept = departments.find(d => d.code === 'ENG')!;
    const hrDept = departments.find(d => d.code === 'HR')!;
    const finDept = departments.find(d => d.code === 'FIN')!;

    // 3. Create Designations
    const desData = [
      { title: 'Software Engineer', code: 'SWE' },
      { title: 'HR Manager', code: 'HRM' },
      { title: 'Payroll Lead', code: 'FPL' }
    ];
    const designations = [];
    for (const des of desData) {
      let designation = await prisma.designation.findUnique({ where: { code: des.code } });
      if (!designation) {
        designation = await prisma.designation.create({
          data: {
            title: des.title,
            code: des.code
          }
        });
      }
      designations.push(designation);
    }
    const sweDes = designations.find(d => d.code === 'SWE')!;
    const hrmDes = designations.find(d => d.code === 'HRM')!;
    const fplDes = designations.find(d => d.code === 'FPL')!;

    // 4. Create Users and Employee Profiles
    const mockUsers = [
      { email: 'rahul.sharma@company.com', uid: 'mock-rahul-uid', firstName: 'Rahul', lastName: 'Sharma', role: Role.EMPLOYEE, deptId: engDept.id, desId: sweDes.id, empId: 'EMP001' },
      { email: 'priya.singh@company.com', uid: 'mock-priya-uid', firstName: 'Priya', lastName: 'Singh', role: Role.EMPLOYEE, deptId: engDept.id, desId: sweDes.id, empId: 'EMP002' },
      { email: 'neha.gupta@company.com', uid: 'mock-neha-uid', firstName: 'Neha', lastName: 'Gupta', role: Role.EMPLOYEE, deptId: finDept.id, desId: fplDes.id, empId: 'EMP003' },
      { email: 'amit.verma@company.com', uid: 'mock-amit-uid', firstName: 'Amit', lastName: 'Verma', role: Role.HR_MANAGER, deptId: hrDept.id, desId: hrmDes.id, empId: 'EMP004' }
    ];

    const employees = [];
    for (const mu of mockUsers) {
      let user = await prisma.user.findUnique({ where: { email: mu.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: mu.email,
            firebaseUid: mu.uid,
            role: mu.role
          }
        });
      }

      let employee = await prisma.employee.findUnique({ where: { userId: user.id } });
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            employeeId: mu.empId,
            userId: user.id,
            email: mu.email,
            firstName: mu.firstName,
            lastName: mu.lastName,
            joiningDate: new Date('2025-01-15'),
            departmentId: mu.deptId,
            designationId: mu.desId,
            employmentType: 'Full-time',
            status: 'Active'
          }
        });
      }
      employees.push(employee);
    }
    const rahulEmp = employees.find(e => e.employeeId === 'EMP001')!;
    const priyaEmp = employees.find(e => e.employeeId === 'EMP002')!;
    const nehaEmp = employees.find(e => e.employeeId === 'EMP003')!;
    const amitEmp = employees.find(e => e.employeeId === 'EMP004')!;

    // 5. Create Attendance Logs
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const attendances = [
      { employeeId: rahulEmp.id, date: yesterday, clockIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 15), clockOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 18, 0), status: AttendanceStatus.PRESENT },
      { employeeId: priyaEmp.id, date: yesterday, clockIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 45), clockOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 30), status: AttendanceStatus.PRESENT },
      { employeeId: nehaEmp.id, date: yesterday, clockIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 30), clockOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 18, 15), status: AttendanceStatus.PRESENT },
      { employeeId: rahulEmp.id, date: today, clockIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 5), clockOut: null, status: AttendanceStatus.PRESENT }
    ];

    for (const att of attendances) {
      const formattedDate = new Date(att.date.getFullYear(), att.date.getMonth(), att.date.getDate());
      const exists = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: att.employeeId,
            date: formattedDate
          }
        }
      });
      if (!exists) {
        await prisma.attendance.create({
          data: {
            employeeId: att.employeeId,
            date: formattedDate,
            clockIn: att.clockIn,
            clockOut: att.clockOut,
            status: att.status
          }
        });
      }
    }

    // 6. Create Leave Requests
    const leaves = [
      { employeeId: rahulEmp.id, leaveType: LeaveType.CASUAL, startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), reason: 'Family trip to hills', status: LeaveStatus.PENDING },
      { employeeId: amitEmp.id, leaveType: LeaveType.SICK, startDate: yesterday, endDate: yesterday, reason: 'Doctor consultation for seasonal flu', status: LeaveStatus.APPROVED, approvedById: amitEmp.id }
    ];

    for (const lv of leaves) {
      const exists = await prisma.leaveRequest.findFirst({
        where: {
          employeeId: lv.employeeId,
          startDate: lv.startDate
        }
      });
      if (!exists) {
        await prisma.leaveRequest.create({
          data: {
            employeeId: lv.employeeId,
            leaveType: lv.leaveType,
            startDate: lv.startDate,
            endDate: lv.endDate,
            reason: lv.reason,
            status: lv.status,
            approvedById: lv.approvedById
          }
        });
      }
    }

    // 7. Create Payrolls
    const payrolls = [
      { employeeId: rahulEmp.id, month: 6, year: 2026, basic: 85000, hra: 34000, pf: 10200, tax: 8500, net: 100300, status: 'Approved' },
      { employeeId: nehaEmp.id, month: 6, year: 2026, basic: 70000, hra: 28000, pf: 8400, tax: 7000, net: 82600, status: 'Paid' }
    ];

    for (const pr of payrolls) {
      const exists = await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: pr.employeeId,
            month: pr.month,
            year: pr.year
          }
        }
      });
      if (!exists) {
        await prisma.payroll.create({
          data: {
            employeeId: pr.employeeId,
            month: pr.month,
            year: pr.year,
            basicSalary: pr.basic,
            hra: pr.hra,
            bonus: 0,
            providentFund: pr.pf,
            professionalTax: 200,
            incomeTax: pr.tax,
            netSalary: pr.net,
            status: pr.status
          }
        });
      }
    }

    // 8. Create Assets
    const assetsData = [
      { name: 'MacBook Pro 16"', serialNumber: 'MB-2026-X83', type: 'Laptop', status: AssetStatus.ASSIGNED, allocatedToId: rahulEmp.id, allocatedDate: yesterday },
      { name: 'Dell UltraSharp 27" U2723QE', serialNumber: 'DELL-27-99A', type: 'Monitor', status: AssetStatus.AVAILABLE },
      { name: 'iPhone 15 Pro Max 256GB', serialNumber: 'AP-15PM-772', type: 'Mobile Phone', status: AssetStatus.ASSIGNED, allocatedToId: amitEmp.id, allocatedDate: yesterday }
    ];

    for (const ast of assetsData) {
      const exists = await prisma.asset.findUnique({ where: { serialNumber: ast.serialNumber } });
      if (!exists) {
        await prisma.asset.create({
          data: {
            name: ast.name,
            serialNumber: ast.serialNumber,
            type: ast.type,
            status: ast.status,
            allocatedToId: ast.allocatedToId,
            allocatedDate: ast.allocatedDate
          }
        });
      }
    }

    // 9. Create Help Desk Tickets
    const tickets = [
      { title: 'VPN connection fails on home Wi-Fi', description: 'After updating macOS, FortiClient VPN fails to authenticate.', category: 'IT Infrastructure', status: TicketStatus.OPEN, priority: TicketPriority.HIGH, raisedById: rahulEmp.id },
      { title: 'Payroll portal loading error', description: 'When trying to view June pay slips, the page throws a 500 error.', category: 'Software Support', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, raisedById: priyaEmp.id, assignedToId: amitEmp.id }
    ];

    for (const t of tickets) {
      const exists = await prisma.helpTicket.findFirst({
        where: {
          title: t.title,
          raisedById: t.raisedById
        }
      });
      if (!exists) {
        await prisma.helpTicket.create({
          data: {
            title: t.title,
            description: t.description,
            category: t.category,
            status: t.status,
            priority: t.priority,
            raisedById: t.raisedById,
            assignedToId: t.assignedToId
          }
        });
      }
    }

    console.log("Seeding completed successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error seeding sample data:", error);
    return { success: false, error: error instanceof Error ? error.message : "Seeding failed" };
  }
}

// -------------------------------------------------------------
// OVERVIEW STATS ACTION
// -------------------------------------------------------------
export async function getOverviewStatsAction() {
  try {
    const totalEmployees = await prisma.employee.count();
    const activeAttendance = await prisma.attendance.count({
      where: {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
      }
    });
    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: LeaveStatus.PENDING }
    });
    const openTickets = await prisma.helpTicket.count({
      where: { status: TicketStatus.OPEN }
    });

    return {
      success: true,
      stats: {
        totalEmployees,
        activeAttendance,
        pendingLeaves,
        openTickets
      }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to load overview stats" };
  }
}

// -------------------------------------------------------------
// EMPLOYEES ACTIONS
// -------------------------------------------------------------
export async function getEmployeesListAction() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        designation: true
      },
      orderBy: { employeeId: 'asc' }
    });
    return { success: true, employees };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch employees" };
  }
}

export async function createEmployeeAction(data: {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  employmentType: string;
  status: string;
  departmentId?: string;
  designationId?: string;
}) {
  try {
    // Check if user exists with this email, if not create a mock one
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          firebaseUid: `mock-${data.employeeId}-${Date.now()}`,
          role: Role.EMPLOYEE
        }
      });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        joiningDate: new Date(),
        employmentType: data.employmentType,
        status: data.status,
        departmentId: data.departmentId || null,
        designationId: data.designationId || null
      }
    });

    return { success: true, employee };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create employee" };
  }
}

// -------------------------------------------------------------
// ATTENDANCE ACTIONS
// -------------------------------------------------------------
async function getOrCreateEmployeeProfile(email: string) {
  let employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const count = await prisma.employee.count();
    const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    const emailParts = email.split('@');
    const namePart = emailParts[0];
    const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    employee = await prisma.employee.create({
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
  return employee;
}

export async function getAttendanceListAction(email?: string, role?: Role) {
  try {
    let logs: any[] = [];
    if (role === Role.SUPER_ADMIN || role === Role.HR_MANAGER || role === Role.ORG_ADMIN) {
      logs = await prisma.attendance.findMany({
        include: {
          employee: true
        },
        orderBy: { date: 'desc' }
      });
    } else if (email) {
      const employee = await getOrCreateEmployeeProfile(email);
      if (!employee) {
        return { success: true, logs: [] };
      }
      logs = await prisma.attendance.findMany({
        where: { employeeId: employee.id },
        include: {
          employee: true
        },
        orderBy: { date: 'desc' }
      });
    } else {
      logs = [];
    }
    return { success: true, logs };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch attendance" };
  }
}

export async function clockInAttendanceAction(employeeEmail: string) {
  try {
    const employee = await getOrCreateEmployeeProfile(employeeEmail);
    if (!employee) return { success: false, error: "Employee profile not found for this email." };

    const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    
    // Check if already clocked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: todayDate
        }
      }
    });

    if (existing) {
      return { success: false, error: "Already clocked in today." };
    }

    const newLog = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: todayDate,
        clockIn: new Date(),
        status: AttendanceStatus.PRESENT
      }
    });

    return { success: true, log: newLog };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Clock-in failed" };
  }
}

export async function clockOutAttendanceAction(employeeEmail: string) {
  try {
    const employee = await getOrCreateEmployeeProfile(employeeEmail);
    if (!employee) return { success: false, error: "Employee profile not found for this email." };

    const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: todayDate
        }
      }
    });

    if (!existing) {
      return { success: false, error: "No clock-in record found for today." };
    }

    if (existing.clockOut) {
      return { success: false, error: "Already clocked out today." };
    }

    const clockInTime = new Date(existing.clockIn);
    const clockOutTime = new Date();
    const workingHours = parseFloat(((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(2));

    const updatedLog = await prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: todayDate
        }
      },
      data: {
        clockOut: clockOutTime,
        workingHours
      }
    });

    return { success: true, log: updatedLog };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Clock-out failed" };
  }
}

// -------------------------------------------------------------
// LEAVES ACTIONS
// -------------------------------------------------------------
export async function getLeaveRequestsListAction(email?: string, role?: Role) {
  try {
    let requests: any[] = [];
    
    if (role === Role.SUPER_ADMIN) {
      requests = await prisma.leaveRequest.findMany({
        include: {
          employee: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (email) {
      const employee = await prisma.employee.findUnique({
        where: { email }
      });
      if (!employee) {
        return { success: true, requests: [] };
      }
      
      requests = await prisma.leaveRequest.findMany({
        where: { employeeId: employee.id },
        include: {
          employee: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch leave requests" };
  }
}

export async function createLeaveRequestAction(data: {
  employeeEmail: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: data.employeeEmail } });
    if (!employee) return { success: false, error: "Employee profile not found." };

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: LeaveStatus.PENDING
      }
    });

    return { success: true, request };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create leave request" };
  }
}

export async function updateLeaveStatusAction(requestId: string, newStatus: LeaveStatus, approverEmail: string) {
  try {
    const approver = await prisma.employee.findUnique({
      where: { email: approverEmail },
      include: { user: true }
    });
    
    if (!approver) {
      return { success: false, error: "Approver employee profile not found." };
    }

    if (approver.user?.role === Role.EMPLOYEE) {
      return { success: false, error: "Employees do not have access to approve or reject leaves." };
    }

    const request = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        approvedById: approver.id
      }
    });

    return { success: true, request };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update leave status" };
  }
}

// -------------------------------------------------------------
// PAYROLL ACTIONS
// -------------------------------------------------------------
export async function getPayrollsListAction() {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: true
      },
      orderBy: { year: 'desc', month: 'desc' }
    });
    return { success: true, payrolls };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch payrolls" };
  }
}

export async function createPayrollAction(data: {
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
}) {
  try {
    const basic = data.basicSalary;
    const hra = basic * 0.4;
    const pf = basic * 0.12;
    const tax = basic * 0.1;
    const net = (basic + hra) - (pf + tax + 200);

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        basicSalary: basic,
        hra: hra,
        bonus: 0,
        providentFund: pf,
        professionalTax: 200,
        incomeTax: tax,
        netSalary: net,
        status: 'Draft'
      }
    });

    return { success: true, payroll };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to calculate payroll" };
  }
}

export async function updatePayrollStatusAction(payrollId: string, newStatus: string) {
  try {
    const payroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: newStatus }
    });
    return { success: true, payroll };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update payroll status" };
  }
}

// -------------------------------------------------------------
// ASSET ACTIONS
// -------------------------------------------------------------
export async function getAssetsListAction() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        allocatedTo: true
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, assets };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch assets" };
  }
}

export async function createAssetAction(data: {
  name: string;
  serialNumber: string;
  type: string;
}) {
  try {
    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        type: data.type,
        status: AssetStatus.AVAILABLE
      }
    });
    return { success: true, asset };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add asset" };
  }
}

export async function assignAssetAction(assetId: string, employeeId: string | null) {
  try {
    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: employeeId ? AssetStatus.ASSIGNED : AssetStatus.AVAILABLE,
        allocatedToId: employeeId || null,
        allocatedDate: employeeId ? new Date() : null
      }
    });
    return { success: true, asset: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign asset" };
  }
}

// -------------------------------------------------------------
// HELP DESK ACTIONS
// -------------------------------------------------------------
export async function getTicketsListAction() {
  try {
    const tickets = await prisma.helpTicket.findMany({
      include: {
        raisedBy: true,
        assignedTo: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, tickets };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tickets" };
  }
}

export async function createTicketAction(data: {
  employeeEmail: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}) {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: data.employeeEmail } });
    if (!employee) return { success: false, error: "Employee profile not found." };

    const ticket = await prisma.helpTicket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        status: TicketStatus.OPEN,
        priority: data.priority,
        raisedById: employee.id
      }
    });

    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to raise support ticket" };
  }
}

export async function updateTicketStatusAction(ticketId: string, newStatus: TicketStatus, agentEmail?: string) {
  try {
    let agent = null;
    if (agentEmail) {
      agent = await prisma.employee.findUnique({ where: { email: agentEmail } });
    }

    const ticket = await prisma.helpTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        assignedToId: agent ? agent.id : undefined
      }
    });

    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update ticket status" };
  }
}

// -------------------------------------------------------------
// LIST DATA/CONFIG FOR DROPDOWNS
// -------------------------------------------------------------
export async function getDeptsAndDesigsAction() {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const designations = await prisma.designation.findMany({ orderBy: { title: 'asc' } });
    return { success: true, departments, designations };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to load config details" };
  }
}

export async function getEmployeeDepartmentAction(email: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { department: true }
    });
    if (!employee) return { success: false, error: "Employee profile not found" };
    return { 
      success: true, 
      departmentName: employee.department?.name || null, 
      departmentCode: employee.department?.code || null 
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to load employee department" };
  }
}

export async function getNotificationsAction(email: string, role: Role) {
  try {
    const notifications: any[] = [];
    
    // Find the employee profile first
    const employee = await prisma.employee.findUnique({
      where: { email }
    });

    if (!employee && role !== Role.SUPER_ADMIN) {
      return { success: true, notifications: [] };
    }

    const employeeId = employee?.id;

    // 1. Leave Requests
    let leaves;
    if (role === Role.SUPER_ADMIN) {
      leaves = await prisma.leaveRequest.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } else {
      leaves = await prisma.leaveRequest.findMany({
        where: { employeeId },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    leaves.forEach(req => {
      const time = req.createdAt;
      const id = `leave-${req.id}`;
      if (role === Role.SUPER_ADMIN) {
        const text = `${req.employee.firstName} ${req.employee.lastName} applied for ${req.leaveType} leave. Status: ${req.status}`;
        notifications.push({
          id,
          title: 'Leave Request Update',
          text,
          time,
          createdAt: req.createdAt
        });
      } else {
        const text = `Your leave request for ${req.leaveType} is ${req.status.toLowerCase()}.`;
        notifications.push({
          id,
          title: 'Leave Request Status',
          text,
          time,
          createdAt: req.createdAt
        });
      }
    });

    // 2. Assets
    let assets;
    if (role === Role.SUPER_ADMIN) {
      assets = await prisma.asset.findMany({
        where: { NOT: { allocatedToId: null } },
        include: { allocatedTo: true },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    } else {
      assets = await prisma.asset.findMany({
        where: { allocatedToId: employeeId },
        include: { allocatedTo: true },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    }

    assets.forEach(asset => {
      const time = asset.allocatedDate || asset.updatedAt || asset.createdAt;
      const id = `asset-${asset.id}`;
      if (role === Role.SUPER_ADMIN) {
        const text = `Asset ${asset.name} (SN: ${asset.serialNumber}) is assigned to ${asset.allocatedTo?.firstName} ${asset.allocatedTo?.lastName}.`;
        notifications.push({
          id,
          title: 'IT Asset Assignment',
          text,
          time,
          createdAt: time
        });
      } else {
        const text = `Asset ${asset.name} (SN: ${asset.serialNumber}) has been assigned to you.`;
        notifications.push({
          id,
          title: 'Asset Allocated',
          text,
          time,
          createdAt: time
        });
      }
    });

    // 3. Payrolls
    let payrolls;
    if (role === Role.SUPER_ADMIN) {
      payrolls = await prisma.payroll.findMany({
        include: { employee: true },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    } else {
      payrolls = await prisma.payroll.findMany({
        where: { employeeId },
        include: { employee: true },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    }

    payrolls.forEach(payroll => {
      const time = payroll.updatedAt || payroll.createdAt;
      const id = `payroll-${payroll.id}`;
      const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthStr = monthNames[payroll.month] || `Month ${payroll.month}`;
      
      if (role === Role.SUPER_ADMIN) {
        const text = `Payroll status for ${payroll.employee.firstName} ${payroll.employee.lastName} updated to ${payroll.status} for ${monthStr} ${payroll.year}.`;
        notifications.push({
          id,
          title: 'Payroll Updated',
          text,
          time,
          createdAt: time
        });
      } else {
        const text = `Your payslip for ${monthStr} ${payroll.year} is ${payroll.status.toLowerCase()}.`;
        notifications.push({
          id,
          title: 'Payslip Released',
          text,
          time,
          createdAt: time
        });
      }
    });

    // 4. Help Tickets
    let tickets;
    if (role === Role.SUPER_ADMIN) {
      tickets = await prisma.helpTicket.findMany({
        include: { raisedBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } else {
      tickets = await prisma.helpTicket.findMany({
        where: { raisedById: employeeId },
        include: { raisedBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    tickets.forEach(ticket => {
      const time = ticket.updatedAt || ticket.createdAt;
      const id = `ticket-${ticket.id}`;
      if (role === Role.SUPER_ADMIN) {
        const text = `Ticket #${ticket.id.slice(-4)}: "${ticket.title}" raised by ${ticket.raisedBy?.firstName} ${ticket.raisedBy?.lastName}. Status: ${ticket.status}`;
        notifications.push({
          id,
          title: 'Help Desk Ticket',
          text,
          time,
          createdAt: time
        });
      } else {
        const text = `Your ticket "${ticket.title}" status is ${ticket.status.toLowerCase()}.`;
        notifications.push({
          id,
          title: 'Ticket Status Update',
          text,
          time,
          createdAt: time
        });
      }
    });

    // Sort all notifications by createdAt desc
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Take top 15
    const finalNotifications = notifications.slice(0, 15);

    return { success: true, notifications: finalNotifications };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to load notifications" };
  }
}
