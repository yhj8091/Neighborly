"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'bookmarks'
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      // Load my posts
      const postsRes = await fetch(`/api/posts?authorId=${userData.user.id}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setMyPosts(postsData.posts || []);
      }

      // Load my bookmarks
      const bRes = await fetch("/api/bookmarks");
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookmarks(bData.bookmarks || []);
      }
    } catch (err) {
      console.error("프로필 데이터 로드 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("정말 로그아웃하시겠습니까?");
    if (!confirmed) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="page">
      <Header />

      <div className="content" style={{ minHeight: "80vh", paddingTop: "40px" }}>
        {loading ? (
          <div className="empty">
            <div>⏳</div>
            <h3>프로필을 불러오는 중입니다...</h3>
          </div>
        ) : !user ? (
          <div className="empty">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
            <h3>로그인이 필요합니다</h3>
            <p>로그인하시면 내 활동 내역과 작성한 게시글을 확인할 수 있습니다.</p>
            <button
              type="button"
              className="write-button"
              style={{ marginTop: "24px" }}
              onClick={() => router.push("/login")}
            >
              로그인하기
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* User Profile Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                border: "1px solid #e8e8e4",
                padding: "36px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "#eaf3df",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                    }}
                  >
                    🏡
                  </div>

                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>
                      {user.nickname}
                    </h2>
                    <p style={{ color: "#777", fontSize: "14px" }}>
                      @{user.userId} · 가입일:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("ko-KR")
                        : "2026. 09"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "8px 18px",
                    border: "1px solid #e0e0dc",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#666",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  로그아웃
                </button>
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                  marginTop: "28px",
                  paddingTop: "24px",
                  borderTop: "1px solid #f0f0ed",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#75a566" }}>
                    {myPosts.length}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                    작성한 소식
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#2e7d32" }}>
                    {user.commentCount || 0}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                    작성한 댓글
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#f57c00" }}>
                    {bookmarks.length}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                    북마크 보관함
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                className={activeTab === "posts" ? "category active" : "category"}
                onClick={() => setActiveTab("posts")}
                style={{ fontSize: "14px", padding: "10px 20px" }}
              >
                내가 작성한 글 ({myPosts.length})
              </button>
              <button
                type="button"
                className={activeTab === "bookmarks" ? "category active" : "category"}
                onClick={() => setActiveTab("bookmarks")}
                style={{ fontSize: "14px", padding: "10px 20px" }}
              >
                저장한 북마크 ({bookmarks.length})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "posts" ? (
              myPosts.length === 0 ? (
                <div className="empty">
                  <div>✏️</div>
                  <h3>아직 작성한 동네 소식이 없습니다</h3>
                  <p>우리 동네 이웃들에게 알려주고 싶은 첫 소식을 적어보세요!</p>
                  <button
                    type="button"
                    className="write-button"
                    style={{ marginTop: "20px" }}
                    onClick={() => router.push("/posts/write")}
                  >
                    소식 작성하기
                  </button>
                </div>
              ) : (
                <div className="post-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  {myPosts.map((post) => (
                    <PostCard key={post.id || post._id} post={post} />
                  ))}
                </div>
              )
            ) : bookmarks.length === 0 ? (
              <div className="empty">
                <div>⭐</div>
                <h3>북마크한 소식이 없습니다</h3>
                <p>마음에 드는 글을 북마크하여 여기에 모아보세요.</p>
              </div>
            ) : (
              <div className="post-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {bookmarks.map((post) => (
                  <PostCard key={post.id || post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
