import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function getUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request, { params }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "올바르지 않은 게시글 ID입니다.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");

    const postId = new ObjectId(id);
    const userId = new ObjectId(user.userId);

    const post = await db.collection("Post").findOne({
      _id: postId,
    });

    if (!post) {
      return NextResponse.json(
        {
          message: "존재하지 않는 게시글입니다.",
        },
        { status: 404 }
      );
    }

    const existingLike = await db.collection("Like").findOne({
      postId,
      userId,
    });

    if (existingLike) {
      return NextResponse.json(
        {
          message: "이미 좋아요를 누른 게시글입니다.",
          liked: true,
          likeCount: post.likeCount || 0,
        },
        { status: 200 }
      );
    }

    await db.collection("Like").insertOne({
      postId,
      userId,
      createdAt: new Date(),
    });

    const result = await db.collection("Post").findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: {
          likeCount: 1,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return NextResponse.json(
      {
        message: "좋아요를 눌렀습니다.",
        liked: true,
        likeCount: result?.likeCount || 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("좋아요 처리 오류:", error);

    return NextResponse.json(
      {
        message: "좋아요 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "올바르지 않은 게시글 ID입니다.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");

    const postId = new ObjectId(id);
    const userId = new ObjectId(user.userId);

    const like = await db.collection("Like").findOne({
      postId,
      userId,
    });

    if (!like) {
      return NextResponse.json(
        {
          message: "좋아요를 누르지 않은 게시글입니다.",
          liked: false,
        },
        { status: 200 }
      );
    }

    await db.collection("Like").deleteOne({
      _id: like._id,
    });

    const result = await db.collection("Post").findOneAndUpdate(
      {
        _id: postId,
        likeCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          likeCount: -1,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return NextResponse.json(
      {
        message: "좋아요를 취소했습니다.",
        liked: false,
        likeCount: result?.likeCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("좋아요 취소 오류:", error);

    return NextResponse.json(
      {
        message: "좋아요 취소 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}