"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Tooltip,
    IconButton,
    useTheme,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { StatsCard } from "../components/StatsCard";
import { RepoTable } from "../components/RepoTable";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { TopReposChart } from "../components/TopReposChart";
import { IssuesOverviewChart } from "../components/IssuesOverviewChart";
import { StarsOverTimeChart } from "../components/StarsOverTimeChart";
import { CommitActivityChart } from "../components/CommitActivityChart";

interface Repo {
    id: number;
    name: string;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    commits_count: number;
    open_issues_count: number;
    actions_count?: number;
    last_action_date?: string;
    last_action_by?: string;
    is_bot_action?: boolean;
}

export default function Dashboard() {
    const theme = useTheme();
    const [org, setOrg] = useState("datasets");
    const [repos, setRepos] = useState<Repo[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputOrg, setInputOrg] = useState("datasets");

    const fetchRepos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(`/api/github?org=${org}`);
            setRepos(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch repository data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [org]);

    useEffect(() => {
        fetchRepos();
        const interval = setInterval(fetchRepos, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchRepos]);

    const handleOrgSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOrg(inputOrg);
    };

    const totalStats = useMemo(() => {
        return {
            repositories: repos.length,
            stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
            commits: repos.reduce((sum, repo) => sum + repo.commits_count, 0),
            issues: repos.reduce((sum, repo) => sum + repo.open_issues_count, 0),
            botActions: repos.filter(repo => repo.is_bot_action).length,
        };
    }, [repos]);

    const topReposByStars = useMemo(() => {
        return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
    }, [repos]);

    const topReposByCommits = useMemo(() => {
        return [...repos].sort((a, b) => b.commits_count - a.commits_count).slice(0, 10);
    }, [repos]);

    const topReposByIssues = useMemo(() => {
        return [...repos].sort((a, b) => b.open_issues_count - a.open_issues_count).slice(0, 10);
    }, [repos]);

    const recentActions = useMemo(() => {
        return [...repos]
            .filter(repo => repo.last_action_date)
            .sort((a, b) => {
                const dateA = a.last_action_date ? new Date(a.last_action_date) : new Date(Date.now() - 31536000000);
                const dateB = b.last_action_date ? new Date(b.last_action_date) : new Date(Date.now() - 31536000000);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 10);
    }, [repos]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <GitHubIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        GitHub Analytics: {org}
                    </Typography>
                </Box>
                <Box>
                    {lastUpdated && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Last updated: {lastUpdated.toLocaleString()}
                            <Tooltip title="Refresh data">
                                <IconButton size="small" onClick={fetchRepos} disabled={loading} sx={{ ml: 1 }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                    )}
                </Box>
            </Box>

            <Paper component="form" onSubmit={handleOrgSubmit} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
                <TextField
                    label="GitHub Organization"
                    variant="outlined"
                    value={inputOrg}
                    onChange={(e) => setInputOrg(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mr: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !inputOrg}
                >
                    {loading ? <CircularProgress size={24} /> : "Analyze"}
                </Button>
            </Paper>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Repositories" value={totalStats.repositories} icon={<GitHubIcon />} color={theme.palette.primary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Stars" value={totalStats.stars} icon={<StarIcon />} color={theme.palette.warning.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Forks" value={totalStats.forks} icon={<ForkRightIcon />} color={theme.palette.secondary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Commits" value={totalStats.commits} icon={<CodeIcon />} color={theme.palette.success.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Open Issues" value={totalStats.issues} icon={<BugReportIcon />} color={theme.palette.error.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <StatsCard title="Bot Actions" value={totalStats.botActions} icon={<RefreshIcon />} color={theme.palette.info.main} />
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400, }}>
                        <Typography variant="h6" gutterBottom>Top Repositories</Typography>
                        <TopReposChart repos={topReposByStars} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400, }}>
                        <Typography variant="h6" gutterBottom>Issues Overview</Typography>
                        <IssuesOverviewChart repos={topReposByIssues} />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350, }}>
                        <Typography variant="h6" gutterBottom>Stars Over Time (Simulated)</Typography>
                        <StarsOverTimeChart repos={topReposByStars.slice(0, 3)} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350, }}>
                        <Typography variant="h6" gutterBottom>Commit Activity (Simulated)</Typography>
                        <CommitActivityChart repos={topReposByCommits.slice(0, 3)} />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>Recent Actions</Typography>
                        <ActivityTimeline actions={recentActions} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>All Repositories</Typography>
                        <RepoTable repos={repos} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}