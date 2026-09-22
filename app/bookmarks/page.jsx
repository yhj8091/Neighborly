"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

export default function BookmarksPage() {
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const res = await fetch("/api/bookmarks");
      const data = await res.json();

      if (res.ok) {
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error("북마크 조회 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <Header />

      <div className="content" style={{ minHeight: "80vh", paddingTop: "40px" }}>
        <div className="content-header">
          <div>
            <p className="section-label">SAVED POSTS</p>
            <h2>⭐ 내가 저장한 동네 소식</h2>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "6px" }}>
              나중에 찾아보고 싶어 스크랩해둔 유용한 동네 정보들입니다.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty">
            <div>⏳</div>
            <h3>북마크를 불러오는 중입니다...</h3>
          </div>
        ) : !isLoggedIn ? (
          <div className="empty">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h3>로그인이 필요한 서비스입니다</h3>
            <p>로그인하시면 관심 있는 동네 게시글을 북마크하고 언제든 확인할 수 있습니다.</p>
            <button
              type="button"
              className="write-button"
              style={{ marginTop: "24px" }}
              onClick={() => router.push("/login")}
            >
              로그인하기
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⭐</div>
            <h3>아직 저장한 소식이 없습니다</h3>
            <p>게시글 상세 페이지에서 ⭐ 북마크 버튼을 눌러 소식을 보관해보세요.</p>
            <button
              type="button"
              className="write-button"
              style={{ marginTop: "24px" }}
              onClick={() => router.push("/posts")}
            >
              동네 소식 둘러보기
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "20px", color: "#888", fontSize: "13px", fontWeight: 600 }}>
              총 {bookmarks.length}개의 저장된 소식
            </div>
            <div className="post-grid">
              {bookmarks.map((post) => (
                <PostCard key={post.id || post._id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
