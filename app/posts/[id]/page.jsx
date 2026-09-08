"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PostDetailPage() {
const params = useParams();
const router = useRouter();

const [post, setPost] = useState(null);
const [comments, setComments] = useState([]);
const [comment, setComment] = useState("");
const [loading, setLoading] = useState(true);
const [commentLoading, setCommentLoading] = useState(false);
const [likeLoading, setLikeLoading] = useState(false);
const [liked, setLiked] = useState(false);

useEffect(() => {
if (!params?.id) return;


loadPost();
loadComments();
loadLikeStatus();

}, [params?.id]);

// 게시글 불러오기
async function loadPost() {
try {
const response = await fetch(`/api/posts/${params.id}`);
const data = await response.json();


  if (!response.ok) {
    alert(data.message || "게시글을 불러올 수 없습니다.");
    router.push("/posts");
    return;
  }

  setPost(data.post);
} catch (error) {
  console.error("게시글 조회 오류:", error);
  alert("게시글을 불러오는 중 오류가 발생했습니다.");
} finally {
  setLoading(false);
}


}

// 댓글 불러오기
async function loadComments() {
try {
const response = await fetch(
`/api/comments?postId=${params.id}`
);

  const data = await response.json();

  if (response.ok) {
    setComments(data.comments || []);
  }
} catch (error) {
  console.error("댓글 조회 오류:", error);
}


}

// 좋아요 상태 확인
async function loadLikeStatus() {
try {
const response = await fetch(
`/api/posts/${params.id}/like`
);


  if (!response.ok) {
    return;
  }

  const data = await response.json();

  setLiked(Boolean(data.liked));
} catch (error) {
  console.error("좋아요 상태 조회 오류:", error);
}

}

// 좋아요
async function handleLike() {
if (likeLoading) return;


setLikeLoading(true);

try {
  const response = await fetch(
    `/api/posts/${params.id}/like`,
    {
      method: liked ? "DELETE" : "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "좋아요 처리에 실패했습니다.");
    return;
  }

  setLiked(Boolean(data.liked));

  setPost((currentPost) => ({
    ...currentPost,
    likeCount: data.likeCount ?? currentPost.likeCount ?? 0,
  }));
} catch (error) {
  console.error("좋아요 오류:", error);
  alert("좋아요 처리 중 오류가 발생했습니다.");
} finally {
  setLikeLoading(false);
}


}

// 댓글 작성
async function handleCommentSubmit(event) {
event.preventDefault();


if (!comment.trim()) {
  alert("댓글 내용을 입력해주세요.");
  return;
}

if (comment.trim().length > 500) {
  alert("댓글은 500자 이하로 작성해주세요.");
  return;
}

setCommentLoading(true);

try {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postId: params.id,
      content: comment.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "댓글 작성에 실패했습니다.");
    return;
  }

  setComment("");

  await loadComments();
} catch (error) {
  console.error("댓글 작성 오류:", error);
  alert("댓글 작성 중 오류가 발생했습니다.");
} finally {
  setCommentLoading(false);
}


}

// 댓글 삭제
async function handleCommentDelete(commentId) {
const confirmed = window.confirm(
"정말 이 댓글을 삭제하시겠습니까?"
);


if (!confirmed) return;

try {
  const response = await fetch(
    `/api/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "댓글 삭제에 실패했습니다.");
    return;
  }

  await loadComments();
} catch (error) {
  console.error("댓글 삭제 오류:", error);
  alert("댓글 삭제 중 오류가 발생했습니다.");
}


}

// 게시글 수정
function handleEdit() {
router.push(`/posts/${params.id}/edit`);
}

// 게시글 삭제
async function handleDelete() {
const confirmed = window.confirm(
"정말 이 게시글을 삭제하시겠습니까?"
);


if (!confirmed) return;

try {
  const response = await fetch(
    `/api/posts/${params.id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "게시글 삭제에 실패했습니다.");
    return;
  }

  alert("게시글이 삭제되었습니다.");
  router.push("/posts");
} catch (error) {
  console.error("게시글 삭제 오류:", error);
  alert("게시글 삭제 중 오류가 발생했습니다.");
}


}

// 로딩 화면
if (loading) {
return ( <main className="post-detail-page"> <div className="post-detail-container"> <p>게시글을 불러오는 중입니다...</p> </div> </main>
);
}

// 게시글 없음
if (!post) {
return ( <main className="post-detail-page"> <div className="post-detail-container"> <h1>게시글을 찾을 수 없습니다.</h1>

```
      <button
        type="button"
        onClick={() => router.push("/posts")}
      >
        목록으로 돌아가기
      </button>
    </div>
  </main>
);

}

return ( <main className="post-detail-page"> <div className="post-detail-container">


    <button
      type="button"
      className="back-button"
      onClick={() => router.push("/posts")}
    >
      ← 게시글 목록
    </button>

    <article className="post-detail-card">

      <div className="post-detail-top">
        <span className="post-category">
          {post.category || "생활정보"}
        </span>

        <div className="post-manage-buttons">
          <button
            type="button"
            onClick={handleEdit}
          >
            수정
          </button>

          <button
            type="button"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      </div>

      <h1 className="post-title">
        {post.title}
      </h1>

      <div className="post-author-info">

        <strong>
          {post.author?.nickname ||
            post.author?.username ||
            "익명"}
        </strong>

        <span>·</span>

        <span>
          {post.createdAt
            ? new Date(
                post.createdAt
              ).toLocaleString("ko-KR")
            : ""}
        </span>

      </div>

      {post.imageUrl && (
        <div className="post-detail-image">
          <img
            src={post.imageUrl}
            alt={post.title}
          />
        </div>
      )}

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-actions">

        <button
          type="button"
          className={`like-button ${
            liked ? "liked" : ""
          }`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          {liked ? "❤️" : "🤍"}{" "}
          좋아요 {post.likeCount || 0}
        </button>

      </div>

    </article>

    <section className="comment-section">

      <div className="comment-title">
        <h2>
          댓글 {comments.length}
        </h2>
      </div>

      <form
        className="comment-form"
        onSubmit={handleCommentSubmit}
      >

        <textarea
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          placeholder="댓글을 입력해주세요."
          rows={4}
          maxLength={500}
        />

        <div className="comment-form-bottom">

          <span>
            {comment.length}/500
          </span>

          <button
            type="submit"
            disabled={commentLoading}
          >
            {commentLoading
              ? "등록 중..."
              : "댓글 등록"}
          </button>

        </div>

      </form>

      <div className="comment-list">

        {comments.length === 0 ? (
          <div className="no-comments">
            아직 작성된 댓글이 없습니다.
          </div>
        ) : (
          comments.map((item) => (
            <div
              className="comment-item"
              key={item._id}
            >

              <div className="comment-header">

                <strong>
                  {item.author?.nickname ||
                    item.author?.username ||
                    "익명"}
                </strong>

                <span>
                  {item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString("ko-KR")
                    : ""}
                </span>

              </div>

              <p className="comment-content">
                {item.content}
              </p>

              <button
                type="button"
                className="comment-delete-button"
                onClick={() =>
                  handleCommentDelete(item._id)
                }
              >
                삭제
              </button>

            </div>
          ))
        )}

      </div>

    </section>

  </div>
</main>

);
}
