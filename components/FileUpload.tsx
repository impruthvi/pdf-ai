"use client";

import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });

      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Error uploading file");
          return;
        }
        mutate(data, {
          onSuccess: (data) => {
            toast.success(data.message)
          },
          onError: (err) => {
            toast.error("Error creating chat");
          },
        });
        console.log(data);
      } catch (err) {
        console.log(err);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          <>
            {/* Loading state */}
            <Loader2 className="w-18 h-18 text-blue-500 animate-spin" />
            <p className="m-2 text-sm text-slate-400">Spilling Tea to GPT...</p>
          </>
        ) : (
          <>
            <Inbox className="w-18 h-18 text-blue-500" />
            <p className="m-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
