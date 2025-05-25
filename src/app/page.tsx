"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Github, Star, GitFork, GitCommitHorizontal, AlertCircle, BotMessageSquare, BarChart3, PieChart as PieChartIcon, LineChartIcon, GitMerge, MessageSquare, StarIcon as LucideStarIcon, AlertTriangle } from "lucide-react"; // Added more icons
import { StatsCard } from "@/components/StatsCard";
import { RepoTable } from "@/components/RepoTable";
import { TopReposChart } from "@/components/TopReposChart";
import { IssuesOverviewChart } from "@/components/IssuesOverviewChart";
import { StarsOverTimeChart } from "@/components/StarsOverTimeChart";
import { CommitActivityChart } from "@/components/CommitActivityChart";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { TopContributorsList } from "@/components/TopContributorsList"; // Import the new component

interface Repo {
    id: number;
    name: string;
    html_url: string; 
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    commits_count: number; 
    open_issues_count: number;
    language?: string; 
    actions_count?: number;
    last_action_date?: string;
    last_action_by?: string;
    is_bot_action?: boolean;
}

// Define Contributor interface
interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    total_contributions: number;
    repos_contributed_to: string[];
}

// Define Action interface for the timeline
export interface Action {
    id: string;
    repoName: string;
    type: "Commit" | "Issue Opened" | "PR Merged" | "New Star" | "Security Alert";
    actor: string;
    time: string; // e.g., "2 hours ago", "Yesterday"
    isBot: boolean;
    details?: string;
    repo_url?: string; // For linking to the repo
}


export default function Dashboard() {
    // const theme = useTheme(); // Removed useTheme
    const [org, setOrg] = useState("datasets");
    const [repos, setRepos] = useState<Repo[]>([]); 
    const [contributors, setContributors] = useState<Contributor[]>([]); // New state for contributors
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputOrg, setInputOrg] = useState("datasets");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setRepos([]); // Clear previous repo data
        setContributors([]); // Clear previous contributor data
        
        try {
            const [repoResponse, contributorResponse] = await Promise.all([
                axios.get(`/api/github?org=${org}&type=repositories`),
                axios.get(`/api/github?org=${org}&type=contributors`)
            ]);

            if (repoResponse.data) {
                setRepos(repoResponse.data);
            } else {
                console.warn("No repository data received");
                // Optionally set a specific part of an error state if needed
            }

            if (contributorResponse.data) {
                setContributors(contributorResponse.data);
            } else {
                console.warn("No contributor data received");
                 // Optionally set a specific part of an error state if needed
            }
            
            setLastUpdated(new Date());

        } catch (err: any) {
            console.error("Error fetching data:", err);
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 404) {
                    // Check if the error is from the backend's specific format
                    if (err.response.data.error === "Organization not found") {
                         errorMessage = `The GitHub organization '${org}' could not be found. Please check the spelling and try again.`;
                    } else {
                        errorMessage = `Error ${err.response.status}: ${err.response.data.message || 'One or more resources not found.'}`;
                    }
                } else {
                    errorMessage = `Error fetching data: ${err.response.data.message || 'Server error'}. Please try again later.`;
                }
            } else if (err.message.includes('Network Error')) {
                 errorMessage = "A network error occurred. Please check your connection and try again.";
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [org]);

    useEffect(() => {
        if (org) fetchData(); // Fetch data when org changes (and is not empty)
        // Removed interval refresh for simplicity in this step, can be added back if needed for both endpoints
    }, [fetchData, org]);

    const handleOrgSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOrg(inputOrg);
    };

    const totalStats = useMemo(() => {
        return {
            repositories: repos.length,
            stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
            commits: repos.reduce((sum, repo) => sum + repo.commits_count, 0), // Assuming commits_count is available
            issues: repos.reduce((sum, repo) => sum + repo.open_issues_count, 0),
            botActions: repos.filter(repo => repo.is_bot_action).length, // Assuming is_bot_action is available
        };
    }, [repos]);

    const topReposByStars = useMemo(() => {
        return [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5) // Take top 5 for the chart as per TopReposChart's default topN
            .map(repo => ({
                name: repo.name.length > 15 ? `${repo.name.substring(0, 12)}...` : repo.name,
                Stars: repo.stargazers_count,
            }));
    }, [repos]);

    const topReposByIssues = useMemo(() => {
        return [...repos]
            .filter(repo => repo.open_issues_count > 0)
            .sort((a, b) => b.open_issues_count - a.open_issues_count)
            .slice(0, 7) // Take top 7 repos with issues
            .map(repo => ({
                name: repo.name.length > 18 ? `${repo.name.substring(0, 15)}...` : repo.name,
                value: repo.open_issues_count, 
            }));
    }, [repos]);

    const { simulatedStarsData, starsOverTimeRepoNames } = useMemo(() => {
        const topNForSimulatedChart = 3;
        const selectedRepos = [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, topNForSimulatedChart);

        if (selectedRepos.length === 0) {
            return { simulatedStarsData: [], starsOverTimeRepoNames: [] };
        }
        
        const repoNames = selectedRepos.map(repo => repo.name.length > 15 ? `${repo.name.substring(0,12)}...` : repo.name);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const data = months.map((month, monthIndex) => {
            const timePoint: { time: string; [key: string]: number | string } = { time: month };
            selectedRepos.forEach((repo, repoIndex) => {
                // Simulate a growth pattern - this is highly simplified
                const baseStars = repo.stargazers_count;
                // Start from a lower value and grow towards the current count
                const simulatedStars = Math.round(baseStars * (0.5 + (0.5 * (monthIndex + 1) / months.length)) * (1 + (Math.random() - 0.5) * 0.2) ); // Add some randomness
                 timePoint[repoNames[repoIndex]] = Math.max(0, simulatedStars); // Ensure stars are not negative
            });
            return timePoint;
        });
        return { simulatedStarsData: data, starsOverTimeRepoNames: repoNames };
    }, [repos]);

    const { simulatedCommitData, commitActivityRepoNames } = useMemo(() => {
        const topNForSimulatedChart = 3; // Show top 3 repos by commit count
        // Sort by commits_count, but ensure it's a valid number (fallback for undefined/null)
        const selectedRepos = [...repos]
            .sort((a, b) => (b.commits_count || 0) - (a.commits_count || 0))
            .slice(0, topNForSimulatedChart);

        if (selectedRepos.length === 0) {
            return { simulatedCommitData: [], commitActivityRepoNames: [] };
        }
        
        const repoNames = selectedRepos.map(repo => repo.name.length > 15 ? `${repo.name.substring(0,12)}...` : repo.name);

        // Simulate data for the last 6 weeks
        const weeks = ["Week -5", "Week -4", "Week -3", "Week -2", "Last Week", "This Week"];
        const data = weeks.map((week) => {
            const timePoint: { time: string; [key: string]: number | string } = { time: week };
            selectedRepos.forEach((repo, repoIndex) => {
                // Simulate commit activity - assuming commits_count is a total or recent high.
                // This simulation distributes a fraction of total commits over weeks with randomness.
                const totalCommits = repo.commits_count || 0; // Use 0 if undefined
                // Average weekly commits (highly simplified) with some randomness
                const simulatedCommits = Math.round( (totalCommits / (50 * (1 + Math.random()*0.5))) * (0.7 + Math.random() * 0.6) * (10 + Math.random() * 20) );
                timePoint[repoNames[repoIndex]] = Math.max(0, simulatedCommits); // Ensure non-negative
            });
            return timePoint;
        });
        return { simulatedCommitData: data, commitActivityRepoNames: repoNames };
    }, [repos]);

    const recentActivityData = useMemo(() => {
        const activities: Action[] = [];
        if (repos.length === 0) return activities;

        const actionTypes: Action['type'][] = ["Commit", "Issue Opened", "PR Merged", "New Star", "Security Alert"];
        const users = ["user123", "devGal", "codeNinja", "gitMaster", "hubStar", "dependabot[bot]", "github-actions[bot]"];
        const times = ["Just now", "5m ago", "30m ago", "1h ago", "3h ago", "Yesterday", "2d ago"];
        
        const numActions = Math.min(repos.length, 7); // Generate up to 7 actions

        for (let i = 0; i < numActions; i++) {
            const repo = repos[i % repos.length]; // Cycle through repos if fewer than numActions
            const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            const actor = users[Math.floor(Math.random() * users.length)];
            const time = times[i % times.length];
            const isBot = actor.includes("[bot]");
            let details = "";

            switch(actionType) {
                case "Commit":
                    details = `[${repo.name.split('/')[1] || 'main'}] New commit: ${Math.random().toString(36).substring(2, 8)}`;
                    break;
                case "Issue Opened":
                    details = `Issue #${Math.floor(Math.random() * 100) + 1} opened: "Bug in feature X"`;
                    break;
                case "PR Merged":
                    details = `Pull request #${Math.floor(Math.random() * 50) + 1} merged: "Add new feature Y"`;
                    break;
                case "New Star":
                    details = `${actor} starred ${repo.name}`;
                    break;
                case "Security Alert":
                    details = `Critical vulnerability found in dependency Z`;
                    break;
            }

            activities.push({
                id: `${repo.id}-${i}-${Date.now()}`, // Unique ID
                repoName: repo.name,
                repo_url: repo.html_url,
                type: actionType,
                actor,
                time,
                isBot,
                details
            });
        }
        // Sort by a pseudo-time (index in `times` array for simplicity)
        return activities.sort((a,b) => times.indexOf(a.time) - times.indexOf(b.time));
    }, [repos]);


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                    GitHub Analytics: {org}
                </h1>
                {lastUpdated && (
                    <p className="text-sm text-muted-foreground mt-1">
                        Last updated: {lastUpdated.toLocaleString()}
                    </p>
                )}
            </header>

            <form onSubmit={handleOrgSubmit} className="mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border border-border rounded-lg bg-card shadow-sm">
                <div className="w-full sm:flex-grow">
                    <Label htmlFor="orgInput" className="mb-1.5 block text-sm font-medium text-foreground">GitHub Organization</Label>
                    <Input
                        id="orgInput"
                        type="text"
                        value={inputOrg}
                        onChange={(e) => setInputOrg(e.target.value)}
                        placeholder="e.g., facebook, vercel"
                        className="w-full"
                    />
                </div>
                <Button type="submit" disabled={loading || !inputOrg} className="w-full sm:w-auto">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze"
                    )}
                </Button>
            </form>

            {loading && !error && ( // Display global loading indicator only if not superseded by an error
                <div className="flex flex-col items-center justify-center text-muted-foreground p-6">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
                    <p className="text-lg font-medium">Loading repository data...</p>
                    <p className="text-sm">Please wait while we fetch the information.</p>
                </div>
            )}

            {error && (
                <Card className="mb-6 border-destructive bg-destructive/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-destructive flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            Request Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive/90">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Placeholder for content that will be rebuilt with Shadcn/ui - only show if not loading and no error */}
            {!loading && !error && (
            <div className="space-y-6">
                {/* Stats Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatsCard 
                        title="Repositories" 
                        value={totalStats.repositories} 
                        icon={<Github className="h-4 w-4" />} 
                        description="Total public repositories"
                    />
                    <StatsCard 
                        title="Stars" 
                        value={totalStats.stars} 
                        icon={<Star className="h-4 w-4" />}
                        description="Total stars across all repos"
                    />
                    <StatsCard 
                        title="Forks" 
                        value={totalStats.forks} 
                        icon={<GitFork className="h-4 w-4" />}
                        description="Total forks across all repos"
                    />
                    <StatsCard 
                        title="Commits" 
                        value={totalStats.commits} 
                        icon={<GitCommitHorizontal className="h-4 w-4" />}
                        description="Total commits (simulated/aggregated)"
                    />
                    <StatsCard 
                        title="Open Issues" 
                        value={totalStats.issues} 
                        icon={<AlertCircle className="h-4 w-4" />}
                        description="Total open issues"
                    />
                    <StatsCard 
                        title="Bot Actions" 
                        value={totalStats.botActions} 
                        icon={<BotMessageSquare className="h-4 w-4" />}
                        description="Actions triggered by bots"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                                Top Repositories by Stars
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TopReposChart data={topReposByStars} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <PieChartIcon className="mr-2 h-5 w-5 text-primary" /> {/* Use imported PieChartIcon */}
                                Issues Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <IssuesOverviewChart data={topReposByIssues} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
                                Stars Over Time (Simulated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StarsOverTimeChart data={simulatedStarsData} repoNames={starsOverTimeRepoNames} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                                Commit Activity (Simulated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CommitActivityChart data={simulatedCommitData} repoNames={commitActivityRepoNames} />
                        </CardContent>
                    </Card>
                </div>

                {/* Repositories Table Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">All Repositories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RepoTable repos={repos} />
                    </CardContent>
                </Card>
                </div>

                {/* Lower Section: All Repositories Table and Recent Activity Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2"> {/* RepoTable takes 2/3 width on large screens */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">All Repositories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RepoTable repos={repos} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1"> 
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ActivityTimeline actions={recentActivityData} />
                            </CardContent>
                        </Card>
                    </div>
                     {/* Top Contributors Card - to be added if contributors data is available */}
                     {contributors.length > 0 && (
                        <div className="lg:col-span-1">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Top Contributors</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TopContributorsList contributors={contributors} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            )}
            {/* Example of how repo data might be displayed minimally, if needed for debugging */}
            {/* <pre className="mt-4 p-4 bg-muted rounded-md text-xs overflow-x-auto">
                {JSON.stringify(repos.slice(0,2), null, 2)}
            </pre> */}
        </div>
    );
}
