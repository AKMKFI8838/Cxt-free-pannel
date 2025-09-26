"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import type { LibFile } from "@/lib/types";

const libDirPath = path.join(process.cwd(), "public", "Onlinelib");

// Ensure the directory exists
async function ensureLibDirExists() {
  try {
    await fs.access(libDirPath);
  } catch (error) {
    await fs.mkdir(libDirPath, { recursive: true });
  }
}

export async function getLibFiles(): Promise<LibFile[]> {
  await ensureLibDirExists();
  try {
    const fileNames = await fs.readdir(libDirPath);
    const files = await Promise.all(
      fileNames.map(async (name, index) => {
        const filePath = path.join(libDirPath, name);
        const stats = await fs.stat(filePath);
        return {
          id: index + 1,
          file: name,
          file_type: `Onlinelib/${name}`,
          file_size: `${(stats.size / 1024).toFixed(2)} KB`,
          time: stats.mtime.toISOString(),
        };
      })
    );
    return files.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  } catch (error) {
    console.error("Failed to read library files:", error);
    return [];
  }
}

export async function uploadLibFile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await ensureLibDirExists();
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(libDirPath, file.name);
    await fs.writeFile(filePath, buffer);
    revalidatePath("/online-lib"); // Re-renders the page with the new file
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not upload file. Reason: ${errorMessage}` };
  }
}

export async function deleteLibFile(
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!fileName) {
      return { success: false, error: "Invalid file name." };
    }
    const filePath = path.join(libDirPath, fileName);
    await fs.unlink(filePath);
    revalidatePath("/online-lib");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete file. Reason: ${errorMessage}` };
  }
}
