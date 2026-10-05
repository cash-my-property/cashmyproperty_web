"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, RefreshCw } from "lucide-react";

interface ProfileCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => Promise<void> | void;
  isUploading?: boolean;
}

export default function ProfileCropModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  isUploading = false,
}: ProfileCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset states on open with new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      if (imageRef.current && imageRef.current.complete) {
        setImageLoaded(true);
      }
    }
  }, [isOpen, imageSrc]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + zoomFactor, 1), 3));
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset to default position
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Generate Cropped Image Blob using HTML5 Canvas
  const handleSaveCrop = useCallback(async () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const cropSize = 600; // Output avatar square dimensions
    const canvas = document.createElement("canvas");
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Viewport diameter on UI
    const viewportDiameter = 260; 

    // Render configuration
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    // Center of canvas
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale ratio between canvas and UI viewport
    const uiToCanvasScale = cropSize / viewportDiameter;

    // Apply translation according to rotation
    const rad = (rotation * Math.PI) / 180;
    const rotatedX = position.x * Math.cos(rad) + position.y * Math.sin(rad);
    const rotatedY = -position.x * Math.sin(rad) + position.y * Math.cos(rad);

    ctx.translate(rotatedX * uiToCanvasScale, rotatedY * uiToCanvasScale);
    ctx.scale(zoom * uiToCanvasScale, zoom * uiToCanvasScale);

    // Draw the image centered
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = viewportDiameter;
    let drawHeight = viewportDiameter;

    if (imgAspect > 1) {
      // Landscape: fit height to viewport
      drawHeight = viewportDiameter;
      drawWidth = viewportDiameter * imgAspect;
    } else {
      // Portrait: fit width to viewport
      drawWidth = viewportDiameter;
      drawHeight = viewportDiameter / imgAspect;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.92
    );
  }, [position, zoom, rotation, onCropComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Crop Profile Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Drag and zoom to adjust position</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#163321] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Viewport Area (WhatsApp / Instagram style circular mask) */}
        <div className="relative w-full h-[320px] bg-gray-950 overflow-hidden flex items-center justify-center select-none">
          
          {/* Draggable & Scalable Image Container */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={() => setImageLoaded(true)}
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                maxHeight: "260px",
                maxWidth: "none",
                userSelect: "none",
                pointerEvents: "none",
              }}
              className="object-contain"
            />
          </div>

          {/* WhatsApp Style Circular Mask Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Dark Mask with Circle Cutout */}
            <div 
              className="w-full h-full"
              style={{
                background: "radial-gradient(circle 130px at center, transparent 130px, rgba(0, 0, 0, 0.72) 131px)",
              }}
            />
            {/* Circle Guideline Ring */}
            <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] pointer-events-none">
              {/* Rule of Thirds Grid Lines (Subtle) */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-5 space-y-4 bg-gray-50 dark:bg-[#0c2016]/60 border-t border-gray-100 dark:border-[#1A3626]">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
              className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#163321] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#1A3626] dark:accent-[#5CD284] cursor-pointer h-1.5 bg-gray-200 dark:bg-[#163321] rounded-lg"
            />

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
              className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#163321] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-[#102418] rounded-xl border border-gray-200 dark:border-[#1A3626] shadow-xs hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rotate</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-[#102418] rounded-xl border border-gray-200 dark:border-[#1A3626] shadow-xs hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer text-xs font-semibold"
              title="Reset position"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#163321] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isUploading || !imageSrc}
              className="px-6 py-2.5 bg-[#1A3626] hover:bg-[#163321] dark:bg-[#5CD284] dark:hover:bg-[#4ab872] text-white dark:text-[#0A1C12] rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crop & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
