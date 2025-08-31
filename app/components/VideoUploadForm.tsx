"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";

type VideoUploadFormProps = {
  action?: string; // API endpoint
  maxBytes?: number; // default 500 MB
  accept?: string[]; // default common video MIME types
  onSuccess?: (resp: unknown) => void; // callback with server response
  onError?: (err: string) => void; // callback with error message
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}

const DEFAULT_ACCEPT = [
  "video/mp4",
  "video/quicktime", // mov
  "video/webm",
  "video/x-matroska", // mkv
];

export default function VideoUploadForm({
  action = "/api/videos/upload",
  maxBytes = 500 * 1024 * 1024, // 500MB
  accept = DEFAULT_ACCEPT,
  onSuccess,
  onError,
}: VideoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const acceptAttr = useMemo(() => accept.join(","), [accept]);

  const reset = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    setUploading(false);
    setDuration(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const validate = useCallback((f: File) => {
    if (!accept.includes(f.type)) {
      return `Unsupported file type: ${f.type || "unknown"}`;
    }
    if (f.size > maxBytes) {
      return `File too large: ${formatBytes(f.size)} (limit ${formatBytes(
        maxBytes
      )})`;
    }
    return null;
  }, [accept, maxBytes]);

  const loadVideoMetadata = useCallback((f: File) => {
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.onloadedmetadata = () => {
      setDuration(isFinite(v.duration) ? v.duration : null);
      // do not revoke here; keep preview working. cleanup in reset or unmount
    };
    v.onerror = () => setDuration(null);
  }, [setPreviewUrl, setDuration]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        setError(err);
        setFile(null);
        return;
      }
      setError(null);
      setFile(f);
      loadVideoMetadata(f);
    },
    [validate, setError, setFile, loadVideoMetadata]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const startUpload = async () => {
    if (!file || uploading) return;
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const form = new FormData();
      form.append("file", file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("POST", action, true);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setProgress(pct);
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          let json: unknown = null;
          try {
            json = JSON.parse(xhr.responseText || "{}");
          } catch {
            json = { ok: true };
          }
          onSuccess?.(json);
          // keep state so user can see 100% and success; you can reset() if you prefer
        } else {
          const msg =
            xhr.responseText || `Upload failed with status ${xhr.status}`;
          setError(msg);
          onError?.(msg);
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        const msg = "Network error during upload.";
        setError(msg);
        onError?.(msg);
        setUploading(false);
      };

      xhr.send(form);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      onError?.(msg);
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    if (xhrRef.current && uploading) {
      xhrRef.current.abort();
      setUploading(false);
      setProgress(0);
      setError("Upload canceled");
    }
  };

  return (
    <div className="min-h-[60vh] w-full max-w-2xl mx-auto text-slate-200">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100 mb-4">
          Upload a video
        </h2>

        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            "block cursor-pointer rounded-xl border px-4 py-10 transition-colors",
            dragOver
              ? "border-indigo-400 bg-indigo-400/10"
              : "border-white/10 bg-black/30 hover:border-indigo-400/70 hover:bg-black/40",
          ].join(" ")}
        >
          <div className="text-center">
            <div className="text-sm text-slate-400">
              Drag and drop your video here, or click to browse
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Allowed: {accept.join(", ")} • Max size: {formatBytes(maxBytes)}
            </div>
          </div>
          <input
            type="file"
            accept={acceptAttr}
            className="sr-only"
            onChange={onInputChange}
          />
        </label>

        {file && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium text-slate-100">{file.name}</div>
                <div className="text-slate-400 text-xs">
                  {formatBytes(file.size)}
                  {duration !== null ? ` • ${duration.toFixed(1)}s` : ""}
                </div>
              </div>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4"
                onClick={reset}
                disabled={uploading}
              >
                Remove
              </button>
            </div>

            {previewUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/50">
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-64"
                  preload="metadata"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs text-slate-400">
              {progress}%
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={startUpload}
            disabled={!file || uploading}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 font-medium text-white shadow-lg focus:outline-none disabled:opacity-60"
          >
            Upload
          </button>
          {uploading && (
            <button
              type="button"
              onClick={cancelUpload}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}