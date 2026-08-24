import Image from 'next/image';

export function SiteLogo() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Image
        src="/workbench-mark.png"
        alt=""
        width={40}
        height={40}
        sizes="40px"
        className="size-10 shrink-0 object-contain"
      />
      <span className="text-base font-semibold tracking-tight">
        Workbench Notes<span className="text-[#8A9A86]">.</span>
      </span>
    </span>
  );
}
