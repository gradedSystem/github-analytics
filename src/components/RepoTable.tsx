import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Box,
    Typography,
  } from "@mui/material";
  import { useState } from "react";
  import StarIcon from "@mui/icons-material/Star";
  import ForkRightIcon from "@mui/icons-material/ForkRight";
  import CodeIcon from "@mui/icons-material/Code";
  import BugReportIcon from "@mui/icons-material/BugReport";
  
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
  
  interface RepoTableProps {
    repos: Repo[];
  }
  
  export const RepoTable = ({ repos }: RepoTableProps) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100% - 52px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Repository</TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Stars
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <ForkRightIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Forks
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <CodeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Commits
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <BugReportIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Issues
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>Last Updated</TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>Last Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((repo) => (
                    <TableRow key={repo.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {repo.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{repo.stargazers_count.toLocaleString()}</TableCell>
                      <TableCell align="right">{repo.forks_count.toLocaleString()}</TableCell>
                      <TableCell align="right">{repo.commits_count.toLocaleString()}</TableCell>
                      <TableCell align="right">{repo.open_issues_count.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={repo.is_bot_action ? "Bot" : "User"}
                          color={repo.is_bot_action ? "info" : "success"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          zIndex: 2
        }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={repos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  };