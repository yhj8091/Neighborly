"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

const CATEGORIES = ["전체", "맛집", "카페", "행사", "생활정보", "기타"];

export default function PostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("latest"); // 'latest' | 'popular'

  useEffect(() => {
    loadPosts();
  }, [category, sort]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "전체") params.append("category", category);
      if (sort === "popular") params.append("sort", "popular");

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("게시글 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="page">
      <Header />

      <div className="content" style={{ minHeight: "80vh", paddingTop: "40px" }}>
        <div className="content-header">
          <div>
            <p className="section-label">COMMUNITY BOARD</p>
            <h2>우리동네 소식 나눔터</h2>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "6px" }}>
              동네 이웃들이 전하는 생생한 소식과 유용한 꿀팁을 확인하세요.
            </p>
          </div>

          <button
            className="write-button"
            style={{ marginTop: 0 }}
            onClick={() => router.push("/posts/write")}
            type="button"
          >
            ✏️ 글쓰기
          </button>
        </div>

        {/* Search & Sort */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div className="search-box" style={{ flex: 1, minWidth: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목이나 내용으로 검색해보세요"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "transparent", border: "none", color: "#999", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              className={sort === "latest" ? "category active" : "category"}
              style={{ margin: 0 }}
              onClick={() => setSort("latest")}
            >
              최신순
            </button>
            <button
              type="button"
              className={sort === "popular" ? "category active" : "category"}
              style={{ margin: 0 }}
              onClick={() => setSort("popular")}
            >
              인기순
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="categories" style={{ marginTop: "10px", marginBottom: "30px" }}>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Posts Count */}
        <div style={{ marginBottom: "16px", color: "#888", fontSize: "13px", fontWeight: 600 }}>
          총 {filteredPosts.length}개의 소식
        </div>

        {/* List */}
        {loading ? (
          <div className="empty">
            <div>⏳</div>
            <h3>소식을 불러오는 중입니다...</h3>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty">
            <div>🔍</div>
            <h3>등록된 게시글이 없습니다</h3>
            <p>첫 번째 동네 소식을 등록해보세요!</p>
            <button
              type="button"
              className="write-button"
              style={{ marginTop: "20px" }}
              onClick={() => router.push("/posts/write")}
            >
              첫 글 작성하기
            </button>
          </div>
        ) : (
          <div className="post-grid">
            {filteredPosts.map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}