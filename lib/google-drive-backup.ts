import { Tenant } from "@/context/global-context";

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  rootFolderId?: string;
  autoBackupEnabled: boolean;
  backupTime: string; // e.g. "00:00"
  lastBackupDate?: string;
  lastBackupStatus?: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  lastBackupLog?: string;
}

const STORAGE_KEY_DRIVE_CONFIG = "unipos_gdrive_config";
const STORAGE_KEY_DRIVE_LOGS = "unipos_gdrive_logs";

export function getGoogleDriveConfig(): GoogleDriveConfig {
  if (typeof window === "undefined") {
    return {
      clientId: "",
      clientSecret: "",
      refreshToken: "",
      rootFolderId: "",
      autoBackupEnabled: true,
      backupTime: "00:00",
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRIVE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    rootFolderId: "",
    autoBackupEnabled: true,
    backupTime: "00:00",
  };
}

export function saveGoogleDriveConfig(config: GoogleDriveConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_DRIVE_CONFIG, JSON.stringify(config));
  }
}

export interface BackupLogEntry {
  id: string;
  timestamp: string;
  tenantCount: number;
  status: "SUCCESS" | "FAILED";
  message: string;
  details?: Array<{ tenantId: string; businessName: string; status: "OK" | "ERROR"; error?: string }>;
}

export function getBackupLogs(): BackupLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRIVE_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function addBackupLog(entry: BackupLogEntry) {
  if (typeof window !== "undefined") {
    const existing = getBackupLogs();
    const updated = [entry, ...existing].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(STORAGE_KEY_DRIVE_LOGS, JSON.stringify(updated));
  }
}

/**
 * Generate full backup JSON payload for a given tenant
 */
export function generateTenantBackupData(tenant: Tenant): Record<string, any> {
  const tenantId = tenant.id;
  const backupPayload: Record<string, any> = {
    _meta: {
      tenantId: tenant.id,
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      email: tenant.email,
      backupDate: new Date().toISOString(),
      systemVersion: "1.0.0",
      type: "MT_UNIPOS_FULL_TENANT_BACKUP",
    },
    tenantInfo: tenant,
    collections: {},
  };

  const TENANT_DATA_KEYS = [
    "unipos_products",
    "unipos_customers",
    "unipos_suppliers",
    "unipos_sales",
    "unipos_expenses",
    "unipos_employees",
    "unipos_settings",
    "unipos_pos",
    "unipos_batches",
    "unipos_tables",
    "unipos_kitchen",
    "unipos_accounts",
    "unipos_journal",
    "unipos_attendance",
    "unipos_payroll",
    "unipos_transfers",
  ];

  if (typeof window !== "undefined") {
    TENANT_DATA_KEYS.forEach((key) => {
      const raw = localStorage.getItem(`${key}_${tenantId}`);
      if (raw) {
        try {
          backupPayload.collections[key] = JSON.parse(raw);
        } catch {
          backupPayload.collections[key] = raw;
        }
      }
    });
  }

  return backupPayload;
}

/**
 * Execute Backup for all Tenants to Google Drive or Local Fallback Vault
 */
export async function runFullTenantsBackupToDrive(
  tenants: Tenant[]
): Promise<{ success: boolean; message: string; details: BackupLogEntry["details"] }> {
  const config = getGoogleDriveConfig();
  const details: BackupLogEntry["details"] = [];
  const todayStr = new Date().toISOString().split("T")[0];

  try {
    for (const tenant of tenants) {
      if (tenant.status === "Suspended") continue; // Skip suspended tenants

      const backupData = generateTenantBackupData(tenant);
      const fileName = `${tenant.id}_Backup_${todayStr}.json`;
      const folderName = `${tenant.id}_${tenant.businessName.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

      // Simulate / Execute Drive API Upload via Server Route
      try {
        const res = await fetch("/api/cron/google-drive-backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config,
            tenantId: tenant.id,
            folderName,
            fileName,
            backupData,
          }),
        });

        const resData = await res.json();
        if (resData.success) {
          details.push({ tenantId: tenant.id, businessName: tenant.businessName, status: "OK" });
        } else {
          details.push({
            tenantId: tenant.id,
            businessName: tenant.businessName,
            status: "ERROR",
            error: resData.error || "Drive API upload failed",
          });
        }
      } catch (err: any) {
        details.push({
          tenantId: tenant.id,
          businessName: tenant.businessName,
          status: "ERROR",
          error: err?.message || "Network request failed",
        });
      }
    }

    const hasErrors = details.some((d) => d.status === "ERROR");
    const status = hasErrors ? "FAILED" : "SUCCESS";
    const msg = hasErrors
      ? `Backup completed with warnings (${details.filter((d) => d.status === "OK").length}/${tenants.length} tenants backed up)`
      : `✅ All ${tenants.length} Tenants successfully backed up to Google Drive!`;

    const logEntry: BackupLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      tenantCount: tenants.length,
      status: hasErrors ? "FAILED" : "SUCCESS",
      message: msg,
      details,
    };

    addBackupLog(logEntry);

    config.lastBackupDate = new Date().toLocaleString();
    config.lastBackupStatus = hasErrors ? "FAILED" : "SUCCESS";
    config.lastBackupLog = msg;
    saveGoogleDriveConfig(config);

    return { success: !hasErrors, message: msg, details };
  } catch (err: any) {
    const errorMsg = err?.message || "Backup execution failed unexpectedly.";
    config.lastBackupDate = new Date().toLocaleString();
    config.lastBackupStatus = "FAILED";
    config.lastBackupLog = errorMsg;
    saveGoogleDriveConfig(config);
    return { success: false, message: errorMsg, details: [] };
  }
}
