"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (userId.trim().length < 3 || userId.trim().length > 20) {
      alert("아이디는 3~20자로 입력해주세요.");
      return;
    }

    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      alert("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    if (!passwordConfirm.trim()) {
      alert("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
          nickname: nickname.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "회원가입에 실패했습니다.");
        return;
      }

      alert("회원가입이 완료되었습니다! 로그인되었습니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("회원가입 오류:", error);
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
            <h1>회원가입</h1>
            <p>우리동네 소식의 새로운 이웃이 되어주세요.</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="userId">아이디</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="3~20자의 아이디를 입력해주세요"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nickname">닉네임</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력해주세요"
                autoComplete="nickname"
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
                placeholder="6자 이상 입력해주세요"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="auth-footer">
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              onClick={() => router.push("/login")}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
