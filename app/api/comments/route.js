import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function getUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json(
        {
          message: "올바른 게시글 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");

    const comments = await db
      .collection("Comment")
      .aggregate([
        {
          $match: {
            postId: new ObjectId(postId),
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            postId: 1,
            authorId: 1,
            content: 1,
            createdAt: 1,
            "author.nickname": 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(
      {
        comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("댓글 조회 오류:", error);

    return NextResponse.json(
      {
        message: "댓글을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const body = await request.json();

    const { postId, content } = body;

    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json(
        {
          message: "올바른 게시글 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          message: "댓글 내용을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        {
          message: "댓글은 500자 이하로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");

    const post = await db.collection("Post").findOne({
      _id: new ObjectId(postId),
    });

    if (!post) {
      return NextResponse.json(
        {
          message: "존재하지 않는 게시글입니다.",
        },
        { status: 404 }
      );
    }

    const commentData = {
      postId: new ObjectId(postId),
      authorId: new ObjectId(user.userId),
      content: content.trim(),
      createdAt: new Date(),
    };

    const result = await db
      .collection("Comment")
      .insertOne(commentData);

    return NextResponse.json(
      {
        message: "댓글이 등록되었습니다.",
        comment: {
          id: result.insertedId.toString(),
          postId: postId,
          authorId: user.userId,
          content: commentData.content,
          createdAt: commentData.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("댓글 작성 오류:", error);

    return NextResponse.json(
      {
        message: "댓글 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}