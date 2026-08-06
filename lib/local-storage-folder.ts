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
    if (typeof (handle as any).queryPermission === "function" && (await (handle as any).queryPermission(opts)) === "granted") return true;
    if (typeof (handle as any).requestPermission === "function" && (await (handle as any).requestPermission(opts)) === "granted") return true;
  } catch (err) {
    console.warn("Directory permission check failed:", err);
  }
  return false;
}

/**
 * Let user pick a root folder on their computer (e.g. Documents or custom folder).
 * Automatically creates subfolders inside it.
 */
export async function selectAndInitRootFolder(): Promise<{ success: boolean; folderName?: string; error?: string }> {
  try {
    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      return { success: false, error: "Browser does not support folder picker API. Please use Chrome, Edge, or Brave." };
    }

    // Open native directory picker
    const rootHandle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
      startIn: "documents",
    });

    if (!rootHandle) return { success: false, error: "No folder selected" };

    // Create standard MT UniPOS subfolders
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

    return { success: true, folderName: rootHandle.name };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { success: false, error: "Folder selection cancelled" };
    }
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
