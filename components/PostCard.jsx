"use client";

import { useRouter } from "next/navigation";

const CATEGORY_ICONS = {
  맛집: "🍜",
  카페: "☕",
  행사: "🎪",
  생활정보: "🏘️",
  기타: "📌",
};

export function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

export default function PostCard({ post, rank }) {
  const router = useRouter();
  const id = post.id || post._id;

  const defaultIcon = CATEGORY_ICONS[post.category] || "🏡";

  return (
    <article className="post-card">
      <button
        className="post-card-button"
        onClick={() => router.push(`/posts/${id}`)}
        type="button"
      >
        <div className="post-image" style={{ position: "relative" }}>
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "block";
              }}
            />
          ) : null}

          <span
            style={{
              display: post.imageUrl ? "none" : "block",
              fontSize: "65px",
            }}
          >
            {defaultIcon}
          </span>

          <div className="category-badge">{post.category}</div>

          {rank !== undefined && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background:
                  rank === 1
                    ? "#ffd700"
                    : rank === 2
                    ? "#c0c0c0"
                    : rank === 3
                    ? "#cd7f32"
                    : "rgba(0,0,0,0.6)",
                color: rank <= 3 ? "#222" : "#fff",
                fontWeight: 800,
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              {rank === 1 ? "🥇 1위" : rank === 2 ? "🥈 2위" : rank === 3 ? "🥉 3위" : `${rank}위`}
            </div>
          )}
        </div>

        <div className="post-body">
          <h3>{post.title}</h3>

          <p className="post-content">{post.content}</p>

          <div className="post-info">
            <span>
              {post.author?.nickname ||
                post.author?.username ||
                "동네주민"}
            </span>
            <span>·</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>

          <div className="post-footer">
            <span style={{ color: "#e53935" }}>
              ❤️ {post.likeCount || 0}
            </span>
            <span>💬 {post.commentCount || 0}</span>
          </div>
        </div>
      </button>
    </article>
  );
}
