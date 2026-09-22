"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "로그인에 실패했습니다.");
        return;
      }

      alert(`${data.user.nickname}님, 환영합니다!`);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <button
          type="button"
          className="auth-logo"
          onClick={() => router.push("/")}
        >
          🏠
          <span>우리동네 소식</span>
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <h1>로그인</h1>
            <p>우리동네 소식에 오신 것을 환영합니다.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="userId">아이디</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="아이디를 입력해주세요"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="auth-footer">
            <span>아직 회원이 아니신가요?</span>
            <button
              type="button"
              onClick={() => router.push("/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}