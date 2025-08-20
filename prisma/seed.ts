import prisma from "../src/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice"
    }
  });

  await prisma.post.create({
    data: {
      title: "Hello Prisma",
      content: "This is a seeded post",
      published: true,
      authorId: user.id
    }
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
