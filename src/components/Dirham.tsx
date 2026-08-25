"use client";

import React from "react";

export default function Dirham({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center font-sans font-bold select-none ${className}`}>
      <span className="relative leading-none pr-[0.05em] after:content-[''] after:absolute after:left-[-0.05em] after:right-[-0.05em] after:top-[43%] after:h-[0.14em] after:border-t after:border-b after:border-current after:pointer-events-none">
        D
      </span>
    </span>
  );
}
