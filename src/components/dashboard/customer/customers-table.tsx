'use client';

import * as React from 'react';
import { Button, InputAdornment, OutlinedInput } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';

import { CustomersFilters } from './customers-filters';

function noop(): void {
  // do nothing
}

export interface Customer {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  solde: number;
  createdAt: Date;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CustomersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    console.log('rows', rows);

    return rows.map((customer) => customer.studentId);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;
  const handleAddButtonClick = async () => {
    // Collect the selected student IDs
    const selectedIds = Array.from(selected);

    if (selectedIds.length > 0) {
      try {
        // Send the selected student IDs to the endpoint
        const response = await fetch('http://192.168.1.224:5000/api/students/incrementSolde', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentIds: selectedIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to update students solde');
        }

        // If the request is successful, refresh the page
        window.location.reload();
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the students solde');
      }
    } else {
      alert('No students selected');
    }
  };

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={3} justifyContent={'space-between'} alignItems={'center'}>
          <OutlinedInput
            defaultValue=""
            fullWidth
            placeholder="Rechercher Etudiant"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ maxWidth: '500px' }}
          />
          <div>
            {selected?.size > 0 && (
              <Button
                startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                variant="contained"
                onClick={handleAddButtonClick}
              >
                Add
              </Button>
            )}
          </div>
        </Stack>
      </Card>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Nom & Prenom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Université</TableCell>
                <TableCell>Solde</TableCell>
                <TableCell>Date Inscription</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.studentId);

                return (
                  <TableRow hover key={row.studentId} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            selectOne(row.studentId);
                          } else {
                            deselectOne(row.studentId);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Typography variant="subtitle2">{row.firstName + ' ' + row.lastName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.university}</TableCell>
                    <TableCell>{row.solde}</TableCell>
                    <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          labelRowsPerPage="Lignes par page"
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </>
  );
}
