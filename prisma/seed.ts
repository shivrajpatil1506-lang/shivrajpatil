import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  mockCompanies,
  mockSites,
  mockEmployees,
  mockCustomers,
  mockTransactions,
  mockTasks,
} from '../src/lib/mock-data';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

  // 1. Companies
  for (const company of mockCompanies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {},
      create: {
        id: company.id,
        name: company.name,
        short_name: company.short_name,
        cin: company.cin,
        gstin: company.gstin,
        pan: company.pan,
        email: company.email,
        status: company.status,
      },
    });
  }
  console.log('✅ Seeded Companies');

  // 2. Sites
  for (const site of mockSites) {
    await prisma.site.upsert({
      where: { id: site.id },
      update: {},
      create: {
        id: site.id,
        company_id: site.company_id,
        name: site.name,
        site_code: site.site_code,
        site_type: site.site_type,
        status: site.status,
      },
    });
  }
  console.log('✅ Seeded Sites');

  // 3. Employees
  for (const emp of mockEmployees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        employee_code: emp.employee_code,
        company_id: emp.company_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        personal_mobile: emp.personal_mobile,
        department: emp.department,
        join_date: new Date(emp.join_date),
        employment_type: emp.employment_type,
        portal_role: emp.portal_role,
        access_status: emp.access_status,
      },
    });
  }
  console.log('✅ Seeded Employees');

  // 4. Customers
  for (const cust of mockCustomers) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {},
      create: {
        id: cust.id,
        first_name: cust.first_name,
        last_name: cust.last_name,
        mobile_1: cust.mobile_1,
        customer_type: cust.customer_type,
      },
    });
  }
  console.log('✅ Seeded Customers');

  // 5. Tasks
  for (const task of mockTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        assigned_by: task.assigned_by,
        priority: task.priority,
        status: task.status,
      },
    });
  }
  console.log('✅ Seeded Tasks');

  // 6. Transactions
  for (const txn of mockTransactions) {
    await prisma.transaction.upsert({
      where: { id: txn.id },
      update: {},
      create: {
        id: txn.id,
        transaction_code: txn.transaction_code,
        company_id: txn.company_id,
        category: txn.category,
        transaction_date: new Date(txn.transaction_date),
        amount: txn.amount,
        payment_mode: txn.payment_mode,
        added_by: txn.added_by,
        status: txn.status,
      },
    });
  }
  console.log('✅ Seeded Transactions');

  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
