import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { ExternalLink } from 'lucide-react';

// This interface should align with the one in page.tsx
interface Repo {
  id: number;
  name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  commits_count: number; 
  language?: string;      
}

interface RepoTableProps {
  repos: Repo[];
}

export const RepoTable: React.FC<RepoTableProps> = ({ repos }) => {
  if (!repos || repos.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No repository data to display.</p>;
  }

  // Display only a subset of repos if the list is too long, e.g., top 25 by stars.
  // This is a temporary measure until pagination or virtualization is implemented.
  const displayedRepos = repos.length > 25 ? repos.slice(0, 25) : repos;

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        {repos.length > 10 && (
            <TableCaption className="py-3 text-sm">
                Showing {displayedRepos.length} of {repos.length} repositories.
                {repos.length > displayedRepos.length && " (Full list truncated for performance)"}
            </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Name</TableHead>
            <TableHead className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Stars</TableHead>
            <TableHead className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Forks</TableHead>
            <TableHead className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Open Issues</TableHead>
            <TableHead className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Commits</TableHead>
            <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Language</TableHead>
            <TableHead className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedRepos.map((repo) => (
            <TableRow key={repo.id} className="hover:bg-muted/50">
              <TableCell className="font-medium whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-primary flex items-center group text-sm"
                >
                  {repo.name}
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">{repo.stargazers_count.toLocaleString()}</TableCell>
              <TableCell className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">{repo.forks_count.toLocaleString()}</TableCell>
              <TableCell className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">{repo.open_issues_count.toLocaleString()}</TableCell>
              <TableCell className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">{repo.commits_count.toLocaleString()}</TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">{repo.language || 'N/A'}</TableCell>
              <TableCell className="text-right whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-sm">
                {new Date(repo.updated_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
