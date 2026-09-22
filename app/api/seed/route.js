import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Like from "@/models/Like";

const SEED_USERS = [
  {
    userId: "resident_kim",
    username: "resident_kim",
    nickname: "동네보안관",
    neighborhood: "역삼동",
    password: "password123!",
  },
  {
    userId: "foodie_lee",
    username: "foodie_lee",
    nickname: "맛탐험가",
    neighborhood: "성수동",
    password: "password123!",
  },
  {
    userId: "cafe_lover",
    username: "cafe_lover",
    nickname: "카페요정",
    neighborhood: "망원동",
    password: "password123!",
  },
  {
    userId: "green_park",
    username: "green_park",
    nickname: "느티나무",
    neighborhood: "판교동",
    password: "password123!",
  },
];

const SEED_POSTS = [
  {
    category: "맛집",
    neighborhood: "역삼동",
    title: "골목길 30년 전통 손칼국수집 재오픈했습니다!",
    content: `동네 시장 안쪽 골목에 있던 할머니 손칼국수집이 리모델링 끝나고 오늘부터 다시 정상 영업하네요!\n\n국물이 여전히 진하고 겉절이 김치가 정말 예술입니다. 가격도 7,000원으로 착해요.\n점심시간에는 웨이팅이 조금 있으니 11시 30분 전이나 1시 이후에 가시는 것을 추천합니다!`,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    likeCount: 28,
  },
  {
    category: "카페",
    neighborhood: "성수동",
    title: "조용하고 햇살 잘 드는 작업하기 좋은 북카페 발견",
    content: `성수동 골목길 근처에 새로 생긴 작은 북카페에 다녀왔어요.\n\n각 테이블마다 콘센트도 넉넉하고 잔잔한 재즈 음악이 나와서 책 읽거나 노트북 작업하기 최고입니다.\n시그니처 바닐라 빈 라떼가 많이 달지 않고 고소해서 마음에 쏙 들었습니다.`,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    likeCount: 35,
  },
  {
    category: "행사",
    neighborhood: "망원동",
    title: "이번 주 토요일 망원 주민 나눔 플리마켓 & 버스킹",
    content: `이번 주 토요일(오후 1시~5시) 망원 근린공원 중앙광장에서 주민 자율 플리마켓이 열립니다!\n\n아이들 장난감, 도서, 핸드메이드 소품 등 다양한 물품이 나오고 오후 3시에는 청년 밴드 버스킹 공연도 예정되어 있어요. 가족들과 함께 가벼운 마음으로 나들이 오세요~`,
    imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
    likeCount: 42,
  },
  {
    category: "생활정보",
    neighborhood: "서초동",
    title: "동네 재활용 분리수거 요일 및 대형폐기물 간편 배출 팁",
    content: `최근 서초동 재활용 배출 요일이 화/목에서 월/수/금으로 변경되었습니다.\n\n그리고 대형 생활폐기물(가구, 가전 등)은 주민센터에 직접 가지 않고도 '빼기' 앱이나 구청 홈페이지에서 스티커 모바일 발급받아 부착 후 배출하면 훨씬 편리하니 참고하세요!`,
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    likeCount: 19,
  },
  {
    category: "맛집",
    neighborhood: "한남동",
    title: "한남동 베이커리 소금빵 나오는 시간 공유해요 (겉바속촉)",
    content: `매일 아침 11시, 오후 3시에 갓 구운 쌀소금빵이 나옵니다.\n\n버터 풍미가 진하고 겉은 바삭하면서 속은 쫄깃해서 갓 나왔을 때 먹으면 정말 맛있어요. 1인당 4개 구매 제한 있으니 시간 맞춰 가보세요!`,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    likeCount: 23,
  },
  {
    category: "생활정보",
    neighborhood: "판교동",
    title: "밤 10시 이후 공공 심야약국 위치 안내",
    content: `아이 키우시는 분들이나 늦은 밤 급하게 상비약 필요하신 분들께 유용한 정보입니다.\n\n판교역 2번 출구 앞 행복약국이 연중무휴 새벽 1시까지 공공 심야약국으로 운영 중입니다. 처방 조제도 가능하니 비상시에 유용하게 이용하세요.`,
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    likeCount: 31,
  },
];

export async function POST(request) {
  try {
    await connectDB();

    const existingCount = await Post.countDocuments();
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (existingCount > 0 && !force) {
      // If force is not set, still update existing posts to have neighborhood if missing
      await Post.updateMany(
        { neighborhood: { $exists: false } },
        { $set: { neighborhood: "역삼동" } }
      );
      return NextResponse.json({
        message: "이미 데이터가 존재합니다. (강제 재생성은 ?force=true 사용)",
        count: existingCount,
      });
    }

    if (force) {
      await Post.deleteMany({});
      await Comment.deleteMany({});
      await Like.deleteMany({});
    }

    // Upsert seed users
    const createdUsers = [];
    for (const u of SEED_USERS) {
      let user = await User.findOne({ userId: u.userId });
      if (!user) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        user = await User.create({
          userId: u.userId,
          username: u.username,
          password: hashedPassword,
          nickname: u.nickname,
          neighborhood: u.neighborhood,
        });
      } else {
        user.neighborhood = u.neighborhood;
        await user.save();
      }
      createdUsers.push(user);
    }

    // Insert posts
    const createdPosts = [];
    for (let i = 0; i < SEED_POSTS.length; i++) {
      const seedPost = SEED_POSTS[i];
      const author = createdUsers[i % createdUsers.length];

      const post = await Post.create({
        ...seedPost,
        authorId: author._id,
        createdAt: new Date(Date.now() - (SEED_POSTS.length - i) * 3600000),
        updatedAt: new Date(Date.now() - (SEED_POSTS.length - i) * 3600000),
      });

      // Add comments
      await Comment.create({
        postId: post._id,
        authorId: createdUsers[(i + 1) % createdUsers.length]._id,
        content: `좋은 정보 감사합니다! 우리 ${seedPost.neighborhood} 소식 많이 올려주세요 ㅎㅎ`,
        createdAt: new Date(post.createdAt.getTime() + 1800000),
      });

      await Post.findByIdAndUpdate(post._id, { commentCount: 1 });
      createdPosts.push(post);
    }

    return NextResponse.json(
      {
        message: "샘플 동네 소식 데이터가 성공적으로 생성되었습니다.",
        postCount: createdPosts.length,
        userCount: createdUsers.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("시드 데이터 생성 오류:", error);
    return NextResponse.json(
      { message: "시드 데이터 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
