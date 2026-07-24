"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  label: string;
  count?: number;
  content: React.ReactNode;
}

export function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = React.useState(0);

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={cn(
              "relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors",
              active === i
                ? "text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
            {t.count != null && (
              <span className="ml-1.5 text-xs text-muted">{t.count}</span>
            )}
            {active === i && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full gradient-brand" />
            )}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
