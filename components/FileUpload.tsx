"use client";

import { uploadToS3 } from "@/lib/s3";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      try {
        const data = await uploadToS3(file);
        console.log(data);
      } catch (err) {
        console.log(err);
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
        <>
          <Inbox className="w-18 h-18 text-blue-500" />
          <p className="m-2 text-sm text-slate-400">Drop PDF Here</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
