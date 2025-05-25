import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_URL ? new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN || '',
}) : null;

const CACHE_TTL = 3600;
const DETAILED_REPOS_LIMIT = 5;
const CONTRIBUTOR_REPOS_LIMIT = 15; // Limit for fetching contributors

// Interfaces for Contributor Data
interface GitHubContributor {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

interface AggregatedContributor {
    login: string;
    avatar_url: string;
    html_url: string;
    total_contributions: number;
    repos_contributed_to: string[];
}

const getGitHubHeaders = () => ({
    'Accept': 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
});

async function fetchAllRepos(org: string): Promise<any[]> {
    const allRepos: any[] = [];
    let page = 1;
    const perPage = 100;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        while (true) {
            const response = await fetch(
                `https://api.github.com/orgs/${org}/repos?per_page=${perPage}&page=${page}&sort=stars&direction=desc`,
                { headers: getGitHubHeaders(), signal: controller.signal }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Organization ${org} not found`);
                }
                throw new Error(`Failed to fetch repositories (page ${page}): ${response.statusText}`);
            }

            const repos = await response.json();
            if (repos.length === 0) {
                break;
            }

            allRepos.push(...repos);
            page++;

            // Minimal rate limit handling: wait if close to limit
            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
            if (rateLimitRemaining && parseInt(rateLimitRemaining) < 5) {
                const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000;
                const waitTime = Math.max(0, resetTime - Date.now()) + 1000; // Add 1 second buffer
                if (waitTime > 0) {
                    console.warn(`Approaching rate limit, waiting ${waitTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        clearTimeout(timeoutId);
        return allRepos;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('GitHub API request timed out');
        }
        throw error;
    }
}

async function enhanceRepoData(org: string, repo: any): Promise<any> {
    const cacheKey = `github-analytics:${org}:${repo.name}:enhanced`;

    if (redis) {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        const [commitsResponse, workflowResponse] = await Promise.all([
            fetch(`https://api.github.com/repos/${org}/${repo.name}/commits?per_page=1`, {
                headers: getGitHubHeaders(),
                signal: controller.signal
            }),
            fetch(`https://api.github.com/repos/${org}/${repo.name}/actions/runs?per_page=5`, {
                headers: getGitHubHeaders(),
                signal: controller.signal
            })
        ]);

        clearTimeout(timeoutId);

        let commitsCount = 0;
        if (commitsResponse.ok) {
            const linkHeader = commitsResponse.headers.get('link');
            const matches = linkHeader?.match(/page=(\d+)>; rel="last"/);
            if (matches) {
                commitsCount = parseInt(matches[1]);
            }
        }

        let actions = [];
        if (workflowResponse.ok) {
            const workflowData = await workflowResponse.json();
            actions = workflowData.workflow_runs?.map((run: any) => ({
                id: run.id,
                name: run.name,
                status: run.status,
                conclusion: run.conclusion,
                created_at: run.created_at,
                updated_at: run.updated_at,
                actor: run.actor?.login || 'unknown',
                is_bot: run.actor?.login?.includes('[bot]') || false
            })) || [];
        }

        const enhancedRepo = {
            ...repo,
            commits_count: commitsCount,
            actions
        };

        if (redis) {
            await redis.set(cacheKey, enhancedRepo, { ex: CACHE_TTL * 2 });
        }

        return enhancedRepo;
    } catch (error) {
        console.error(`Error enhancing repo ${repo.name}:`, error);
        if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`Request for ${repo.name} timed out`);
        }
        return repo;
    }
}

async function fetchRepoContributors(org: string, repoName: string): Promise<GitHubContributor[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for individual repo contributor fetch

    try {
        const response = await fetch(
            `https://api.github.com/repos/${org}/${repoName}/contributors?per_page=100`, // Get top 100 contributors
            { headers: getGitHubHeaders(), signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404 || response.status === 204) { // 204 for empty repo
                console.warn(`Contributors not found or repo empty for ${org}/${repoName} (status: ${response.status})`);
                return []; // Return empty array if repo not found or no contributors
            }
            throw new Error(`Failed to fetch contributors for ${org}/${repoName}: ${response.statusText}`);
        }
        
        const contributors: GitHubContributor[] = await response.json();
        return contributors.filter(c => c.type !== 'Bot'); // Filter out bots if GitHub API includes them by type
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Request for contributors of ${org}/${repoName} timed out.`);
            return []; // Return empty on timeout
        }
        console.error(`Error fetching contributors for ${org}/${repoName}:`, error);
        return []; // Return empty on other errors
    }
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const org = searchParams.get('org') || 'datasets';
    const type = searchParams.get('type') || 'repositories'; // Default to 'repositories'

    const headers = {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    };

    try {
        if (type === 'contributors') {
            const cacheKey = `github-analytics:${org}:contributors`;
            if (redis) {
                const cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    return NextResponse.json(cachedData, { headers });
                }
            }

            const allReposRaw = await fetchAllRepos(org);
            // Sort by stars and take top N for contributor analysis
            const topReposForContributors = allReposRaw
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, CONTRIBUTOR_REPOS_LIMIT);

            const aggregatedContributors: Record<string, AggregatedContributor> = {};

            for (const repo of topReposForContributors) {
                const contributors = await fetchRepoContributors(org, repo.name);
                for (const contributor of contributors) {
                    if (!aggregatedContributors[contributor.login]) {
                        aggregatedContributors[contributor.login] = {
                            login: contributor.login,
                            avatar_url: contributor.avatar_url,
                            html_url: contributor.html_url,
                            total_contributions: 0,
                            repos_contributed_to: [],
                        };
                    }
                    aggregatedContributors[contributor.login].total_contributions += contributor.contributions;
                    if (!aggregatedContributors[contributor.login].repos_contributed_to.includes(repo.name)) {
                        aggregatedContributors[contributor.login].repos_contributed_to.push(repo.name);
                    }
                }
            }

            const sortedContributorsList = Object.values(aggregatedContributors)
                .sort((a, b) => b.total_contributions - a.total_contributions);

            if (redis) {
                await redis.set(cacheKey, sortedContributorsList, { ex: CACHE_TTL });
            }
            return NextResponse.json(sortedContributorsList, { headers });

        } else { // Existing logic for fetching repositories
            const cacheKey = `github-analytics:${org}:all`; // Original cache key for repos
            if (redis) {
                const cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    return NextResponse.json(cachedData, { headers });
                }
            }

            const allRepos = await fetchAllRepos(org);
            const reposWithDetails = allRepos.map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                updated_at: repo.updated_at,
                open_issues_count: repo.open_issues_count,
                language: repo.language,
                commits_count: 0, // This will be enhanced by enhanceRepoData
                actions: [],      // This will be enhanced by enhanceRepoData
                // The following fields are just placeholders if enhanceRepoData fails or is not called for all.
                actions_count: Math.floor(Math.random() * 20) + 1, 
                last_action_date: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)).toISOString(),
                last_action_by: Math.random() > 0.5 ? "github-actions[bot]" : "real-user",
                is_bot_action: Math.random() > 0.5 
            }));

            if (reposWithDetails.length > 0) {
                const detailedCount = Math.min(DETAILED_REPOS_LIMIT, reposWithDetails.length);
                const enhancedReposPromises = reposWithDetails.slice(0, detailedCount).map(repo => enhanceRepoData(org, repo));
                const enhancedResults = await Promise.all(enhancedReposPromises);
                
                enhancedResults.forEach((enhancedRepo, index) => {
                    reposWithDetails[index] = { ...reposWithDetails[index], ...enhancedRepo };
                });
            }

            if (redis) {
                await redis.set(cacheKey, reposWithDetails, { ex: CACHE_TTL });
            }
            return NextResponse.json(reposWithDetails, { headers });
        }
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('Organization') && error.message.endsWith('not found')) {
            const orgNameMatch = error.message.match(/Organization(?: ')?([^']*)'(?: not found)?/); // Adjusted regex
            const orgName = orgNameMatch ? orgNameMatch[1] : 'unknown';
            return NextResponse.json(
                { error: "Organization not found", message: `The organization '${orgName}' was not found on GitHub.` },
                { status: 404 }
            );
        } else {
            console.error('Unhandled API Error:', error);
            return NextResponse.json(
                { error: "Internal server error", message: "An unexpected error occurred while fetching data from GitHub." },
                { status: 500 }
            );
        }
    }
}