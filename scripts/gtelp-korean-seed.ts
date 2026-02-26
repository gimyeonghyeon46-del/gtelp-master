import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🚀 G-TELP 한국어 해석 추가 데이터 입력 시작...");

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
        question: "She ___ to school every day.\n\n(그녀는 매일 학교에 ___)",
        options: ["go", "goes", "going"],
        correct: 1,
      },
      {
        question: "They ___ students.\n\n(그들은 학생 ___)",
        options: ["is", "am", "are"],
        correct: 2,
      },
      {
        question: "I ___ a book right now.\n\n(나는 지금 책을 읽고 ___)",
        options: ["read", "am reading", "reads"],
        correct: 1,
      },
      {
        question: "He ___ like coffee.\n\n(그는 커피를 좋아하지 ___)",
        options: ["don't", "doesn't", "isn't"],
        correct: 1,
      },
      {
        question: "___ you speak English?\n\n(당신은 영어를 ___ 니까?)",
        options: ["Does", "Do", "Are"],
        correct: 1,
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

    console.log("✅ 현재시제 5문제 추가 (한국어 해석 포함)");

    // 레슨 2: 과거시제
    const lesson2 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit1[0].id, title: "과거시제", order: 2 }])
      .returning();

    const grammarPast = [
      {
        question: "I ___ to Seoul yesterday.\n\n(나는 어제 서울에 ___)",
        options: ["go", "went", "gone"],
        correct: 1,
      },
      {
        question: "She ___ a movie last night.\n\n(그녀는 어젯밤 영화를 ___)",
        options: ["watch", "watched", "watching"],
        correct: 1,
      },
      {
        question: "They ___ happy yesterday.\n\n(그들은 어제 행복 ___)",
        options: ["was", "were", "are"],
        correct: 1,
      },
      {
        question: "He ___ eat breakfast this morning.\n\n(그는 오늘 아침 식사를 ___ 않았다)",
        options: ["don't", "didn't", "doesn't"],
        correct: 1,
      },
      {
        question: "___ you see him yesterday?\n\n(당신은 어제 그를 ___ 니까?)",
        options: ["Do", "Did", "Does"],
        correct: 1,
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

    console.log("✅ 과거시제 5문제 추가 (한국어 해석 포함)");

    // 레슨 3: 미래시제
    const lesson3 = await db
      .insert(schema.lessons)
      .values([{ unitId: unit1[0].id, title: "미래시제", order: 3 }])
      .returning();

    const grammarFuture = [
      {
        question: "I ___ visit my friend tomorrow.\n\n(나는 내일 친구를 방문할 ___)",
        options: ["will", "going", "am"],
        correct: 0,
      },
      {
        question: "She ___ be late for the meeting.\n\n(그녀는 회의에 늦을 ___)",
        options: ["will", "is", "was"],
        correct: 0,
      },
      {
        question: "They ___ to travel next month.\n\n(그들은 다음 달 여행을 ___ 것이다)",
        options: ["go", "are going", "went"],
        correct: 1,
      },
      {
        question: "We ___ study hard for the exam.\n\n(우리는 시험을 위해 열심히 공부할 ___)",
        options: ["will", "are", "did"],
        correct: 0,
      },
      {
        question: "___ you come to the party?\n\n(파티에 ___ 니까?)",
        options: ["Will", "Do", "Did"],
        correct: 0,
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

    console.log("✅ 미래시제 5문제 추가 (한국어 해석 포함)");

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
        options: ["Sad (슬픈)", "Joyful (기쁜)", "Angry (화난)"],
        correct: 1,
      },
      {
        question: "'Difficult'의 의미는?",
        options: ["쉬운", "어려운", "재미있는"],
        correct: 1,
      },
      {
        question: "'Beautiful'의 반대말은?",
        options: ["Pretty (예쁜)", "Ugly (못생긴)", "Nice (좋은)"],
        correct: 1,
      },
      {
        question: "'Quick'과 같은 의미는?",
        options: ["Fast (빠른)", "Slow (느린)", "Lazy (게으른)"],
        correct: 0,
      },
      {
        question: "'Big'의 반대말은?",
        options: ["Large (큰)", "Huge (거대한)", "Small (작은)"],
        correct: 2,
      },
      {
        question: "'Intelligent'와 비슷한 의미는?",
        options: ["Stupid (어리석은)", "Smart (똑똑한)", "Lazy (게으른)"],
        correct: 1,
      },
      {
        question: "'Angry'의 동의어는?",
        options: ["Happy (행복한)", "Mad (화난)", "Calm (차분한)"],
        correct: 1,
      },
      {
        question: "'Start'의 동의어는?",
        options: ["End (끝내다)", "Begin (시작하다)", "Finish (완료하다)"],
        correct: 1,
      },
      {
        question: "'Rich'의 반대말은?",
        options: ["Wealthy (부유한)", "Poor (가난한)", "Famous (유명한)"],
        correct: 1,
      },
      {
        question: "'Strong'의 반대말은?",
        options: ["Powerful (강한)", "Weak (약한)", "Healthy (건강한)"],
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

    console.log("✅ 어휘 10문제 추가 (한국어 해석 포함)");

    console.log("🎉 총 25문제 데이터베이스 생성 완료! (한국어 해석 포함)");
    console.log("📊 문법 15문제 + 어휘 10문제");

  } catch (error) {
    console.error("❌ 에러:", error);
    throw new Error("Database seeding failed");
  }
};

main();
