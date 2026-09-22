"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("생활정보");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    loadPost();
  }, [params?.id]);

  const loadPost = async () => {
    try {
      const [postRes, userRes] = await Promise.all([
        fetch(`/api/posts/${params.id}`),
        fetch("/api/auth/me"),
      ]);

      if (!userRes.ok) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/login");
        return;
      }

      const userData = await userRes.json();
      const postData = await postRes.json();

      if (!postRes.ok) {
        alert(postData.message || "게시글을 찾을 수 없습니다.");
        router.push("/posts");
        return;
      }

      const post = postData.post;

      // Check author permission
      const isAuthor =
        userData.user.id === post.authorId ||
        userData.user.userId === post.authorId ||
        userData.user.id === post.author?.id;

      if (!isAuthor) {
        alert("게시글 수정 권한이 없습니다.");
        router.push(`/posts/${params.id}`);
        return;
      }

      setTitle(post.title || "");
      setContent(post.content || "");
      setCategory(post.category || "생활정보");
      setImageUrl(post.imageUrl || "");
    } catch (error) {
      console.error("게시글 로드 오류:", error);
      alert("게시글 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          imageUrl: imageUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "게시글 수정에 실패했습니다.");
        return;
      }

      alert("게시글이 성공적으로 수정되었습니다.");
      router.push(`/posts/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <Header />
        <div style={{ maxWidth: "720px", margin: "100px auto", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p style={{ color: "#777" }}>게시글을 불러오는 중입니다...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="page">
      <Header />

      <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 20px" }}>
        <button
          type="button"
          className="back-button"
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#666" }}
        >
          ← 이전으로
        </button>

        <div className="auth-card" style={{ maxWidth: "100%", padding: "36px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>
              게시글 수정하기
            </h1>
            <p style={{ color: "#777", fontSize: "14px" }}>
              내용을 수정한 후 수정 완료 버튼을 눌러주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category">카테고리</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "0 15px",
                  border: "1px solid #deded9",
                  borderRadius: "9px",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="맛집">🍜 맛집</option>
                <option value="카페">☕ 카페</option>
                <option value="행사">🎪 행사</option>
                <option value="생활정보">🏘️ 생활정보</option>
                <option value="기타">📌 기타</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label htmlFor="title">제목</label>
                <span style={{ fontSize: "12px", color: "#999" }}>{title.length}/100</span>
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력해주세요"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label htmlFor="content">내용</label>
                <span style={{ fontSize: "12px", color: "#999" }}>{content.length}/5000</span>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="동네 이웃들에게 알려주고 싶은 내용을 적어보세요."
                maxLength={5000}
                rows={10}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "1px solid #deded9",
                  borderRadius: "9px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">대표 사진 URL</label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="사진 이미지 URL을 입력하세요"
              />

              {imageUrl && (
                <div style={{ marginTop: "14px", borderRadius: "10px", overflow: "hidden", height: "180px" }}>
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1,
                  height: "52px",
                  border: "1px solid #deded9",
                  borderRadius: "9px",
                  background: "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                취소
              </button>

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
                style={{ flex: 2, margin: 0 }}
              >
                {submitting ? "수정 저장 중..." : "수정 완료"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
