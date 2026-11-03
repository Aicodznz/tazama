type PreviewListener = (activeId: string | null) => void;

let currentActivePreviewId: string | null = null;
const listeners = new Set<PreviewListener>();

export const previewManager = {
  getActiveId(): string | null {
    return currentActivePreviewId;
  },
  setActiveId(id: string | null) {
    currentActivePreviewId = id;
    listeners.forEach((listener) => listener(id));
  },
  subscribe(listener: PreviewListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
