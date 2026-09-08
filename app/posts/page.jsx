"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/posts");

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "게시글을 불러올 수 없습니다.");
        return;
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
      alert("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      post.content
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "전체" ||
      post.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="posts-page">
      <div className="posts-container">
        <header className="posts-header">
          <button
            className="logo-button"
            onClick={() => router.push("/")}
          >
            🏠 우리동네 소식
          </button>

          <button
            className="write-button"
            onClick={() => router.push("/posts/write")}
          >
            + 글쓰기
          </button>
        </header>

        <section className="posts-title">
          <h1>우리동네 소식</h1>
          <p>
            이웃들과 유용한 생활 정보를 공유해보세요.
          </p>
        </section>

        <section className="search-section">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="게시글을 검색해주세요"
          />

          <button onClick={loadPosts}>
            검색
          </button>
        </section>

        <section className="category-section">
          {[
            "전체",
            "맛집",
            "카페",
            "행사",
            "생활정보",
            "기타",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? "category active"
                  : "category"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </section>

        {loading ? (
          <div className="empty">
            게시글을 불러오는 중입니다...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty">
            검색 결과가 없습니다.
          </div>
        ) : (
          <section className="post-list">
            {filteredPosts.map((post) => (
              <button
                key={post._id}
                className="post-card"
                onClick={() =>
                  router.push(`/posts/${post._id}`)
                }
              >
                <div className="post-card-content">
                  <span className="post-category">
                    {post.category}
                  </span>

                  <h2>{post.title}</h2>

                  <p>
                    {post.content.length > 120
                      ? `${post.content.substring(0, 120)}...`
                      : post.content}
                  </p>

                  <div className="post-meta">
                    <span>
                      {post.author?.nickname || "알 수 없음"}
                    </span>

                    <span>
                      {new Date(
                        post.createdAt
                      ).toLocaleDateString("ko-KR")}
                    </span>

                    <span>
                      ❤️ {post.likeCount || 0}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}