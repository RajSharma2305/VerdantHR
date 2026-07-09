const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { employeeProfile: true }
  });
  console.log("=== DB USERS ===");
  console.log(users.map(u => ({ email: u.email, role: u.role, status: u.employeeProfile?.status })));
  
  const payrolls = await prisma.payroll.findMany({
    include: { employee: true }
  });
  console.log("=== DB PAYROLLS ===");
  console.log(payrolls.map(p => ({ employee: p.employee?.email, month: p.month, year: p.year, status: p.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
