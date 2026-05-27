import { PrismaClient } from "@prisma/client";
import { initializeCompanyAccounting } from "../app/actions/accounting/setup";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error("No company found to initialize accounting for.");
    return;
  }
  
  console.log(`Initializing accounting for company: ${company.name}`);
  const result = await initializeCompanyAccounting(company.id);
  
  if (result.success) {
    console.log("Successfully initialized Tally groups and default ledgers!");
  } else {
    console.error("Failed to initialize:", result.error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
