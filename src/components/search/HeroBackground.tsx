import Image from "next/image";

/**
 * Search widget wale har hero ka shared background (home, listings, real time offers):
 * Dubai skyline photo + gradient + glow. Parent <section> `relative` hona chahiye.
 */
export default function HeroBackground({ priority = true }: { priority?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#091711]" aria-hidden="true">
      <Image
        src="/hero-dubai-skyline.jpeg"
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-[center_top] pointer-events-none opacity-90 dark:opacity-85"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#091711]/70 via-black/25 to-[#091711] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/10 rounded-full blur-[90px] pointer-events-none" />
    </div>
  );
}
