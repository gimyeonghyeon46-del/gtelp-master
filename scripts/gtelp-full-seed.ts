import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🚀 G-TELP 전체 데이터 입력 시작...");

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

    // 코스 생성
    const courses = await db
      .insert(schema.courses)
      .values([{ title: "지텔프 마스터", imageSrc: "/gtelp.svg" }])
      .returning();

    console.log("✅ 코스 생성:", courses[0].title);

    // ========== 유닛 1: 문법 기초 ==========
    const unit1 = await db
      .insert(schema.units)
      .values([
        {
          courseId: courses[0].id,
          title: "문법 기초",
          description: "필수 영어 문법을 마스터하세요",
          order: 1,
        },
      ])
      .returning();

    // 레슨 1: 현재시제
    const lesson1 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit1[0].id, title: "현재시제", order: 1 }])
      .returning();

    const grammarPresent = [
      {
        question: "She ___ to school every day.",
        options: ["go", "goes", "going"],
        correct: 1,
        explanation: "3인칭 단수 현재형은 동사에 -s/-es를 붙입니다."
      },
      {
        question: "They ___ students.",
        options: ["is", "am", "are"],
        correct: 2,
        explanation: "복수 주어(They)에는 are를 사용합니다."
      },
      {
        question: "I ___ a book right now.",
        options: ["read", "am reading", "reads"],
        correct: 1,
        explanation: "현재 진행 중인 동작은 be + ~ing 형태를 사용합니다."
      },
      {
        question: "He ___ like coffee.",
        options: ["don't", "doesn't", "isn't"],
        correct: 1,
        explanation: "3인칭 단수 부정문은 doesn't를 사용합니다."
      },
      {
        question: "___ you speak English?",
        options: ["Does", "Do", "Are"],
        correct: 1,
        explanation: "일반동사 의문문에서 주어가 you일 때 Do를 사용합니다."
      },
    ];

    for (let i = 0; i < grammarPresent.length; i++) {
      const challenge = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: lesson1[0].id,
            type: "SELECT",
            question: grammarPresent[i].question,
            order: i + 1,
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values(
        grammarPresent[i].options.map((opt, idx) => ({
          challengeId: challenge[0].id,
          text: opt,
          correct: idx === grammarPresent[i].correct,
        }))
      );
    }

    console.log("✅ 현재시제 5문제 추가");

    // 레슨 2: 과거시제
    const lesson2 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit1[0].id, title: "과거시제", order: 2 }])
      .returning();

    const grammarPast = [
      {
        question: "I ___ to Seoul yesterday.",
        options: ["go", "went", "gone"],
        correct: 1,
        explanation: "과거를 나타내는 yesterday가 있으므로 과거형 went를 사용합니다."
      },
      {
        question: "She ___ a movie last night.",
        options: ["watch", "watched", "watching"],
        correct: 1,
        explanation: "과거 시점(last night)의 동작이므로 과거형 watched를 사용합니다."
      },
      {
        question: "They ___ happy yesterday.",
        options: ["was", "were", "are"],
        correct: 1,
        explanation: "복수 주어의 과거형은 were를 사용합니다."
      },
      {
        question: "He ___ eat breakfast this morning.",
        options: ["don't", "didn't", "doesn't"],
        correct: 1,
        explanation: "과거 부정문은 didn't를 사용합니다."
      },
      {
        question: "___ you see him yesterday?",
        options: ["Do", "Did", "Does"],
        correct: 1,
        explanation: "과거 의문문은 Did를 사용합니다."
      },
    ];

    for (let i = 0; i < grammarPast.length; i++) {
      const challenge = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: lesson2[0].id,
            type: "SELECT",
            question: grammarPast[i].question,
            order: i + 1,
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values(
        grammarPast[i].options.map((opt, idx) => ({
          challengeId: challenge[0].id,
          text: opt,
          correct: idx === grammarPast[i].correct,
        }))
      );
    }

    console.log("✅ 과거시제 5문제 추가");

    // 레슨 3: 미래시제
    const lesson3 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit1[0].id, title: "미래시제", order: 3 }])
      .returning();

    const grammarFuture = [
      {
        question: "I ___ visit my friend tomorrow.",
        options: ["will", "going", "am"],
        correct: 0,
        explanation: "미래 계획은 will + 동사원형을 사용합니다."
      },
      {
        question: "She ___ be late for the meeting.",
        options: ["will", "is", "was"],
        correct: 0,
        explanation: "미래의 상태를 나타낼 때 will be를 사용합니다."
      },
      {
        question: "They ___ to travel next month.",
        options: ["go", "are going", "went"],
        correct: 1,
        explanation: "가까운 미래 계획은 be going to를 사용합니다."
      },
      {
        question: "We ___ study hard for the exam.",
        options: ["will", "are", "did"],
        correct: 0,
        explanation: "의지나 결심을 나타낼 때 will을 사용합니다."
      },
      {
        question: "___ you come to the party?",
        options: ["Will", "Do", "Did"],
        correct: 0,
        explanation: "미래 의문문은 Will을 문장 앞에 둡니다."
      },
    ];

    for (let i = 0; i < grammarFuture.length; i++) {
      const challenge = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: lesson3[0].id,
            type: "SELECT",
            question: grammarFuture[i].question,
            order: i + 1,
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values(
        grammarFuture[i].options.map((opt, idx) => ({
          challengeId: challenge[0].id,
          text: opt,
          correct: idx === grammarFuture[i].correct,
        }))
      );
    }

    console.log("✅ 미래시제 5문제 추가");

    // ========== 유닛 2: 필수 어휘 ==========
    const unit2 = await db
      .insert(schema.units)
      .values([
        {
          courseId: courses[0].id,
          title: "필수 어휘",
          description: "지텔프 고빈출 단어를 익혀요",
          order: 2,
        },
      ])
      .returning();

    // 레슨 4: 일상 어휘
    const lesson4 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit2[0].id, title: "일상 어휘", order: 1 }])
      .returning();

    const vocabulary = [
      {
        question: "'Happy'의 동의어는?",
        options: ["Sad", "Joyful", "Angry"],
        correct: 1,
      },
      {
        question: "'Difficult'의 의미는?",
        options: ["쉬운", "어려운", "재미있는"],
        correct: 1,
      },
      {
        question: "'Beautiful'의 반대말은?",
        options: ["Pretty", "Ugly", "Nice"],
        correct: 1,
      },
      {
        question: "'Quick'과 같은 의미는?",
        options: ["Fast", "Slow", "Lazy"],
        correct: 0,
      },
      {
        question: "'Big'의 반대말은?",
        options: ["Large", "Huge", "Small"],
        correct: 2,
      },
      {
        question: "'Intelligent'와 비슷한 의미는?",
        options: ["Stupid", "Smart", "Lazy"],
        correct: 1,
      },
      {
        question: "'Angry'의 동의어는?",
        options: ["Happy", "Mad", "Calm"],
        correct: 1,
      },
      {
        question: "'Start'의 동의어는?",
        options: ["End", "Begin", "Finish"],
        correct: 1,
      },
      {
        question: "'Rich'의 반대말은?",
        options: ["Wealthy", "Poor", "Famous"],
        correct: 1,
      },
      {
        question: "'Strong'의 반대말은?",
        options: ["Powerful", "Weak", "Healthy"],
        correct: 1,
      },
    ];

    for (let i = 0; i < vocabulary.length; i++) {
      const challenge = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: lesson4[0].id,
            type: "SELECT",
            question: vocabulary[i].question,
            order: i + 1,
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values(
        vocabulary[i].options.map((opt, idx) => ({
          challengeId: challenge[0].id,
          text: opt,
          correct: idx === vocabulary[i].correct,
        }))
      );
    }

    console.log("✅ 어휘 10문제 추가");

    console.log("🎉 총 30문제 데이터베이스 생성 완료!");
    console.log("📊 문법 15문제 + 어휘 10문제");

  } catch (error) {
    console.error("❌ 에러:", error);
    throw new Error("Database seeding failed");
  }
};

main();
