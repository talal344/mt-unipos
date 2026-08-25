// ── Native File System Storage Utility ─────────────────────────────────────────
// Stores user-selected directory handle in IndexedDB and manages subfolder creation
// (Sale Receipts, Dues Clear Receipts, Sale or Purchase Return Receipts, Reports)

import { supabase } from "@/lib/supabase";

const DB_NAME = "mt_unipos_fs_db";
const STORE_NAME = "handles";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save directory handle in IndexedDB
 */
export async function setStoredDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(handle, "root_dir");
    tx.oncomplete = () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("unipos_selected_folder_name", handle.name);
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve directory handle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get("root_dir");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Verify / request permission for directory handle
 */
export async function verifyDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const opts = { mode: "readwrite" as const };
    if (typeof (handle as any).queryPermission === "function") {
      let status = await (handle as any).queryPermission(opts);
      if (status === "granted") return true;
      if (status === "prompt" && typeof (handle as any).requestPermission === "function") {
        try {
          status = await (handle as any).requestPermission(opts);
          if (status === "granted") return true;
        } catch (reqErr) {
          console.warn("Could not auto-request permission:", reqErr);
        }
      }
    }
  } catch (err) {
    console.warn("Directory permission check failed:", err);
  }
  return false;
}

/**
 * Let user pick a root folder on their computer (e.g. Documents or custom folder).
 * Automatically creates subfolders inside it.
 */
export function isSafariBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return !("showDirectoryPicker" in window);
}

/**
 * Let user pick a root folder on their computer (e.g. Documents or custom folder).
 * Automatically creates subfolders inside it.
 */
export async function selectAndInitRootFolder(): Promise<{ success: boolean; folderName?: string; isSafari?: boolean; error?: string }> {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: "Window is undefined" };
    }

    // ── METHOD A: Chrome, Edge, Brave native File System Access API ──
    if ("showDirectoryPicker" in window) {
      try {
        const rootHandle = await (window as any).showDirectoryPicker({
          mode: "readwrite",
          startIn: "documents",
        });

        if (!rootHandle) return { success: false, error: "No folder selected" };

        const subfolders = [
          "Sale Receipts",
          "Dues Clear Receipts",
          "Sale or Purchase Return Receipts",
          "Reports/PDF",
          "Reports/Excel",
          "Reports/JPG",
        ];

        for (const path of subfolders) {
          const parts = path.split("/");
          let current = rootHandle;
          for (const part of parts) {
            current = await current.getDirectoryHandle(part, { create: true });
          }
        }

        await setStoredDirectoryHandle(rootHandle);

        return { success: true, folderName: rootHandle.name, isSafari: false };
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return { success: false, error: "Folder selection cancelled" };
        }
        console.warn("showDirectoryPicker error, falling back to Safari input mode:", err);
      }
    }

    // ── METHOD B: Safari / Firefox directory input fallback ──
    return await new Promise((resolve) => {
      try {
        const input = document.createElement("input");
        input.type = "file";
        (input as any).webkitdirectory = true;
        (input as any).directory = true;
        input.style.display = "none";

        let resolved = false;

        input.onchange = (e: any) => {
          if (resolved) return;
          resolved = true;
          const files = e.target.files;
          let folderName = "MT CORE";
          if (files && files.length > 0 && files[0].webkitRelativePath) {
            const topDir = files[0].webkitRelativePath.split("/")[0];
            if (topDir) folderName = topDir;
          }
          localStorage.setItem("unipos_selected_folder_name", folderName);
          localStorage.setItem("unipos_safari_mode", "true");
          if (document.body.contains(input)) document.body.removeChild(input);
          resolve({ success: true, folderName, isSafari: true });
        };

        const onFocus = () => {
          window.removeEventListener("focus", onFocus);
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              const saved = localStorage.getItem("unipos_selected_folder_name") || "MT CORE";
              localStorage.setItem("unipos_selected_folder_name", saved);
              localStorage.setItem("unipos_safari_mode", "true");
              if (document.body.contains(input)) document.body.removeChild(input);
              resolve({ success: true, folderName: saved, isSafari: true });
            }
          }, 400);
        };

        document.body.appendChild(input);
        window.addEventListener("focus", onFocus, { once: true });
        input.click();
      } catch (err: any) {
        const folderName = "MT CORE";
        localStorage.setItem("unipos_selected_folder_name", folderName);
        localStorage.setItem("unipos_safari_mode", "true");
        resolve({ success: true, folderName, isSafari: true });
      }
    });
  } catch (err: any) {
    console.error("selectAndInitRootFolder error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Save file to the selected folder via Browser File System API,
 * with fallback to Next.js POST /api/save-file AND browser download anchor.
 */
export async function saveFileToSelectedFolder(
  category: string,
  fileName: string,
  fileBase64OrDataUrl: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const cleanBase64 = fileBase64OrDataUrl.startsWith("data:")
      ? fileBase64OrDataUrl
      : `data:image/jpeg;base64,${fileBase64OrDataUrl}`;

    let savedPath = "";
    let fsSuccess = false;

    // ── METHOD 1: Try Native Browser Directory Handle (IndexedDB) ──
    const handle = await getStoredDirectoryHandle();
    if (handle) {
      const hasPerm = await verifyDirectoryPermission(handle);
      if (hasPerm) {
        try {
          let subfolderName = "Sale Receipts";
          if (category === "dues-receipt") subfolderName = "Dues Clear Receipts";
          else if (category === "return-receipt") subfolderName = "Sale or Purchase Return Receipts";
          else if (category === "report-pdf") subfolderName = "Reports/PDF";
          else if (category === "report-excel") subfolderName = "Reports/Excel";
          else if (category === "report-jpg") subfolderName = "Reports/JPG";

          let targetFolder = handle;
          for (const part of subfolderName.split("/")) {
            targetFolder = await targetFolder.getDirectoryHandle(part, { create: true });
          }

          const fileHandle = await targetFolder.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();

          const blobRes = await fetch(cleanBase64);
          const blob = await blobRes.blob();

          await writable.write(blob);
          await writable.close();

          savedPath = `${handle.name}/${subfolderName}/${fileName}`;
          fsSuccess = true;
        } catch (fsErr) {
          console.warn("Direct FileSystem API write failed, trying API fallback:", fsErr);
        }
      }
    }

    // ── METHOD 2: Try Backend Server API (/api/save-file) ──
    if (!fsSuccess) {
      try {
        const res = await fetch("/api/save-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, fileName, fileBase64: cleanBase64 }),
        });
        const json = await res.json();
        if (json.success) {
          savedPath = json.filePath || "";
          fsSuccess = true;
        }
      } catch (apiErr) {
        console.warn("Backend /api/save-file failed:", apiErr);
      }
    }

    // ── METHOD 3: Emergency Download Fallback ONLY if both direct folder & server API failed ──
    if (!fsSuccess) {
      try {
        const a = document.createElement("a");
        a.href = cleanBase64;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        savedPath = `Downloads/${fileName}`;
        fsSuccess = true;
      } catch (dlErr) {
        console.warn("Browser download trigger failed:", dlErr);
      }
    }

    // ── METHOD 4: Sync receipt image to Supabase Storage Bucket ('receipts') ──
    if (typeof window !== "undefined" && navigator.onLine && supabase) {
      (async () => {
        try {
          const blobRes = await fetch(cleanBase64);
          const blob = await blobRes.blob();
          const cloudFilePath = `${category}/${fileName}`;
          
          const { error } = await supabase.storage.from("receipts").upload(cloudFilePath, blob, {
            contentType: "image/jpeg",
            upsert: true
          });
          if (error) {
            console.warn("Supabase Storage receipt image upload error:", error);
          } else {
            console.log("✅ Receipt image uploaded to Supabase Storage bucket 'receipts':", cloudFilePath);
          }
        } catch (sErr) {
          console.warn("Supabase Storage receipt upload exception:", sErr);
        }
      })();
    }

    return {
      success: fsSuccess,
      filePath: savedPath || fileName,
    };
  } catch (err: any) {
    console.error("saveFileToSelectedFolder error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
