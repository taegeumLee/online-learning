const { PrismaClient } = require("@prisma/client");
const { subMonths } = require("date-fns");

const prisma = new PrismaClient();

async function main() {
  const prices = [200000, 250000];
  const names = [
    "김민준",
    "이서연",
    "박지호",
    "정하은",
    "최현우",
    "강서윤",
    "윤도현",
    "임수아",
    "송민서",
    "황준호",
    "조은서",
    "백현준",
    "신지원",
    "유승민",
    "오하늘",
    "권태양",
    "한소율",
    "남도윤",
    "문서영",
    "구하린",
  ];

  // 학생 20명 생성
  for (let i = 0; i < 20; i++) {
    const price = prices[Math.floor(Math.random() * prices.length)];
    const paymentDate = Math.floor(Math.random() * 28) + 1; // 1-28일

    const user = await prisma.user.create({
      data: {
        email: `student${i + 1}@example.com`,
        password: "password123",
        name: names[i],
        price,
        paymentDate,
        role: "user",
      },
    });

    // 이번달 payment 생성
    const thisMonthStatus = Math.random() < 0.7 ? "paid" : "pending"; // 70% 확률로 paid
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: price,
        status: thisMonthStatus,
        createdAt: new Date(),
      },
    });

    // 지난달 payment 생성
    const lastMonthStatus = Math.random() < 0.9 ? "paid" : "overdue"; // 90% 확률로 paid
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: price,
        status: lastMonthStatus,
        createdAt: subMonths(new Date(), 1),
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
