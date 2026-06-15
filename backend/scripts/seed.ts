import 'dotenv/config';
import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcrypt';
import * as schema from '../src/shared/database/schema';

type CustomerSeed = {
  name: string;
  phone: string;
  type: 'builder' | 'contractor';
  cnic?: string;
};

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      slug: 'demo-bhatta',
      displayName: 'Demo Bhatta ERP',
      businessType: 'brick_kiln',
      primaryColor: '#b45309',
      accentColor: '#fbbf24',
      showPoweredBy: true,
    })
    .onConflictDoNothing({ target: schema.tenants.slug })
    .returning();

  const existingTenant =
    tenant ??
    (
      await db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.slug, 'demo-bhatta'))
        .limit(1)
    )[0];

  if (!existingTenant) {
    throw new Error('Failed to resolve demo-bhatta tenant');
  }

  const sampleCustomers: CustomerSeed[] = [
    {
      name: 'Ali Builders',
      phone: '+92-300-1234567',
      type: 'builder' as const,
      cnic: '35201-1234567-1',
    },
    {
      name: 'Khan Contractor',
      phone: '+92-311-9876543',
      type: 'contractor' as const,
    },
    {
      name: 'Pindi Developers',
      phone: '+92-322-1112222',
      type: 'builder' as const,
    },
  ];

  for (const sample of sampleCustomers) {
    const existing = await db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(eq(schema.customers.name, sample.name))
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(schema.customers).values({
      tenantId: existingTenant.id,
      name: sample.name,
      phone: sample.phone,
      type: sample.type,
      cnic: sample.cnic,
    });
  }

  const sampleMaterials = [
    {
      name: 'A Grade Brick',
      code: 'A-GRADE',
      category: 'brick' as const,
      unit: 'piece' as const,
      defaultRate: '18',
      productionCost: '10',
    },
    {
      name: 'B Grade Brick',
      code: 'B-GRADE',
      category: 'brick' as const,
      unit: 'piece' as const,
      defaultRate: '15',
      productionCost: '8',
    },
    {
      name: 'C Grade Brick',
      code: 'C-GRADE',
      category: 'brick' as const,
      unit: 'piece' as const,
      defaultRate: '12',
      productionCost: '6',
    },
    {
      name: 'Broken Brick',
      code: 'BROKEN',
      category: 'brick' as const,
      unit: 'piece' as const,
      defaultRate: '8',
      productionCost: '3',
    },
  ];

  for (const material of sampleMaterials) {
    const existing = await db
      .select({ id: schema.materialTypes.id })
      .from(schema.materialTypes)
      .where(
        and(
          eq(schema.materialTypes.tenantId, existingTenant.id),
          eq(schema.materialTypes.code, material.code),
        ),
      )
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(schema.materialTypes).values({
      tenantId: existingTenant.id,
      ...material,
    });
  }

  const [aliCustomer] = await db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.name, 'Ali Builders'))
    .limit(1);

  const [aGrade] = await db
    .select()
    .from(schema.materialTypes)
    .where(eq(schema.materialTypes.code, 'A-GRADE'))
    .limit(1);

  const sampleVehicles = [
    {
      registrationNumber: 'LEA-1234',
      driverName: 'Ahmed Khan',
      type: 'truck' as const,
    },
    {
      registrationNumber: 'RIS-5678',
      driverName: 'Bashir',
      type: 'loader' as const,
    },
  ];

  for (const v of sampleVehicles) {
    const exists = await db
      .select({ id: schema.vehicles.id })
      .from(schema.vehicles)
      .where(
        and(
          eq(schema.vehicles.tenantId, existingTenant.id),
          eq(schema.vehicles.registrationNumber, v.registrationNumber),
        ),
      )
      .limit(1);
    if (exists.length === 0) {
      await db.insert(schema.vehicles).values({
        tenantId: existingTenant.id,
        ...v,
      });
    }
  }

  const [truck] = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.registrationNumber, 'LEA-1234'))
    .limit(1);

  if (aliCustomer && aGrade && truck) {
    let orderId: string;

    const existingOrder = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, 'ORD-0001'))
      .limit(1);

    if (existingOrder.length === 0) {
      const [order] = await db
        .insert(schema.orders)
        .values({
          tenantId: existingTenant.id,
          orderNumber: 'ORD-0001',
          customerId: aliCustomer.id,
          deliveryAddress: 'DHA Phase 2, Islamabad',
          materialTypeId: aGrade.id,
          orderedQty: '100000',
          deliveredQty: '0',
          rate: '18',
          totalAmount: '1800000',
          status: 'confirmed',
          notes: 'Advance booking — deliveries over 3 months',
        })
        .returning();
      orderId = order.id;
    } else {
      orderId = existingOrder[0].id;
    }

    const dispatchSeeds = [
      {
        number: 'DSP-0001',
        qty: '20000',
        date: '2026-05-15',
        location: 'DHA Phase 2, Islamabad',
      },
      {
        number: 'DSP-0002',
        qty: '20000',
        date: '2026-05-22',
        location: 'DHA Phase 2, Islamabad',
      },
      {
        number: 'DSP-0003',
        qty: '15000',
        date: '2026-06-01',
        location: 'Bahria Town Phase 4',
      },
    ];

    const dispatchIdByNumber: Record<string, string> = {};

    for (const d of dispatchSeeds) {
      const exists = await db
        .select({ id: schema.dispatches.id })
        .from(schema.dispatches)
        .where(eq(schema.dispatches.dispatchNumber, d.number))
        .limit(1);

      if (exists.length > 0) {
        dispatchIdByNumber[d.number] = exists[0].id;
        continue;
      }

      const [inserted] = await db
        .insert(schema.dispatches)
        .values({
          tenantId: existingTenant.id,
          dispatchNumber: d.number,
          orderId,
          customerId: aliCustomer.id,
          vehicleId: truck.id,
          driverName: truck.driverName,
          materialTypeId: aGrade.id,
          quantity: d.qty,
          rate: '18',
          amount: String(Number(d.qty) * 18),
          deliveryLocation: d.location,
          pickupLocation: 'Yard',
          dropoffLocation: d.location,
          dispatchDate: d.date,
          scheduledStartAt: new Date(`${d.date}T08:00:00+05:00`),
          expectedDeliveryAt: new Date(`${d.date}T17:00:00+05:00`),
          journeyKm: '42.5',
          status: 'delivered',
          paymentStatus: 'unpaid',
        })
        .returning({ id: schema.dispatches.id });

      dispatchIdByNumber[d.number] = inserted.id;
    }

    await db
      .update(schema.orders)
      .set({ deliveredQty: '55000', status: 'partial' })
      .where(eq(schema.orders.id, orderId));

    const paymentSeeds = [
      {
        number: 'RCP-0001',
        dispatchNumber: 'DSP-0001',
        amount: '360000',
        date: '2026-05-20',
        method: 'bank' as const,
      },
      {
        number: 'RCP-0002',
        dispatchNumber: 'DSP-0002',
        amount: '300000',
        date: '2026-06-05',
        method: 'cash' as const,
      },
    ];

    for (const p of paymentSeeds) {
      const exists = await db
        .select({ id: schema.payments.id })
        .from(schema.payments)
        .where(eq(schema.payments.receiptNumber, p.number))
        .limit(1);
      if (exists.length > 0) continue;

      const dispatchId = dispatchIdByNumber[p.dispatchNumber];
      if (!dispatchId) continue;

      await db.insert(schema.payments).values({
        tenantId: existingTenant.id,
        receiptNumber: p.number,
        customerId: aliCustomer.id,
        orderId,
        dispatchId,
        amount: p.amount,
        paymentMethod: p.method,
        paymentDate: p.date,
      });

      const dispatchAmount =
        Number(
          dispatchSeeds.find((d) => d.number === p.dispatchNumber)?.qty ?? 0,
        ) * 18;
      if (Number(p.amount) >= dispatchAmount) {
        await db
          .update(schema.dispatches)
          .set({ paymentStatus: 'paid' })
          .where(eq(schema.dispatches.id, dispatchId));
      }
    }

    await db
      .update(schema.orders)
      .set({ receivedAmount: '660000' })
      .where(eq(schema.orders.id, orderId));

    const productionSeeds = [
      {
        number: 'PROD-0001',
        qty: '50000',
        damaged: '2000',
        date: '2026-05-10',
      },
      {
        number: 'PROD-0002',
        qty: '45000',
        damaged: '1500',
        date: '2026-05-25',
      },
      {
        number: 'PROD-0003',
        qty: '40000',
        damaged: '1000',
        date: '2026-06-03',
      },
    ];

    for (const p of productionSeeds) {
      const exists = await db
        .select({ id: schema.productionBatches.id })
        .from(schema.productionBatches)
        .where(eq(schema.productionBatches.batchNumber, p.number))
        .limit(1);
      if (exists.length > 0) continue;

      const netQty = Number(p.qty) - Number(p.damaged);
      const [batch] = await db
        .insert(schema.productionBatches)
        .values({
          tenantId: existingTenant.id,
          batchNumber: p.number,
          materialTypeId: aGrade.id,
          producedQty: p.qty,
          damagedQty: p.damaged,
          productionDate: p.date,
        })
        .returning();

      await db.insert(schema.stockLedger).values({
        tenantId: existingTenant.id,
        materialTypeId: aGrade.id,
        transactionType: 'production',
        quantity: String(netQty),
        referenceType: 'production_batch',
        referenceId: batch.id,
        transactionDate: p.date,
        notes: `Production ${p.number}`,
      });
    }

    const dispatchRows = await db
      .select()
      .from(schema.dispatches)
      .where(eq(schema.dispatches.tenantId, existingTenant.id));

    for (const d of dispatchRows) {
      if (d.status !== 'delivered') continue;
      const stockExists = await db
        .select({ id: schema.stockLedger.id })
        .from(schema.stockLedger)
        .where(
          and(
            eq(schema.stockLedger.referenceType, 'dispatch'),
            eq(schema.stockLedger.referenceId, d.id),
          ),
        )
        .limit(1);
      if (stockExists.length > 0) continue;

      await db.insert(schema.stockLedger).values({
        tenantId: existingTenant.id,
        materialTypeId: d.materialTypeId,
        transactionType: 'dispatch',
        quantity: String(-Number(d.quantity)),
        referenceType: 'dispatch',
        referenceId: d.id,
        transactionDate: d.dispatchDate,
        notes: `Dispatch ${d.dispatchNumber}`,
      });
    }

    if (truck) {
      const expenseSeeds = [
        { category: 'fuel' as const, amount: '15000', date: '2026-05-16' },
        { category: 'repair' as const, amount: '8000', date: '2026-05-28' },
        { category: 'fuel' as const, amount: '12000', date: '2026-06-02' },
      ];

      for (const e of expenseSeeds) {
        const exists = await db
          .select({ id: schema.vehicleExpenses.id })
          .from(schema.vehicleExpenses)
          .where(
            and(
              eq(schema.vehicleExpenses.tenantId, existingTenant.id),
              eq(schema.vehicleExpenses.vehicleId, truck.id),
              eq(schema.vehicleExpenses.expenseDate, e.date),
              eq(schema.vehicleExpenses.amount, e.amount),
            ),
          )
          .limit(1);
        if (exists.length > 0) continue;

        await db.insert(schema.vehicleExpenses).values({
          tenantId: existingTenant.id,
          vehicleId: truck.id,
          category: e.category,
          amount: e.amount,
          expenseDate: e.date,
        });
      }
    }
  }

  // Update production costs on existing materials
  for (const material of sampleMaterials) {
    await db
      .update(schema.materialTypes)
      .set({ productionCost: material.productionCost })
      .where(
        and(
          eq(schema.materialTypes.tenantId, existingTenant.id),
          eq(schema.materialTypes.code, material.code),
        ),
      );
  }

  const platformAdminEmail = (
    process.env.PLATFORM_ADMIN_EMAIL ?? 'admin@tameer360.pk'
  ).toLowerCase();
  const platformAdminPassword =
    process.env.PLATFORM_ADMIN_PASSWORD ?? 'Tameer360!';
  const platformAdminHash = await bcrypt.hash(platformAdminPassword, 10);

  const [existingPlatformAdmin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.email, platformAdminEmail),
        isNull(schema.users.tenantId),
      ),
    )
    .limit(1);

  if (!existingPlatformAdmin) {
    await db.insert(schema.users).values({
      email: platformAdminEmail,
      passwordHash: platformAdminHash,
      fullName: 'Tameer360 Platform Admin',
      role: 'platform_admin',
    });
  }

  const ownerEmail = 'owner@demo-bhatta.pk';
  const ownerPassword = 'Demo1234!';
  const ownerHash = await bcrypt.hash(ownerPassword, 10);

  const [existingOwner] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.email, ownerEmail),
        eq(schema.users.tenantId, existingTenant.id),
      ),
    )
    .limit(1);

  if (!existingOwner) {
    await db.insert(schema.users).values({
      tenantId: existingTenant.id,
      email: ownerEmail,
      passwordHash: ownerHash,
      fullName: 'Demo Bhatta Owner',
      role: 'owner',
    });
  }

  console.log(
    'Seed complete: demo-bhatta + customers + materials + vehicles + dispatches + payments + stock + production + users',
  );
  console.log(
    `Platform admin: ${platformAdminEmail} / ${platformAdminPassword}`,
  );
  console.log(
    `Demo owner: ${ownerEmail} / ${ownerPassword} (tenant: demo-bhatta)`,
  );
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
