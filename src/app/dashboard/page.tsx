'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

// Add DialogContent and DialogActions here

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';
import { PlanifierRepasModal } from '@/components/PlanifierRepasModal';

async function getLatestSessionStats() {
  const sessionRes = await fetch('http://192.168.1.224:5000/api/sessions/');
  const sessions = await sessionRes.json();

  if (!sessions.length) {
    throw new Error('No sessions found.');
  }
  const latestSession = sessions.sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  console.log(latestSession, 'latestSession');
  const { numberOfStudentsRegistered, numberOfStudentsCheckedIn, initialWeight, _id: sessionId } = latestSession;

  const checkInRes = await fetch('http://192.168.1.224:5000/api/checkins/');
  const checkIns = await checkInRes.json();

  const matchingCheckIn = checkIns.find(
    (checkIn: any) => checkIn?.session?._id?.toString() === sessionId
  );
  
  if (!matchingCheckIn) {
    // No check-in yet for the session (new session without any check-ins)
    return {
      sessionId,
      numberOfStudentsRegistered,
      numberOfStudentsCheckedIn: 0,
      initialWeightPerStudent: initialWeight,
      totalInitialWeight: 0,
      totalWasteWeight: 0,
      wastePercentage: 0,
      checkInId: null,
    };
  }

  const totalWasteWeight = matchingCheckIn.students.reduce((sum: number, studentCheckIn: any) => {
    const studentWasteWeight = ((studentCheckIn.percentage || 0) / 100) * initialWeight;
    return sum + studentWasteWeight;
  }, 0);

  const totalInitialWeight = numberOfStudentsCheckedIn * initialWeight;

  const wastePercentage = totalInitialWeight > 0 ? (totalWasteWeight / totalInitialWeight) * 100 : 0;

  return {
    sessionId,
    numberOfStudentsRegistered,
    numberOfStudentsCheckedIn,
    initialWeightPerStudent: initialWeight,
    totalInitialWeight,
    totalWasteWeight,
    wastePercentage,
    checkInId: matchingCheckIn._id,
  };
}

async function getSessionStats(sessionId: string) {
  const sessionRes = await fetch(`http://192.168.1.224:5000/api/sessions/${sessionId}`);
  const session = await sessionRes.json();

  const checkInRes = await fetch('http://192.168.1.224:5000/api/checkins/');
  const checkIns = await checkInRes.json();

  const matchingCheckIn = checkIns.find((checkIn: any) => checkIn.session._id.toString() === sessionId);

  if (!matchingCheckIn) {
    return {
      sessionId,
      numberOfStudentsRegistered: session.numberOfStudentsRegistered,
      numberOfStudentsCheckedIn: 0,
      initialWeightPerStudent: session.initialWeight,
      totalInitialWeight: 0,
      totalWasteWeight: 0,
      wastePercentage: 0,
      checkInId: null,
    };
  }

  const totalWasteWeight = matchingCheckIn.students.reduce((sum: number, studentCheckIn: any) => {
    const studentWasteWeight = (((studentCheckIn.percentage || 0) / 100) * session.initialWeight) / 1000;
    return sum + studentWasteWeight;
  }, 0);

  const totalInitialWeight = session.numberOfStudentsCheckedIn * session.initialWeight;

  const wastePercentage = totalInitialWeight > 0 ? (totalWasteWeight / totalInitialWeight) * 100 : 0;

  return {
    sessionId,
    numberOfStudentsRegistered: session.numberOfStudentsRegistered,
    numberOfStudentsCheckedIn: session.numberOfStudentsCheckedIn,
    initialWeightPerStudent: session.initialWeight,
    totalInitialWeight,
    totalWasteWeight,
    wastePercentage,
    checkInId: matchingCheckIn._id,
  };
}
async function finalizeSessionStats(sessionId: string) {
  const sessionRes = await fetch(`http://192.168.1.224:5000/api/sessions/${sessionId}`);
  const session = await sessionRes.json();

  const checkInRes = await fetch('http://192.168.1.224:5000/api/checkins/');
  const checkIns = await checkInRes.json();

  const matchingCheckIn = checkIns.find((checkIn: any) => checkIn.session._id.toString() === sessionId);

  const numberOfStudentsRegistered = session.numberOfStudentsRegistered;
  const numberOfStudentsCheckedIn = session.numberOfStudentsCheckedIn;
  const initialWeightPerStudent = session.initialWeight;

  let totalWasteWeight = 0;
  let totalInitialWeight = numberOfStudentsRegistered * initialWeightPerStudent;

  if (matchingCheckIn) {
    // Waste from students who checked in
    totalWasteWeight = matchingCheckIn.students.reduce((sum: number, studentCheckIn: any) => {
      const studentWasteWeight = ((studentCheckIn.percentage || 0) / 100) * initialWeightPerStudent;
      return sum + studentWasteWeight;
    }, 0);
  }

  // Waste from students who DID NOT check in (100% waste for each)
  const numberOfStudentsNotCheckedIn = numberOfStudentsRegistered - numberOfStudentsCheckedIn;
  const wasteFromNoShows = numberOfStudentsNotCheckedIn * initialWeightPerStudent;

  // Add their waste to the total
  totalWasteWeight += wasteFromNoShows;

  // Waste percentage
  const wastePercentage = totalInitialWeight > 0 ? (totalWasteWeight / totalInitialWeight) * 100 : 0;

  return {
    sessionId,
    numberOfStudentsRegistered: 0,
    numberOfStudentsCheckedIn,
    initialWeightPerStudent,
    totalInitialWeight,
    totalWasteWeight,
    wastePercentage,
    checkInId: matchingCheckIn ? matchingCheckIn._id : null,
  };
}

interface Session {
  day: string;
  type: string;
  sessionId: string;
  createdAt: string;
}

const fetchOffersAndBusinesses = async () => {
  try {
    const offersResponse = await fetch('http://192.168.1.224:5000/api/admin/offers');
    if (!offersResponse.ok) {
      throw new Error('Failed to fetch offers');
    }
    const offersData = await offersResponse.json();

    // Step 2: Fetch the business name for each offer and add an incremental id
    const offersWithBusinessDetails = await Promise.all(
      offersData
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(async (offer: any, index: number) => {
          try {
            const businessId = offer.business;
            const businessResponse = await fetch(`http://192.168.1.224:5000/api/businesses/${businessId}`);
            if (!businessResponse.ok) {
              console.warn(`Business ${businessId} not found`);
              return {
                id: index + 1,
                ...offer,
                companyName: null,
              };
            }
            const businessData = await businessResponse.json();
            return {
              id: index + 1,
              ...offer,
              companyName: businessData.companyName,
            };
          } catch (error) {
            console.error('Error fetching business:', error);
            return {
              id: index + 1,
              ...offer,
              companyName: null,
            };
          }
        })
    );
    

    // Return the offers with their respective business names and assigned ids
    return offersWithBusinessDetails;
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while fetching offers and business details.');
    return [];
  }
};

export default function Page(): React.JSX.Element {
  const [stats, setStats] = useState<null | Awaited<ReturnType<typeof getLatestSessionStats>>>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [isTerminerRepasClicked, setIsTerminerRepasClicked] = useState(false);
  const [isPlanifierModalOpen, setIsPlanifierModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [openQrModal, setOpenQrModal] = useState(false); // State to control modal visibility
  console.log(sessions);
  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getLatestSessionStats();
        setStats(data);
        console.log('Latest session stats:', data);
        if (data.sessionId) {
          QRCode.toDataURL(data.sessionId)
            .then((url) => {
              setQrImageUrl(url); // Set the generated QR image URL
            })
            .catch((err) => {
              console.error('Failed to generate QR Code:', err);
            });
        }
      } catch (error) {
        console.error('Failed to fetch session stats:', error);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('http://192.168.1.224:5000/api/sessions/');
        const data = await response.json();

        if (data && data.length) {
          const sortedSessions = data.sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          const formattedSessions = sortedSessions.map(
            (session: { day: string; sessionId: string; type: string; date: string }, index: number) => ({
              id: `MEAL-${String(index + 1).padStart(3, '0')}`,
              name: `${session.day} | ${
                session.type === 'lunch' ? 'déjeuner' : session.type === 'dinner' ? 'diner' : session.type
              }`,
              sessionId: session.sessionId,
              date: new Date(session.date),
            })
          );
          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }

    fetchSessions();
  }, []);
  useEffect(() => {
    const loadOffers = async () => {
      const offersData = await fetchOffersAndBusinesses();
      setOffers(offersData);
    };

    loadOffers();
  }, []);

  if (!stats) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }
  return (
    <Grid container spacing={3}>
      {isTerminerRepasClicked ? (
        <Grid container item xs={16} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button size="medium" color="primary" variant="contained" onClick={() => setIsPlanifierModalOpen(true)}>
            Planifier Repas
          </Button>
        </Grid>
      ) : (
        <>
          <Grid lg={3} sm={6} xs={12}>
            <Budget diff={12} trend="up" sx={{ height: '100%' }} value={stats.numberOfStudentsCheckedIn} />
          </Grid>
          <Grid lg={3} sm={6} xs={12}>
            <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} value={stats.numberOfStudentsRegistered} />
          </Grid>
          <Grid lg={3} sm={6} xs={12}>
            <TasksProgress sx={{ height: '100%' }} value={stats.wastePercentage} />
          </Grid>
          <Grid lg={3} sm={6} xs={12}>
            <TotalProfit sx={{ height: '100%' }} value={stats.totalWasteWeight} />
          </Grid>
        </>
      )}

      {qrImageUrl && (
        <Grid
          container
          item
          xs={12}
          sx={{ display: 'flex', justifyContent: 'center' }}
          onClick={() => setOpenQrModal(true)}
        >
          <img src={qrImageUrl} alt="Session QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
        </Grid>
      )}
      <Grid
        container
        item
        xs={16}
        sx={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '1rem', marginBottom: '0' }}
      >
        {isTerminerRepasClicked ? (
          <></>
        ) : (
          <>
            <Button
              size="medium"
              color="success"
              variant="contained"
              onClick={async () => {
                setIsTerminerRepasClicked(true);
                if (stats?.sessionId) {

                  console.log('Finalizing session', stats.sessionId);
                  const finalizedStats = await finalizeSessionStats(stats.sessionId);

                  try {
                    const res = await fetch(`http://192.168.1.224:5000/api/sessions/${stats.sessionId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        wasteWeight: finalizedStats.totalWasteWeight,
                        numberOfStudentsRegistered: finalizedStats.numberOfStudentsRegistered,
                        numberOfStudentsCheckedIn: finalizedStats.numberOfStudentsCheckedIn,
                      }),
                    });

                    if (!res.ok) {
                      throw new Error('Failed to update session.');
                    }

                    console.log('Session successfully updated.');

                    const updatedStats = await getSessionStats(stats.sessionId); // 👈 Fetch fresh data from backend
                    setStats(updatedStats); // 👈 Update with fresh stats
                    console.log('rrrrrrrrrrrrr', updatedStats);
                  } catch (error) {
                    console.error('Error updating session:', error);
                  }
                }
              }}
            >
              Terminer Repas
            </Button>
          </>
        )}
      </Grid>
      <Dialog open={openQrModal} onClose={() => setOpenQrModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Code QR du Repas</DialogTitle>
        <DialogContent>
          <img
            src={qrImageUrl}
            alt="Session QR Code"
            style={{ width: '100%', height: 'auto', overflow: 'none' }} // Full width for larger view
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrModal(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      {/* <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={[63, 15, 22]} labels={['Desktop', 'Tablet', 'Phone']} sx={{ height: '100%' }} />
      </Grid> */}
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={sessions}
          sx={{ height: '100%' }}
          onSessionClick={async (sessionId: string) => {
            const selectedSessionStats = await getSessionStats(sessionId);
            setStats(selectedSessionStats);
            console.log(sessionId);
          }}
        />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <Grid lg={8} md={12} xs={12}>
          <LatestOrders orders={offers} />
        </Grid>
      </Grid>
      <PlanifierRepasModal open={isPlanifierModalOpen} onClose={() => setIsPlanifierModalOpen(false)} />
    </Grid>
  );
}
