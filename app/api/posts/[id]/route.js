import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
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

    const posts = await db
      .collection("Post")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
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
            title: 1,
            content: 1,
            category: 1,
            imageUrl: 1,
            likeCount: 1,
            createdAt: 1,
            updatedAt: 1,
            authorId: 1,
            "author.nickname": 1,
          },
        },
      ])
      .toArray();

    if (posts.length === 0) {
      return NextResponse.json(
        {
          message: "게시글을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        post: posts[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 상세 조회 오류:", error);

    return NextResponse.json(
      {
        message: "게시글을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}