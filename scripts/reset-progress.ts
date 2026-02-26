import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🔄 사용자 진행 상태 초기화 중...");
    
    await db.delete(schema.userProgress);
    await db.delete(schema.challengeProgress);
    
    console.log("✅ 진행 상태 초기화 완료!");
    console.log("💡 이제 브라우저에서 새로고침 후 다시 시작하세요.");
  } catch (error) {
    console.error("❌ 에러:", error);
  }
};

main();
