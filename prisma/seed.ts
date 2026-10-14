import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.flat.count()) > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  const flats = [
    { flat_number: 'A-101', floor: 1, block: 'A', status: 'Completed', owner_name: 'R. Sharma' },
    { flat_number: 'A-102', floor: 1, block: 'A', status: 'Near Completion' },
    { flat_number: 'A-201', floor: 2, block: 'A', status: 'In Progress', owner_name: 'P. Mehta' },
    { flat_number: 'A-202', floor: 2, block: 'A', status: 'In Progress' },
    { flat_number: 'B-101', floor: 1, block: 'B', status: 'In Progress' },
    { flat_number: 'B-102', floor: 1, block: 'B', status: 'Not Started' },
    { flat_number: 'B-201', floor: 2, block: 'B', status: 'Not Started' },
    { flat_number: 'B-202', floor: 2, block: 'B', status: 'Handed Over', owner_name: 'S. Iyer' },
  ];
  const ids: Record<string, string> = {};
  for (const data of flats) {
    const flat = await prisma.flat.create({ data });
    ids[flat.flat_number] = flat.id;
  }

  await prisma.material.createMany({
    data: [
      { name: 'UltraTech Cement', category: 'Cement', quantity: 120, unit: 'Bags', min_stock_level: 50, location: 'Shed 1' },
      { name: 'River Sand', category: 'Sand', quantity: 8, unit: 'Ton', min_stock_level: 10, location: 'Yard' },
      { name: 'Red Bricks', category: 'Bricks', quantity: 4500, unit: 'Pieces', min_stock_level: 2000, location: 'Yard' },
      { name: 'TMT Steel 12mm', category: 'Steel', quantity: 900, unit: 'Kg', min_stock_level: 1000, location: 'Shed 2' },
      { name: 'Vitrified Tiles 2x2', category: 'Tiles', quantity: 340, unit: 'Boxes', min_stock_level: 100, location: 'Shed 3' },
      { name: 'Asian Paints Emulsion', category: 'Paint', quantity: 60, unit: 'Liters', min_stock_level: 40, location: 'Store Room' },
      { name: 'CPVC Pipe 1"', category: 'Plumbing', quantity: 25, unit: 'Meters', min_stock_level: 30, location: 'Store Room' },
    ],
  });

  await prisma.workNote.createMany({
    data: [
      { flat_id: ids['A-201'], category: 'Plumbing', title: 'Kitchen sink leakage', description: 'Joint under the sink is leaking. Needs re-sealing.', status: 'Pending', priority: 'High' },
      { flat_id: ids['A-201'], category: 'Electrical', title: 'Bedroom switchboard', description: 'Switchboard not fixed flush with wall.', status: 'In Progress', priority: 'Medium' },
      { flat_id: ids['A-102'], category: 'Painting', title: 'Final coat in living room', description: 'Second coat pending after putty touch-up.', status: 'Pending', priority: 'Low' },
      { flat_id: ids['B-101'], category: 'Civil', title: 'Crack in balcony slab', description: 'Hairline crack observed. Inspect before tiling.', status: 'Pending', priority: 'Critical' },
      { flat_id: ids['A-101'], category: 'Snag List', title: 'Door alignment', description: 'Main door rubs against the floor.', status: 'Resolved', priority: 'Medium' },
    ],
  });

  console.log('Seeded sample flats, materials and notes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
