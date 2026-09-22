"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    loadData();
  }, [params?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPost(),
        loadComments(),
        loadCurrentUserAndStatus(),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "게시글을 불러올 수 없습니다.");
        router.push("/posts");
        return;
      }

      setPost(data.post);
      setLikeCount(data.post?.likeCount || 0);
    } catch (error) {
      console.error("게시글 조회 오류:", error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("댓글 조회 오류:", error);
    }
  };

  const loadCurrentUserAndStatus = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user);

        // Load like status
        const likeRes = await fetch(`/api/posts/${params.id}/like`);
        if (likeRes.ok) {
          const likeData = await likeRes.json();
          setLiked(Boolean(likeData.liked));
        }

        // Load bookmark status
        const bookmarkRes = await fetch(`/api/posts/${params.id}/bookmark`);
        if (bookmarkRes.ok) {
          const bData = await bookmarkRes.json();
          setBookmarked(Boolean(bData.bookmarked));
        }
      }
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return;
    if (!currentUser) {
      alert("좋아요 기능은 로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setLikeLoading(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/like`, {
        method: liked ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "좋아요 처리에 실패했습니다.");
        return;
      }

      setLiked(Boolean(data.liked));
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("좋아요 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
    if (!currentUser) {
      alert("북마크 기능은 로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "북마크 처리에 실패했습니다.");
        return;
      }

      setBookmarked(Boolean(data.bookmarked));
      alert(data.message);
    } catch (error) {
      console.error("북마크 오류:", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert("댓글 작성은 로그인이 필요합니다.");
      router.push("/login");
      return;
    }

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
  };

  const handleCommentDelete = async (commentId) => {
    const confirmed = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

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
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "정말 이 게시글을 삭제하시겠습니까? 삭제된 글과 댓글은 복구할 수 없습니다."
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: "DELETE",
      });

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
  };

  // Check if logged in user is the post author
  const isAuthor = Boolean(
    currentUser &&
      post &&
      (currentUser.id === post.authorId ||
        currentUser.userId === post.authorId ||
        currentUser.id === post.author?.id)
  );

  if (loading) {
    return (
      <main className="page">
        <Header />
        <div style={{ maxWidth: "800px", margin: "100px auto", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p style={{ color: "#777" }}>게시글을 불러오는 중입니다...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="page">
        <Header />
        <div style={{ maxWidth: "800px", margin: "100px auto", textAlign: "center" }}>
          <h2>게시글을 찾을 수 없습니다.</h2>
          <button
            type="button"
            className="write-button"
            style={{ marginTop: "20px" }}
            onClick={() => router.push("/posts")}
          >
            목록으로 돌아가기
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="page">
      <Header />

      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        <button
          type="button"
          className="back-button"
          onClick={() => router.push("/posts")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#666" }}
        >
          ← 목록으로 돌아가기
        </button>

        {/* Post Card */}
        <article
          style={{
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #e8e8e4",
            padding: "36px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span className="post-category" style={{ fontSize: "13px", fontWeight: 700 }}>
              {post.category || "생활정보"}
            </span>

            {isAuthor && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/posts/${params.id}/edit`)}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #ffcdd2",
                    borderRadius: "8px",
                    background: "#ffebee",
                    color: "#c62828",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.3, marginBottom: "14px" }}>
            {post.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#777",
              fontSize: "14px",
              paddingBottom: "20px",
              borderBottom: "1px solid #f0f0ed",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontWeight: 700, color: "#333" }}>
              {post.author?.nickname || "익명"}
            </span>
            <span>·</span>
            <span>
              {post.createdAt ? new Date(post.createdAt).toLocaleString("ko-KR") : ""}
            </span>
            {post.views !== undefined && (
              <>
                <span>·</span>
                <span>조회 {post.views}</span>
              </>
            )}
          </div>

          {post.imageUrl && (
            <div
              style={{
                marginBottom: "24px",
                borderRadius: "14px",
                overflow: "hidden",
                maxHeight: "450px",
              }}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}

          <div
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              color: "#333",
              minHeight: "120px",
            }}
          >
            {post.content}
          </div>

          {/* Action Buttons: Like & Bookmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid #f0f0ed",
            }}
          >
            <button
              type="button"
              onClick={handleLike}
              disabled={likeLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "24px",
                border: liked ? "2px solid #e53935" : "1px solid #deded9",
                background: liked ? "#ffebee" : "#fff",
                color: liked ? "#c62828" : "#444",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>좋아요 {likeCount}</span>
            </button>

            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "24px",
                border: bookmarked ? "2px solid #75a566" : "1px solid #deded9",
                background: bookmarked ? "#eef7e9" : "#fff",
                color: bookmarked ? "#2e7d32" : "#444",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span>{bookmarked ? "⭐" : "☆"}</span>
              <span>{bookmarked ? "북마크됨" : "북마크"}</span>
            </button>
          </div>
        </article>

        {/* Comment Section */}
        <section
          style={{
            marginTop: "30px",
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #e8e8e4",
            padding: "36px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>
            댓글 💬 {comments.length}
          </h2>

          <form onSubmit={handleCommentSubmit} style={{ marginBottom: "30px" }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                currentUser
                  ? "동네 이웃과 따뜻한 댓글로 소통해보세요."
                  : "댓글을 작성하려면 먼저 로그인해주세요."
              }
              rows={4}
              maxLength={500}
              style={{
                width: "100%",
                padding: "15px",
                border: "1px solid #deded9",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#999" }}>
                {comment.length}/500
              </span>

              <button
                type="submit"
                disabled={commentLoading || !currentUser}
                className="auth-submit"
                style={{
                  width: "auto",
                  padding: "10px 24px",
                  height: "44px",
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                {commentLoading ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </div>
            ) : (
              comments.map((item) => {
                const isCommentAuthor = Boolean(
                  currentUser &&
                    (currentUser.id === item.authorId ||
                      currentUser.userId === item.authorId ||
                      currentUser.id === item.author?.id)
                );

                return (
                  <div
                    key={item.id || item._id}
                    style={{
                      padding: "16px",
                      background: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #f0f0ed",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "#333" }}>
                          {item.author?.nickname || "익명"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#999" }}>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("ko-KR")
                            : ""}
                        </span>
                      </div>

                      {isCommentAuthor && (
                        <button
                          type="button"
                          onClick={() => handleCommentDelete(item.id || item._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#c62828",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: "14px", color: "#444", whiteSpace: "pre-wrap" }}>
                      {item.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
