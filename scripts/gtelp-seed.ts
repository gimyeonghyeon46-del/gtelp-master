import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🚀 G-TELP 데이터 입력 시작...");

    // 기존 데이터 삭제
    await Promise.all([
      db.delete(schema.userProgress),
      db.delete(schema.challenges),
      db.delete(schema.units),
      db.delete(schema.lessons),
      db.delete(schema.courses),
      db.delete(schema.challengeOptions),
      db.delete(schema.challengeProgress),
    ]);

    console.log("✅ 기존 데이터 삭제 완료");

    // 코스 생성: G-TELP 영어
    const courses = await db
      .insert(schema.courses)
      .values([
        { 
          title: "G-TELP 영어", 
          imageSrc: "/gtelp.svg" // 나중에 아이콘 추가
        }
      ])
      .returning();

    console.log("✅ 코스 생성 완료:", courses[0].title);

    // 유닛 생성: 문법 기초
    const units = await db
      .insert(schema.units)
      .values([
        {
          courseId: courses[0].id,
          title: "문법 기초",
          description: "G-TELP 필수 문법을 배워요",
          order: 1,
        },
      ])
      .returning();

    console.log("✅ 유닛 생성 완료:", units[0].title);

    // 레슨 생성
    const lessons = await db
      .insert(schema.lessons)
      .values([
        { unitId: units[0].id, title: "현재시제", order: 1 },
      ])
      .returning();

    console.log("✅ 레슨 생성 완료:", lessons[0].title);

    // 문제 1: 3인칭 단수 현재형
    const challenge1 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lessons[0].id,
          type: "SELECT",
          question: "She ___ to school every day.",
          order: 1,
        },
      ])
      .returning();

    await db.insert(schema.challengeOptions).values([
      { challengeId: challenge1[0].id, text: "go", correct: false },
      { challengeId: challenge1[0].id, text: "goes", correct: true },
      { challengeId: challenge1[0].id, text: "going", correct: false },
    ]);

    // 문제 2: be동사
    const challenge2 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lessons[0].id,
          type: "SELECT",
          question: "They ___ students.",
          order: 2,
        },
      ])
      .returning();

    await db.insert(schema.challengeOptions).values([
      { challengeId: challenge2[0].id, text: "is", correct: false },
      { challengeId: challenge2[0].id, text: "am", correct: false },
      { challengeId: challenge2[0].id, text: "are", correct: true },
    ]);

    // 문제 3: 현재진행형
    const challenge3 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lessons[0].id,
          type: "SELECT",
          question: "I ___ a book right now.",
          order: 3,
        },
      ])
      .returning();

    await db.insert(schema.challengeOptions).values([
      { challengeId: challenge3[0].id, text: "read", correct: false },
      { challengeId: challenge3[0].id, text: "am reading", correct: true },
      { challengeId: challenge3[0].id, text: "reads", correct: false },
    ]);

    // 문제 4: 부정문
    const challenge4 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lessons[0].id,
          type: "SELECT",
          question: "He ___ like coffee.",
          order: 4,
        },
      ])
      .returning();

    await db.insert(schema.challengeOptions).values([
      { challengeId: challenge4[0].id, text: "don't", correct: false },
      { challengeId: challenge4[0].id, text: "doesn't", correct: true },
      { challengeId: challenge4[0].id, text: "isn't", correct: false },
    ]);

    // 문제 5: 의문문
    const challenge5 = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lessons[0].id,
          type: "SELECT",
          question: "___ you speak English?",
          order: 5,
        },
      ])
      .returning();

    await db.insert(schema.challengeOptions).values([
      { challengeId: challenge5[0].id, text: "Does", correct: false },
      { challengeId: challenge5[0].id, text: "Do", correct: true },
      { challengeId: challenge5[0].id, text: "Are", correct: false },
    ]);

    console.log("✅ 문제 5개 생성 완료");
    console.log("🎉 G-TELP 데이터베이스 세팅 완료!");

  } catch (error) {
    console.error("❌ 에러 발생:", error);
    throw new Error("Database seeding failed");
  }
};

main();
