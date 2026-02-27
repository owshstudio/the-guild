import { watch, type FSWatcher } from "fs";
import { EventEmitter } from "events";

const DEBOUNCE_MS = 200;

export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private closed = false;

  watch(dirPath: string, options?: { recursive?: boolean }): void {
    if (this.closed) return;

    try {
      this.watcher = watch(
        dirPath,
        { recursive: options?.recursive ?? false },
        (eventType, filename) => {
          if (!filename || this.closed) return;
          const key = `${eventType}:${filename}`;

          // Debounce rapid duplicate events from fs.watch
          const existing = this.debounceTimers.get(key);
          if (existing) clearTimeout(existing);

          this.debounceTimers.set(
            key,
            setTimeout(() => {
              this.debounceTimers.delete(key);
              if (!this.closed) {
                this.emit("change", String(filename));
              }
            }, DEBOUNCE_MS)
          );
        }
      );

      this.watcher.on("error", () => {
        // Directory deleted, permissions changed, etc. — silently close
        this.close();
      });
    } catch {
      // watch target doesn't exist or isn't accessible
    }
  }

  close(): void {
    this.closed = true;
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.removeAllListeners();
  }
}
