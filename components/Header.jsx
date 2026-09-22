"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button
          className="logo"
          onClick={() => router.push("/")}
          type="button"
        >
          <div className="logo-icon">🏠</div>
          <span>우리동네 소식</span>
        </button>

        <nav className="nav">
          <button
            className={pathname === "/" ? "active" : ""}
            onClick={() => router.push("/")}
            type="button"
          >
            홈
          </button>

          <button
            className={pathname === "/posts" ? "active" : ""}
            onClick={() => router.push("/posts")}
            type="button"
          >
            동네 소식
          </button>

          <button
            className={pathname === "/popular" ? "active" : ""}
            onClick={() => router.push("/popular")}
            type="button"
          >
            인기 게시글
          </button>

          <button
            className={pathname === "/bookmarks" ? "active" : ""}
            onClick={() => router.push("/bookmarks")}
            type="button"
          >
            북마크
          </button>

          <button
            className={pathname === "/profile" ? "active" : ""}
            onClick={() => router.push("/profile")}
            type="button"
          >
            프로필
          </button>
        </nav>

        <div className="header-buttons">
          {!loading && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#2e7d32",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>👤</span>
                <span>{user.nickname}님</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="login-button"
                style={{
                  border: "1px solid #e0e0dc",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            </div>
          ) : !loading ? (
            <>
              <button
                className="login-button"
                onClick={() => router.push("/login")}
                type="button"
              >
                로그인
              </button>

              <button
                className="signup-button"
                onClick={() => router.push("/signup")}
                type="button"
              >
                회원가입
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
