"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <button
          className="logo"
          onClick={() => router.push("/")}
          type="button"
        >
          <div className="logo-icon">🏠</div>
          <span>우리동네 소식</span>
        </button>

        <p>우리 동네 사람들과 함께 만드는 따뜻한 지역 커뮤니티</p>
      </div>
    </footer>
  );
}
