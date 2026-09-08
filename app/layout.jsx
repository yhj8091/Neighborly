import "./globals.css";

export const metadata = {
  title: "우리동네 소식",
  description: "동네 사람들이 유용한 생활 정보를 공유하는 지역 커뮤니티",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}