// LatestOrders.tsx
'use client';
import * as React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: string;
  createdAt: Date;
}

interface LatestOrdersProps {
  orders: Order[];
  sx?: object;
}

export function LatestOrders({ orders, sx }: LatestOrdersProps) {
  const handleAccept = (orderId: string) => {
    console.log(`Accepted order ${orderId}`);
    // You can later call an API to change the status if needed
  };

  const handleReject = (orderId: string) => {
    console.log(`Rejected order ${orderId}`);
    // You can later call an API to change the status if needed
  };
  console.log('first');

  return (
    <div style={{ ...sx }}>
      <Typography variant="h6" gutterBottom>
        Latest Orders
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            console.log(order.status); 
            return (
              <TableRow key={order.id}>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>${order.amount.toFixed(2)}</TableCell>
               
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
