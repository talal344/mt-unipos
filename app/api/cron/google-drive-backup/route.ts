import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { config, tenantId, folderName, fileName, backupData } = body;

    if (!tenantId || !backupData) {
      return NextResponse.json({ success: false, error: "Missing tenantId or backupData" }, { status: 400 });
    }

    const jsonString = JSON.stringify(backupData, null, 2);

    // Check if Google Drive Credentials exist
    if (config?.clientId && config?.clientSecret && config?.refreshToken) {
      try {
        // 1. Get Access Token from Refresh Token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: config.refreshToken,
            grant_type: "refresh_token",
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          return NextResponse.json({
            success: false,
            error: `Google OAuth Token Refresh failed: ${tokenData.error_description || tokenData.error || 'Invalid Credentials'}`,
          });
        }

        const accessToken = tokenData.access_token;
        const parentId = config.rootFolderId || "root";

        // 2. Search or Create Tenant Folder inside Root
        let tenantFolderId = "";
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+name='${encodeURIComponent(
            folderName
          )}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const searchData = await searchRes.json();

        if (searchData.files && searchData.files.length > 0) {
          tenantFolderId = searchData.files[0].id;
        } else {
          // Create Folder
          const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: folderName,
              mimeType: "application/vnd.google-apps.folder",
              parents: [parentId],
            }),
          });
          const newFolder = await createFolderRes.json();
          tenantFolderId = newFolder.id;
        }

        // 3. Upload Backup JSON File into Tenant Folder (Multipart Request)
        const metadata = {
          name: fileName,
          parents: [tenantFolderId],
        };

        const delimiter = "-------314159265358979323846";
        const closeDelimiter = `\r\n--${delimiter}--`;

        const multipartBody =
          `--${delimiter}\r\n` +
          `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
          `${JSON.stringify(metadata)}\r\n` +
          `--${delimiter}\r\n` +
          `Content-Type: application/json\r\n\r\n` +
          `${jsonString}` +
          closeDelimiter;

        const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary="${delimiter}"`,
          },
          body: multipartBody,
        });

        const uploadData = await uploadRes.json();

        if (uploadData.id) {
          return NextResponse.json({
            success: true,
            driveFileId: uploadData.id,
            message: `Uploaded ${fileName} to Google Drive folder ${folderName}`,
          });
        } else {
          return NextResponse.json({
            success: false,
            error: `Drive File Upload Failed: ${uploadData.error?.message || 'Unknown Drive API error'}`,
          });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Google Drive API Exception: ${err?.message || "Request failed"}`,
        });
      }
    } else {
      // Local Backup Vault Simulation (No credentials configured yet)
      return NextResponse.json({
        success: true,
        isSimulated: true,
        message: `Backup data compiled for ${tenantId}. Connect Google Drive API key in Settings to upload directly.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
