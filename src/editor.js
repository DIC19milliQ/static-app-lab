import { validateRecord } from "./model.js";
import { debounce, showToast } from "./utils.js";

export const initEditor = ({ onSave, toastEl, onChangeAutosave }) => {
  const form = document.getElementById("editor-form");
  const idInput = document.getElementById("record-id");
  const titleInput = document.getElementById("record-title");
  const bodyInput = document.getElementById("record-body");
  const tagsInput = document.getElementById("record-tags");
  const statusInput = document.getElementById("record-status");
  const ratingInput = document.getElementById("record-rating");
  const ratingValue = document.getElementById("rating-value");
  const saveStatus = document.getElementById("save-status");
  const autosaveToggle = document.getElementById("autosave-toggle");
  const editorTitle = document.getElementById("editor-title");

  ratingValue.textContent = `Rating: ${ratingInput.value}`;

  const updateRating = () => {
    ratingValue.textContent = `Rating: ${ratingInput.value}`;
  };

  ratingInput.addEventListener("input", updateRating);

  const collectRecord = () => ({
    id: idInput.value || undefined,
    title: titleInput.value,
    body: bodyInput.value,
    tags: tagsInput.value,
    status: statusInput.value,
    rating: Number(ratingInput.value),
  });

  const save = async (showMessage = true) => {
    const record = collectRecord();
    const error = validateRecord(record);
    if (error) {
      showToast(toastEl, error);
      return;
    }
    saveStatus.textContent = "Saving...";
    await onSave(record);
    saveStatus.textContent = "Saved";
    if (showMessage) {
      showToast(toastEl, "Record saved");
    }
  };

  const debouncedSave = debounce(() => save(false), 400);

  const maybeAutosave = () => {
    if (autosaveToggle.checked) {
      debouncedSave();
    }
  };

  [titleInput, bodyInput, tagsInput, statusInput, ratingInput].forEach((el) => {
    el.addEventListener("input", maybeAutosave);
    el.addEventListener("change", maybeAutosave);
  });

  autosaveToggle.addEventListener("change", () => {
    onChangeAutosave(autosaveToggle.checked);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save(true);
  });

  return {
    setRecord(record) {
      idInput.value = record?.id || "";
      titleInput.value = record?.title || "";
      bodyInput.value = record?.body || "";
      tagsInput.value = record?.tags?.join(", ") || "";
      statusInput.value = record?.status || "active";
      ratingInput.value = record?.rating ?? 3;
      updateRating();
      saveStatus.textContent = record ? "" : "";
      editorTitle.textContent = record?.id ? "Edit Record" : "Create Record";
    },
    setAutosave(value) {
      autosaveToggle.checked = value;
    },
  };
};
