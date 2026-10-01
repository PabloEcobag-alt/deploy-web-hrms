"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { rescoreAllApplicants } from "@/lib/services/analyticsService";
import { toast } from "sonner";

export function RescoreButton() {
  const [isRescoring, setIsRescoring] = useState(false);

  const handleRescore = async () => {
    setIsRescoring(true);
    try {
      const result = await rescoreAllApplicants();
      toast.success(`Successfully enqueued ${result.enqueued} applicants for AI scoring.`);
    } catch (error) {
      toast.error("Failed to trigger rescore. Please try again.");
    } finally {
      setIsRescoring(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRescore} 
      disabled={isRescoring}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRescoring ? 'animate-spin' : ''}`} />
      {isRescoring ? 'Scoring...' : 'Rescore All'}
    </Button>
  );
}
