"use client"

import React from 'react';
import { GitMerge, MessageSquare, StarIcon as LucideStarIcon, AlertTriangle, Bot, GitCommitHorizontal, AlertCircle, ExternalLink } from 'lucide-react';
import { Action } from '@/app/page'; // Assuming Action interface is exported from page.tsx
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  actions: Action[];
}

const iconMap: Record<Action['type'], React.ElementType> = {
  "Commit": GitCommitHorizontal,
  "Issue Opened": AlertCircle,
  "PR Merged": GitMerge,
  "New Star": LucideStarIcon,
  "Security Alert": AlertTriangle,
};

const getIconColor = (type: Action['type'], isBot: boolean) => {
  if (isBot) return "text-muted-foreground"; 
  switch (type) {
    case "Commit": return "text-blue-500";
    case "Issue Opened": return "text-green-500";
    case "PR Merged": return "text-purple-500";
    case "New Star": return "text-yellow-500";
    case "Security Alert": return "text-red-500";
    default: return "text-gray-500";
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ actions }) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No recent activity to display.
      </div>
    );
  }

  return (
    <div className="space-y-5 -ml-1.5"> {/* Negative margin to align line with card padding */}
      {actions.map((action, index) => {
        const IconComponent = iconMap[action.type] || GitCommitHorizontal;
        const iconColor = getIconColor(action.type, action.isBot);

        return (
          <div key={action.id} className="flex items-start">
            {/* Icon and Vertical Line */}
            <div className="relative flex flex-col items-center mr-3.5"> 
              <div className={cn("flex items-center justify-center h-7 w-7 rounded-full bg-card border", iconColor)}>
                <IconComponent className="h-3.5 w-3.5" />
              </div>
              {index < actions.length - 1 && (
                <div className="absolute top-7 left-1/2 w-0.5 h-[calc(100%-0.5rem)] -translate-x-1/2 bg-border"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow pt-0.5 min-w-0"> 
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center overflow-hidden">
                  {action.isBot && <Bot className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />}
                  <span className={cn("font-medium truncate", action.isBot ? "text-muted-foreground" : "text-foreground")}>
                    {action.actor}
                  </span>
                </div>
                <span className="text-muted-foreground flex-shrink-0 ml-2">{action.time}</span>
              </div>
              
              <p className="text-sm text-foreground mb-0.5">
                <a 
                    href={action.repo_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold hover:underline"
                >
                  {action.repoName}
                </a>
                <span className="text-muted-foreground text-xs"> ({action.type})</span>
              </p>

              {action.details && (
                <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                  {action.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
