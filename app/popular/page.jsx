"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

const CATEGORIES = ["전체", "맛집", "카페", "행사", "생활정보"];

export default function PopularPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    loadPopularPosts();
  }, [category]);

  const loadPopularPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: "popular" });
      if (category !== "전체") params.append("category", category);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("인기 게시글 로드 오류:", err);
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
            <p className="section-label">HOT & TRENDING</p>
            <h2>🔥 우리동네 인기 소식</h2>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "6px" }}>
              이웃들의 많은 공감과 따뜻한 반응을 얻은 베스트 게시글입니다.
            </p>
          </div>
        </div>

        {/* Category Pills */}
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

        {/* List */}
        {loading ? (
          <div className="empty">
            <div>⏳</div>
            <h3>인기 소식을 선별하는 중입니다...</h3>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty">
            <div>🔥</div>
            <h3>아직 인기 게시글이 없습니다</h3>
            <p>동네 소식에 좋아요를 눌러 인기 글로 만들어보세요!</p>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map((post, idx) => (
              <PostCard
                key={post.id || post._id}
                post={post}
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
