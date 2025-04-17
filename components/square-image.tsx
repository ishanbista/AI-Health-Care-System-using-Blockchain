"use client"

import { useEffect, useState } from "react"

interface SquareImageProps {
  src: string
  alt: string
  className?: string
}

export function SquareImage({ src, alt, className = "" }: SquareImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    // In Next.js, static files should be in the public directory
    // and referenced with a leading slash
    setImageSrc(`/${src}`)
  }, [src])

  return (
    <div className={`relative aspect-square overflow-hidden rounded-lg shadow-xl ${className}`}>
      {imageSrc ? (
        <img src={imageSrc} alt={alt} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Loading image...</p>
        </div>
      )}
    </div>
  )
}
