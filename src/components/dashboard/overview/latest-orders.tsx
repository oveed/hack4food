'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

const statusMap = {
  pending: { label: 'En cours', color: 'warning' },
  accepted: { label: 'Accepté', color: 'success' },
  rejected: { label: 'Réfusé', color: 'error' },
} as const;

export interface Order {
  id: string;
  _id: string;
  companyName: string;
  phone: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  const router = useRouter();
  const handleAccept = async (orderId: string) => {
    try {
      const response = await fetch(`http://192.168.1.224:5000/api/admin/approve/${orderId}`, {
        method: 'PATCH', // Assuming it's a POST request, change to PUT or DELETE if needed
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers, like token if required
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept the order');
      }

      const data = await response.json();
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while accepting the order.');
    }
  };
  const handleReject = async (orderId: string) => {
    try {
      const response = await fetch(`http://192.168.1.224:5000/api/admin/reject/${orderId}`, {
        method: 'PATCH', // Assuming it's a POST request, change to PUT or DELETE if needed
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers, like token if required
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept the order');
      }

      const data = await response.json();
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while accepting the order.');
    }
  };
  console.log(orders, 'orders');
  return (
    <Card sx={sx}>
      <CardHeader title="Offres Récents" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Offre</TableCell>
              <TableCell>Société</TableCell>
              <TableCell sortDirection="desc">Numéro</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const { label, color } = statusMap[order.status] ?? { label: 'Unknown', color: 'default' };

              return (
                <TableRow hover key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.companyName}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => handleAccept(order._id)}
                          sx={{ mr: 1 }}
                        >
                          Accepter
                        </Button>
                        <Button size="small" color="error" variant="contained" onClick={() => handleReject(order._id)}>
                          Rejecter
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Voir tous
        </Button>
      </CardActions>
    </Card>
  );
}
