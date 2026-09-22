import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const neighborhood = searchParams.get("neighborhood");
    const search = searchParams.get("search") || searchParams.get("keyword");
    const sort = searchParams.get("sort") || "latest"; // 'latest' | 'popular'
    const authorId = searchParams.get("authorId");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query = {};

    if (category && category !== "전체") {
      query.category = category;
    }

    if (neighborhood && neighborhood !== "전체" && neighborhood !== "전체 동네") {
      query.neighborhood = neighborhood;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { content: regex }];
    }

    if (authorId) {
      query.authorId = authorId;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") {
      sortOption = { likeCount: -1, commentCount: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate("authorId", "nickname userId username neighborhood")
      .sort(sortOption)
      .limit(limit)
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      id: post._id.toString(),
      neighborhood: post.neighborhood || "역삼동",
      author: post.authorId
        ? {
            id: post.authorId._id?.toString(),
            nickname: post.authorId.nickname || "알 수 없음",
            userId: post.authorId.userId || post.authorId.username,
            neighborhood: post.authorId.neighborhood || "역삼동",
          }
        : { nickname: "알 수 없음" },
    }));

    return NextResponse.json(
      {
        success: true,
        posts: formattedPosts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "게시글을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, imageUrl, neighborhood } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "게시글 제목을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "게시글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { message: "카테고리를 선택해주세요." },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { message: "제목은 100자 이하로 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { message: "내용은 5000자 이하로 입력해주세요." },
        { status: 400 }
      );
    }

    // Determine neighborhood
    let postNeighborhood = neighborhood?.trim();
    if (!postNeighborhood) {
      const dbUser = await User.findById(user.userId).select("neighborhood");
      postNeighborhood = dbUser?.neighborhood || "역삼동";
    }

    const newPost = await Post.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      neighborhood: postNeighborhood,
      authorId: user.userId,
      imageUrl: imageUrl || "",
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate("authorId", "nickname userId username neighborhood")
      .lean();

    return NextResponse.json(
      {
        message: "게시글이 등록되었습니다.",
        post: {
          id: populatedPost._id.toString(),
          title: populatedPost.title,
          content: populatedPost.content,
          category: populatedPost.category,
          neighborhood: populatedPost.neighborhood,
          authorId: user.userId,
          author: {
            nickname: user.nickname,
            userId: user.loginId,
          },
          imageUrl: populatedPost.imageUrl,
          likeCount: populatedPost.likeCount,
          commentCount: populatedPost.commentCount,
          createdAt: populatedPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    return NextResponse.json(
      {
        message: "게시글 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}