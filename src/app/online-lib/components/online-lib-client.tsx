"use client";

import { useState, useRef } from "react";
import type { LibFile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Download, Upload, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { uploadLibFile, deleteLibFile } from "../actions";

export function OnlineLibClient({ initialFiles }: { initialFiles: LibFile[] }) {
  const { toast } = useToast();
  const [files, setFiles] = useState(initialFiles);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<LibFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to upload.",
      });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    const result = await uploadLibFile(formData);

    if (result.success) {
      // Manually refetch files to update list
      const newFiles = await fetch("/online-lib/actions").then(res => res.json()); // A bit of a hack without full re-render
      toast({
        title: "Success",
        description: `File "${selectedFile.name}" uploaded successfully.`,
      });
      // This is a temporary measure; revalidatePath should handle it.
      window.location.reload();
    } else {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: result.error,
      });
    }
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(false);
  };

  const handleDeleteClick = (file: LibFile) => {
    setFileToDelete(file);
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    const result = await deleteLibFile(fileToDelete.file);
    setIsDeleting(false);

    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      toast({
        title: "Success",
        description: `File "${fileToDelete.file}" has been deleted.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: result.error,
      });
    }
    setFileToDelete(null);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Upload New Library</CardTitle>
        <CardDescription>
          Select a file from your computer to upload to the `Onlinelib` directory.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="max-w-xs"
        />
        <Button onClick={handleUpload} disabled={isLoading || !selectedFile}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload File
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Hosted Library Files</CardTitle>
        <CardDescription>
          The files below are hosted publicly in the `public/Onlinelib` directory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((lib) => (
                <TableRow key={lib.id}>
                  <TableCell className="font-medium">{lib.file}</TableCell>
                  <TableCell>{lib.file_size}</TableCell>
                  <TableCell>{format(new Date(lib.time), "PPP p")}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/${lib.file_type}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(lib)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No library files found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file{" "}
              <strong className="text-foreground">{fileToDelete?.file}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete file
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
