import { formatDate } from "./utils.js";

const ROW_HEIGHT = 72;
const BUFFER = 6;

export const initList = ({
  onSelect,
  onEdit,
  onDuplicate,
  onArchiveToggle,
  onDelete,
  onNew,
  onFilterChange,
}) => {
  const listEl = document.getElementById("record-list");
  const spacer = document.querySelector(".virtual-spacer");
  const scrollContainer = document.getElementById("list-virtual-scroll");
  const listCount = document.getElementById("list-count");
  const indicator = document.getElementById("list-indicator");
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");
  const tagFilter = document.getElementById("tag-filter");
  const ratingFilter = document.getElementById("rating-filter");
  const sortFilter = document.getElementById("sort-filter");
  const newButton = document.getElementById("new-record");

  const detailPanel = document.getElementById("detail-panel");
  const detailContent = detailPanel.querySelector(".detail-content");
  const detailEmpty = detailPanel.querySelector(".detail-empty");

  let records = [];
  let selectedId = null;

  const renderDetail = (record) => {
    if (!record) {
      detailContent.classList.add("hidden");
      detailEmpty.classList.remove("hidden");
      return;
    }
    detailContent.classList.remove("hidden");
    detailEmpty.classList.add("hidden");
    document.getElementById("detail-title").textContent = record.title || "Untitled";
    document.getElementById("detail-body").textContent = record.body || "No body text.";
    document.getElementById("detail-status").textContent = `Status: ${record.status}`;
    document.getElementById("detail-rating").textContent = `Rating: ${record.rating}`;
    document.getElementById("detail-created").textContent = `Created: ${formatDate(
      record.createdAt
    )}`;
    document.getElementById("detail-updated").textContent = `Updated: ${formatDate(
      record.updatedAt
    )}`;
    const tagContainer = document.getElementById("detail-tags");
    tagContainer.innerHTML = "";
    record.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tag;
      tagContainer.appendChild(chip);
    });

    document.getElementById("detail-edit").onclick = () => onEdit(record.id);
    document.getElementById("detail-duplicate").onclick = () => onDuplicate(record.id);
    const archiveBtn = document.getElementById("detail-archive");
    archiveBtn.textContent = record.status === "archived" ? "Unarchive" : "Archive";
    archiveBtn.onclick = () => onArchiveToggle(record.id);
    document.getElementById("detail-delete").onclick = () => onDelete(record.id);
  };

  const renderList = () => {
    spacer.style.height = `${records.length * ROW_HEIGHT}px`;
    const scrollTop = scrollContainer.scrollTop;
    const height = scrollContainer.clientHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
    const endIndex = Math.min(
      records.length,
      Math.ceil((scrollTop + height) / ROW_HEIGHT) + BUFFER
    );

    const visibleRecords = records.slice(startIndex, endIndex);
    listEl.style.transform = `translateY(${startIndex * ROW_HEIGHT}px)`;
    listEl.innerHTML = "";

    visibleRecords.forEach((record) => {
      const item = document.createElement("li");
      item.className = "record-item";
      if (record.id === selectedId) item.classList.add("active");
      item.innerHTML = `
        <div>
          <div class="record-title">${record.title || "Untitled"}</div>
          <div class="record-meta">${record.tags.join(", ") || "No tags"}</div>
        </div>
        <div class="record-meta">${formatDate(record.updatedAt)}</div>
      `;
      item.addEventListener("click", () => onSelect(record.id));
      listEl.appendChild(item);
    });

    listCount.textContent = String(records.length);
    indicator.classList.toggle("hidden", records.length < 10000);
  };

  scrollContainer.addEventListener("scroll", () => {
    renderList();
  });

  const handleFilterChange = () => {
    onFilterChange({
      search: searchInput.value,
      status: statusFilter.value,
      tag: tagFilter.value,
      rating: Number(ratingFilter.value),
      sort: sortFilter.value,
    });
  };

  [searchInput, statusFilter, tagFilter, ratingFilter, sortFilter].forEach((el) => {
    el.addEventListener("input", handleFilterChange);
    el.addEventListener("change", handleFilterChange);
  });

  newButton.addEventListener("click", onNew);

  return {
    update({ records: nextRecords, selectedId: nextSelectedId, tags }) {
      records = nextRecords;
      selectedId = nextSelectedId;
      renderList();
      const selectedRecord = records.find((record) => record.id === selectedId);
      renderDetail(selectedRecord || null);

      const existing = new Set(["", ...tags]);
      if (tagFilter.options.length !== existing.size) {
        tagFilter.innerHTML = "";
        const allOption = document.createElement("option");
        allOption.value = "";
        allOption.textContent = "All tags";
        tagFilter.appendChild(allOption);
        tags.forEach((tag) => {
          const option = document.createElement("option");
          option.value = tag;
          option.textContent = tag;
          tagFilter.appendChild(option);
        });
      }
    },
    setFilters(filters) {
      searchInput.value = filters.search;
      statusFilter.value = filters.status;
      tagFilter.value = filters.tag;
      ratingFilter.value = String(filters.rating);
      sortFilter.value = filters.sort;
    },
    focusList() {
      scrollContainer.scrollTop = 0;
    },
  };
};
