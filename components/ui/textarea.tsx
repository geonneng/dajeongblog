import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, onChange, onInput, value, defaultValue, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // 값이 바뀔 때마다 (controlled)
  React.useEffect(() => {
    resize();
  }, [value, resize]);

  // 첫 렌더 + defaultValue 처리 (uncontrolled)
  React.useEffect(() => {
    resize();
  }, [resize]);

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      value={value}
      defaultValue={defaultValue}
      className={cn(
        "flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 overflow-hidden resize-none",
        className
      )}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      onInput={(e) => {
        onInput?.(e);
        resize();
      }}
      {...props}
    />
  )
}

export { Textarea }
