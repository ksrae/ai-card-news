import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY,
  baseURL: "https://api.upstage.ai/v1"
});

const DAILY_LIMIT = 3;

// Get Korea timezone start/end of today
function getKoreaTodayRange() {
  const now = new Date();
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaTime = new Date(now.getTime() + koreaOffset);

  const startOfDay = new Date(koreaTime);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(koreaTime);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return {
    start: new Date(startOfDay.getTime() - koreaOffset),
    end: new Date(endOfDay.getTime() - koreaOffset)
  };
}

export async function POST(req: Request) {
  const { content, type } = await req.json();

  // Check daily limit
  const { start, end } = getKoreaTodayRange();
  const todayCount = await prisma.contents.count({
    where: {
      created_at: {
        gte: start,
        lte: end
      }
    }
  });

  if (todayCount >= DAILY_LIMIT) {
    return NextResponse.json({
      error: "오늘의 등록 한도(3개)를 초과했습니다. 내일 다시 시도해주세요."
    }, { status: 429 });
  }

  const sourceText = content;

  try {
    const [cardResponse, articleResponse] = await Promise.all([
      // 1. Generate Card News
      openai.chat.completions.create({
        model: "solar-pro",
        messages: [
          {
            role: "system",
            content: `당신은 전문 콘텐츠 에디터입니다. 결과는 반드시 한국어로 작성하고, 올바른 JSON 포맷으로만 답변하세요. 구조:
            {
              "card_news": [
                { "slide_no": 1, "headline": "...", "description": "..." }
              ]
            }
            입력 내용을 바탕으로 5~7장의 카드뉴스를 만들어주세요.`
          },
          { role: "user", content: `다음 내용을 카드뉴스로 요약해줘: ${sourceText}` }
        ],
        response_format: { type: "json_object" },
        // @ts-ignore
        reasoning_effort: "low"
      } as any),
      // 2. Generate Full Article
      openai.chat.completions.create({
        model: "solar-pro",
        messages: [
          {
            role: "system",
            content: `당신은 IT/비즈니스 전문 블로거입니다. 결과는 반드시 한국어로 작성하고, 올바른 JSON 포맷으로만 답변하세요.

중요: 상세 아티클의 sections에는 카드뉴스의 모든 슬라이드 내용이 반드시 포함되어야 합니다. 카드뉴스에서 다룬 모든 핵심 포인트를 빠짐없이 상세하게 설명해주세요.

구조:
            {
              "article": {
                "title": "...",
                "meta_description": "...",
                "category": "IT/비즈니스/뉴스/기타",
                "sections": [
                  { "sub_title": "...", "content": "..." }
                ],
                "tags": ["..."]
              }
            }`
          },
          { role: "user", content: `다음 내용을 상세 블로그 아티클로 재구성해줘. 모든 핵심 내용을 빠짐없이 포함해야 해: ${sourceText}` }
        ],
        response_format: { type: "json_object" },
        // @ts-ignore
        reasoning_effort: "low"
      } as any)
    ]);

    const cardContentStr = cardResponse.choices[0].message.content || "{}";
    const articleContentStr = articleResponse.choices[0].message.content || "{}";

    let cardData, articleData;
    try {
      cardData = JSON.parse(cardContentStr).card_news || [];
      articleData = JSON.parse(articleContentStr).article || {};
    } catch (e) {
      console.error("JSON Parse Error", e);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Extract tags from article
    const tagNames: string[] = articleData.tags || [];

    // Create or find tags
    const tagRecords = await Promise.all(
      tagNames.map(async (name: string) => {
        const normalizedName = name.trim().toLowerCase();
        return prisma.tags.upsert({
          where: { name: normalizedName },
          update: {},
          create: { name: normalizedName }
        });
      })
    );

    // Save to Database
    const savedContent = await prisma.contents.create({
      data: {
        title: articleData.title || "Untitled",
        original_url: type === 'url' ? content : "",
        raw_text: type === 'text' ? content : "",
        full_article: articleData,
        thumbnail_url: "",
        category: articleData.category || "General",
        status: "PUBLISHED",
        card_slides: {
          create: cardData.map((slide: any, index: number) => ({
            slide_order: slide.slide_no || index + 1,
            headline: slide.headline || "",
            description: slide.description || "",
            image_url: ""
          }))
        },
        tags: {
          create: tagRecords.map(tag => ({
            tag_id: tag.id
          }))
        }
      }
    });

    return NextResponse.json({
      success: true,
      id: savedContent.id,
      message: "Content generated and saved successfully"
    });

  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "AI Generation Failed" }, { status: 500 });
  }
}
