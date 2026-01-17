import { chunkedProcess, estimateSize, humanFileSize, showToast } from "./utils.js";
import { generateSampleRecords } from "./model.js";

export const initSettings = ({
  getRecords,
  onClear,
  onReset,
  onGenerate,
  toastEl,
}) => {
  const generate100 = document.getElementById("generate-100");
  const generate10000 = document.getElementById("generate-10000");
  const clearData = document.getElementById("clear-data");
  const resetDemo = document.getElementById("reset-demo");
  const storageCount = document.getElementById("storage-count");
  const storageSize = document.getElementById("storage-size");

  const updateStorageInfo = () => {
    const records = getRecords();
    storageCount.textContent = `Records: ${records.length}`;
    storageSize.textContent = `Approx. storage size: ${humanFileSize(estimateSize(records))}`;
  };


  const handleGenerate = async (count) => {
    const records = generateSampleRecords(count);
    const chunks = [];
    await chunkedProcess(records, 250, (slice) => {
      chunks.push(...slice);
      showToast(toastEl, `Generating... ${chunks.length}/${records.length}`);
      return onGenerate(slice);
    });
    showToast(toastEl, `Generated ${count} records`);
  };

  generate100.addEventListener("click", () => handleGenerate(100));
  generate10000.addEventListener("click", () => handleGenerate(10000));
  clearData.addEventListener("click", () => onClear());
  resetDemo.addEventListener("click", () => onReset());

  return {
    refresh() {
      updateStorageInfo();
    },
  };
};
