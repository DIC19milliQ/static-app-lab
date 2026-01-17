const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const createCanvasCopy = (source) => {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  const ctx = copy.getContext("2d");
  ctx.drawImage(source, 0, 0);
  return copy;
};

export const initMediaLab = () => {
  const dropzone = document.getElementById("media-dropzone");
  const fileInput = document.getElementById("media-file");
  const canvas = document.getElementById("media-canvas");
  const ctx = canvas.getContext("2d");
  const info = document.getElementById("media-info");
  const rotateLeft = document.getElementById("rotate-left");
  const rotateRight = document.getElementById("rotate-right");
  const flipH = document.getElementById("flip-horizontal");
  const flipV = document.getElementById("flip-vertical");
  const cropX = document.getElementById("crop-x");
  const cropY = document.getElementById("crop-y");
  const cropW = document.getElementById("crop-w");
  const cropH = document.getElementById("crop-h");
  const cropApply = document.getElementById("crop-apply");
  const resizeWidth = document.getElementById("resize-width");
  const resizeHeight = document.getElementById("resize-height");
  const resizeLock = document.getElementById("resize-lock");
  const resizeApply = document.getElementById("resize-apply");
  const exportPng = document.getElementById("export-png");
  const exportJpeg = document.getElementById("export-jpeg");
  const jpegQuality = document.getElementById("jpeg-quality");
  const pdfInput = document.getElementById("pdf-file");
  const pdfPreview = document.getElementById("pdf-preview");

  const state = {
    loaded: false,
    aspectRatio: 1,
  };

  const updateInfo = () => {
    if (!state.loaded) {
      info.textContent = "Load an image to start editing.";
      return;
    }
    info.textContent = `Canvas: ${canvas.width} × ${canvas.height}px`;
  };

  const updateResizeInputs = () => {
    resizeWidth.value = canvas.width;
    resizeHeight.value = canvas.height;
  };

  const loadImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        state.loaded = true;
        state.aspectRatio = image.width / image.height;
        updateResizeInputs();
        updateInfo();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const [file] = event.dataTransfer.files;
    if (file) {
      fileInput.value = "";
      loadImage(file);
    }
  };

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", handleDrop);

  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    loadImage(file);
  });

  const rotate = (direction) => {
    if (!state.loaded) return;
    const source = createCanvasCopy(canvas);
    const temp = document.createElement("canvas");
    temp.width = source.height;
    temp.height = source.width;
    const tctx = temp.getContext("2d");
    tctx.translate(temp.width / 2, temp.height / 2);
    tctx.rotate(direction * Math.PI / 2);
    tctx.drawImage(source, -source.width / 2, -source.height / 2);
    canvas.width = temp.width;
    canvas.height = temp.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(temp, 0, 0);
    state.aspectRatio = canvas.width / canvas.height;
    updateResizeInputs();
    updateInfo();
  };

  const flip = (horizontal) => {
    if (!state.loaded) return;
    const source = createCanvasCopy(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
    ctx.drawImage(
      source,
      horizontal ? -canvas.width : 0,
      horizontal ? 0 : -canvas.height
    );
    ctx.restore();
  };

  rotateLeft.addEventListener("click", () => rotate(-1));
  rotateRight.addEventListener("click", () => rotate(1));
  flipH.addEventListener("click", () => flip(true));
  flipV.addEventListener("click", () => flip(false));

  cropApply.addEventListener("click", () => {
    if (!state.loaded) return;
    const x = Math.max(0, Number(cropX.value) || 0);
    const y = Math.max(0, Number(cropY.value) || 0);
    const width = Math.min(canvas.width - x, Number(cropW.value) || canvas.width);
    const height = Math.min(canvas.height - y, Number(cropH.value) || canvas.height);
    if (width <= 0 || height <= 0) return;
    const source = createCanvasCopy(canvas);
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
    state.aspectRatio = canvas.width / canvas.height;
    updateResizeInputs();
    updateInfo();
  });

  resizeLock.addEventListener("change", () => {
    if (!state.loaded) return;
    if (resizeLock.checked) {
      resizeHeight.value = Math.round(Number(resizeWidth.value || canvas.width) / state.aspectRatio);
    }
  });

  resizeWidth.addEventListener("input", () => {
    if (!state.loaded) return;
    if (resizeLock.checked) {
      resizeHeight.value = Math.round(Number(resizeWidth.value || canvas.width) / state.aspectRatio);
    }
  });

  resizeApply.addEventListener("click", () => {
    if (!state.loaded) return;
    const width = Math.max(1, Number(resizeWidth.value) || canvas.width);
    const height = Math.max(1, Number(resizeHeight.value) || canvas.height);
    const source = createCanvasCopy(canvas);
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, width, height);
    state.aspectRatio = canvas.width / canvas.height;
    updateResizeInputs();
    updateInfo();
  });

  exportPng.addEventListener("click", () => {
    if (!state.loaded) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "media-export.png");
    }, "image/png");
  });

  exportJpeg.addEventListener("click", () => {
    if (!state.loaded) return;
    const quality = Number(jpegQuality.value) / 100;
    canvas.toBlob(
      (blob) => {
        if (blob) downloadBlob(blob, "media-export.jpg");
      },
      "image/jpeg",
      quality
    );
  });

  pdfInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const url = URL.createObjectURL(file);
    pdfPreview.src = url;
    pdfPreview.classList.remove("hidden");
  });

  updateInfo();
};
