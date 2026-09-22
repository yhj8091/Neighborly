"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

const CATEGORIES = ["전체", "맛집", "카페", "행사", "생활정보"];

export default function Home() {
  const router = useRouter();

  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const catQuery = category !== "전체" ? `?category=${encodeURIComponent(category)}` : "";
      const res = await fetch(`/api/posts${catQuery}`);
      const data = await res.json();

      if (res.ok && data.posts) {
        if (data.posts.length === 0 && category === "전체") {
          // Auto-seed if database is completely empty on initial visit
          await fetch("/api/seed", { method: "POST" });
          const retryRes = await fetch("/api/posts");
          const retryData = await retryRes.json();
          setPosts(retryData.posts || []);
        } else {
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error("게시글 로드 오류:", err);
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">NEIGHBORHOOD COMMUNITY</p>

          <h1>
            우리 동네의
            <br />
            <span>새로운 소식</span>을 만나보세요
          </h1>

          <p className="hero-description">
            맛집, 카페, 행사부터 생활정보까지
            <br />
            동네 주민들과 유용한 정보를 함께 나눠보세요.
          </p>

          <button
            className="write-button"
            onClick={() => router.push("/posts/write")}
            type="button"
          >
            ✏️ 게시글 작성하기
          </button>
        </div>

        <div className="hero-image">
          <div className="house-card">
            <div className="sun">☀️</div>
            <div className="cloud cloud-one">☁️</div>
            <div className="cloud cloud-two">☁️</div>
            <div className="house">🏡</div>
            <div className="tree tree-one">🌳</div>
            <div className="tree tree-two">🌳</div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="content">
        <div className="content-header">
          <div>
            <p className="section-label">LOCAL POSTS</p>
            <h2>최근 동네 소식</h2>
          </div>

          <button
            className="more-button"
            onClick={() => router.push("/posts")}
            type="button"
          >
            전체보기 →
          </button>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="우리 동네 소식을 검색해보세요 (예: 맛집, 카페, 플리마켓)"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "14px",
                color: "#999",
                cursor: "pointer",
              }}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* CATEGORY */}
        <div className="categories">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {/* POSTS */}
        {loading ? (
          <div className="empty">
            <div>⏳</div>
            <h3>소식을 불러오는 중입니다...</h3>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="post-grid">
            {filteredPosts.slice(0, 8).map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div>🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 카테고리를 선택해보세요.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}