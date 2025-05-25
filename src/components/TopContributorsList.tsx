"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Users } from 'lucide-react'; // Users icon for fallback
import { Contributor } from '@/app/page'; // Assuming Contributor interface is exported from page.tsx
import { cn } from '@/lib/utils';

interface TopContributorsListProps {
  contributors: Contributor[];
  maxDisplay?: number; // Optional prop to limit the number of contributors shown
}

export const TopContributorsList: React.FC<TopContributorsListProps> = ({ contributors, maxDisplay = 10 }) => {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-sm text-muted-foreground">
        <Users className="w-10 h-10 mb-2 text-muted-foreground/50" />
        No contributor data available.
      </div>
    );
  }

  const displayedContributors = contributors.slice(0, maxDisplay);

  return (
    <div className="space-y-4">
      {displayedContributors.map((contributor, index) => (
        <div key={contributor.login} className={cn(
          "flex items-center space-x-3 py-3",
          index < displayedContributors.length - 1 ? "border-b border-border/80" : ""
        )}>
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {contributor.login.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0"> {/* min-w-0 for ellipsis */}
            <a
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate flex items-center"
            >
              {contributor.login}
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
            <p className="text-xs text-muted-foreground">
              {contributor.total_contributions.toLocaleString()} contributions
              {contributor.repos_contributed_to.length > 0 && (
                <span className="truncate">
                  {' '}in {contributor.repos_contributed_to.slice(0,2).join(', ')}
                  {contributor.repos_contributed_to.length > 2 ? `, +${contributor.repos_contributed_to.length - 2} more` : ''}
                </span>
              )}
            </p>
          </div>
          {/* Optional: Rank or badge */}
           <span className="text-xs font-medium text-muted-foreground p-1.5 bg-muted rounded-md">
            #{index + 1}
          </span>
        </div>
      ))}
      {contributors.length > maxDisplay && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Showing top {maxDisplay} of {contributors.length} contributors.
        </p>
      )}
    </div>
  );
};
