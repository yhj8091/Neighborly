"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WritePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("생활정보");
  const [loading, setLoading] = useState(false);

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

    if (!category) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "게시글 등록에 실패했습니다.");
        return;
      }

      alert("게시글이 등록되었습니다.");

      router.push(`/posts/${data.post.id}`);
      router.refresh();
    } catch (error) {
      console.error("게시글 등록 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="write-page">
      <div className="write-container">
        <button
          type="button"
          className="back-button"
          onClick={() => router.back()}
        >
          ← 돌아가기
        </button>

        <div className="write-card">
          <div className="write-header">
            <h1>게시글 작성</h1>
            <p>
              우리 동네에 유용한 정보를 공유해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category">
                카테고리
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="맛집">맛집</option>
                <option value="카페">카페</option>
                <option value="행사">행사</option>
                <option value="생활정보">생활정보</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">
                제목
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력해주세요"
                maxLength={100}
              />

              <small>
                {title.length} / 100
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="content">
                내용
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="동네 주민들에게 알려주고 싶은 내용을 작성해주세요."
                maxLength={5000}
                rows={12}
              />

              <small>
                {content.length} / 5000
              </small>
            </div>

            <div className="form-group">
              <label>
                사진
              </label>

              <div className="image-upload">
                📷 사진 첨부
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "등록 중..." : "게시글 등록"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}