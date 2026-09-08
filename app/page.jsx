"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");

  const [posts, setPosts] = useState([
    {
      id: 1,
      category: "맛집",
      title: "우리 동네 숨은 맛집 추천합니다",
      content: "최근에 발견한 맛집인데 음식도 맛있고 분위기도 좋아요.",
      author: "동네주민",
      time: "10분 전",
      likes: 24,
      comments: 8,
      image: "🍜",
    },
    {
      id: 2,
      category: "생활정보",
      title: "이번 주말 주민센터 행사 안내",
      content: "이번 주말에 주민센터에서 다양한 행사가 열린다고 합니다.",
      author: "우리동네",
      time: "1시간 전",
      likes: 18,
      comments: 5,
      image: "🏘️",
    },
    {
      id: 3,
      category: "카페",
      title: "조용하게 공부하기 좋은 카페",
      content: "노트북 작업하기 좋은 카페를 찾았다면 여기 추천드려요.",
      author: "카페탐방",
      time: "2시간 전",
      likes: 31,
      comments: 12,
      image: "☕",
    },
    {
      id: 4,
      category: "행사",
      title: "우리 동네 플리마켓이 열립니다",
      content: "이번 토요일 오후에 주민 플리마켓이 열립니다.",
      author: "행사소식",
      time: "3시간 전",
      likes: 15,
      comments: 4,
      image: "🎪",
    },
  ]);

  const categories = [
    "전체",
    "맛집",
    "카페",
    "행사",
    "생활정보",
  ];

  const filteredPosts = posts.filter((post) => {
    const categoryMatch =
      category === "전체" || post.category === category;

    const searchMatch =
      search.trim() === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const handleLike = (id) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <main className="page">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <button
            className="logo"
            onClick={() => router.push("/")}
          >
            <div className="logo-icon">🏠</div>
            <span>우리동네 소식</span>
          </button>

          <nav className="nav">
            <button
              className="active"
              onClick={() => router.push("/")}
            >
              홈
            </button>

            <button onClick={() => router.push("/popular")}>
              인기 게시글
            </button>

            <button onClick={() => router.push("/bookmarks")}>
              북마크
            </button>

            <button onClick={() => router.push("/profile")}>
              프로필
            </button>
          </nav>

          <div className="header-buttons">
            <button
              className="login-button"
              onClick={() => router.push("/login")}
            >
              로그인
            </button>

            <button
              className="signup-button"
              onClick={() => router.push("/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">
            NEIGHBORHOOD COMMUNITY
          </p>

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
            onClick={() => router.push("/posts/new")}
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
            <h2>최근 게시글</h2>
          </div>

          <button
            className="more-button"
            onClick={() => router.push("/posts")}
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
            placeholder="우리 동네 소식을 검색해보세요"
          />
        </div>

        {/* CATEGORY */}
        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
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
        </div>

        {/* POSTS */}
        <div className="post-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                className="post-card"
                key={post.id}
              >
                <button
                  className="post-card-button"
                  onClick={() =>
                    router.push(`/posts/${post.id}`)
                  }
                >
                  <div className="post-image">
                    <span>{post.image}</span>

                    <div className="category-badge">
                      {post.category}
                    </div>
                  </div>

                  <div className="post-body">
                    <h3>{post.title}</h3>

                    <p className="post-content">
                      {post.content}
                    </p>

                    <div className="post-info">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.time}</span>
                    </div>

                    <div className="post-footer">
                      <span
                        className="like-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                      >
                        ♡ {post.likes}
                      </span>

                      <span>
                        💬 {post.comments}
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            ))
          ) : (
            <div className="empty">
              <div>🔍</div>
              <h3>검색 결과가 없습니다</h3>
              <p>
                다른 검색어나 카테고리를 선택해보세요.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <button
            className="logo"
            onClick={() => router.push("/")}
          >
            <div className="logo-icon">🏠</div>
            <span>우리동네 소식</span>
          </button>

          <p>
            우리 동네 사람들과 함께 만드는 따뜻한
            지역 커뮤니티
          </p>
        </div>
      </footer>
    </main>
  );
}