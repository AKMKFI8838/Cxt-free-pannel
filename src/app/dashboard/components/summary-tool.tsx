"use client";

import React, { useState, useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { generatePanelSummary } from "@/ai/flows/generate-panel-summary";
import { CardDescription } from "@/components/ui/card";

interface SummaryToolProps {
  panelData: any;
  panelDescription: string;
}

export function SummaryTool({ panelData, panelDescription }: SummaryToolProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = () => {
    startTransition(async () => {
      setError(null);
      setSummary(null);
      try {
        const result = await generatePanelSummary({
          panelData: JSON.stringify(panelData),
          panelDescription,
        });
        setSummary(result.summary);
      } catch (e) {
        console.error(e);
        setError("Failed to generate summary. Please try again.");
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleGenerateSummary}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          <span className="sr-only">Generate Summary</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">AI Summary</h4>
            <p className="text-sm text-muted-foreground">
              A brief analysis of the data trends.
            </p>
          </div>
          <div className="min-h-[6rem]">
            {isPending && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {summary && <CardDescription>{summary}</CardDescription>}
            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
