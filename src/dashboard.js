import { formatDate } from "./utils.js";

export const updateDashboard = (records) => {
  const total = records.length;
  const active = records.filter((record) => record.status === "active").length;
  const archived = total - active;
  document.getElementById("dash-total").textContent = `Total records: ${total}`;
  document.getElementById("dash-active").textContent = `Active: ${active}`;
  document.getElementById("dash-archived").textContent = `Archived: ${archived}`;

  const tagCounts = new Map();
  records.forEach((record) => {
    record.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const tagList = document.getElementById("dash-tags");
  tagList.innerHTML = "";
  topTags.forEach(([tag, count]) => {
    const li = document.createElement("li");
    li.textContent = `${tag} — ${count}`;
    tagList.appendChild(li);
  });
  if (topTags.length === 0) {
    tagList.innerHTML = "<li class=\"muted\">No tags yet.</li>";
  }

  const ratings = Array.from({ length: 6 }, (_, i) => i);
  const ratingList = document.getElementById("dash-ratings");
  ratingList.innerHTML = "";
  ratings.forEach((rating) => {
    const count = records.filter((record) => record.rating === rating).length;
    const li = document.createElement("li");
    li.textContent = `${rating} stars — ${count}`;
    ratingList.appendChild(li);
  });

  const recent = [...records]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);
  const recentList = document.getElementById("dash-recent");
  recentList.innerHTML = "";
  recent.forEach((record) => {
    const li = document.createElement("li");
    li.textContent = `${record.title || "Untitled"} · ${formatDate(record.updatedAt)}`;
    recentList.appendChild(li);
  });
  if (recent.length === 0) {
    recentList.innerHTML = "<li class=\"muted\">No updates yet.</li>";
  }
};
