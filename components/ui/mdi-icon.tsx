type MdiIconProps = {
  path: string;
  className?: string;
};

export function MdiIcon({ path, className }: MdiIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d={path} />
    </svg>
  );
}
