"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("맛집");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    alert("게시글이 등록되었습니다.");

    router.push("/posts");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-green-600">
            우리동네 소식
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">게시글 작성</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium">
            카테고리
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-lg border px-4 py-3"
          >
            <option>맛집</option>
            <option>카페</option>
            <option>행사</option>
            <option>생활정보</option>
          </select>

          <label className="mt-6 block text-sm font-medium">
            제목
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력해주세요."
            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-green-500"
          />

          <label className="mt-6 block text-sm font-medium">
            내용
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="동네 주민들에게 공유하고 싶은 내용을 작성해주세요."
            rows={10}
            className="mt-2 w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-green-500"
          />

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/posts"
              className="rounded-lg border px-5 py-3"
            >
              취소
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
            >
              게시글 등록
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}