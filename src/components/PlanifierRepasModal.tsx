'use client';

import * as React from 'react';
import { Modal, Box, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl, Stack } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';  // important for French
dayjs.locale('fr');
interface PlanifierRepasModalProps {
  open: boolean;
  onClose: () => void;
}

const foodOptions = [
  'Salade Méchouia',
  'Salade Tunisienne',
  'Brik à l\'œuf',
  'Chorba',
  'Couscous',
  'Makloub',
  'Ojja',
  'Kafteji',
  'Pâtes',
  'Tajine',
  'Riz au poulet',
  'Poisson grillé',
];

export const PlanifierRepasModal: React.FC<PlanifierRepasModalProps> = ({ open, onClose }) => {
    const [selectedFoods, setSelectedFoods] = React.useState<string[]>([]);
    const [foodWeights, setFoodWeights] = React.useState<{ [key: string]: number }>({});
    const [mealType, setMealType] = React.useState<'lunch' | 'dinner'>('lunch');
    const [date, setDate] = React.useState(dayjs().format('YYYY-MM-DD'));
    const [day, setDay] = React.useState(dayjs().format('dddd')); // "lundi", "mardi", etc.
    
    React.useEffect(() => {
      setDay(dayjs(date).format('dddd')); // update day when date changes
    }, [date]); // <-- watch `date` state for changes
  
    const handleFoodChange = (event: any) => {
      setSelectedFoods(event.target.value);
    };
  
    const handleWeightChange = (food: string, weight: number) => {
      setFoodWeights((prev) => ({
        ...prev,
        [food]: weight,
      }));
    };
  
    const calculateTotalWeight = () => {
      return Object.values(foodWeights).reduce((total, weight) => total + (weight || 0), 0);
    };
  
    const handleSubmit = async () => {
      const sessionData = {
        date: new Date(date).toISOString(), // ISO format
        day,  // Automatically updated when date changes
        meal: selectedFoods,
        type: mealType,
        initialWeight: calculateTotalWeight(),
      };
    
      try {
        const res = await fetch('http://192.168.1.224:5000/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });
    
        if (!res.ok) {
          throw new Error('Failed to create session');
        }
    
        alert('Session created successfully!');
        onClose();
      } catch (error) {
        console.error(error);
        alert('Error creating session');
      }
    };
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Planifier un Nouveau Repas
          </Typography>
  
          <Stack spacing={2}>
            <TextField
              label="Jour"
              value={day}
              onChange={(e) => {
                const newDate = e.target.value;
                setDate(newDate); // This will automatically update the `day`
              }}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Type de repas</InputLabel>
              <Select value={mealType} onChange={(e) => setMealType(e.target.value as 'lunch' | 'dinner')}>
                <MenuItem value="lunch">Déjeuner</MenuItem>
                <MenuItem value="dinner">Dîner</MenuItem>
              </Select>
            </FormControl>
  
            <FormControl fullWidth>
              <InputLabel>Plats</InputLabel>
              <Select
                multiple
                value={selectedFoods}
                onChange={handleFoodChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {foodOptions.map((food) => (
                  <MenuItem key={food} value={food}>
                    {food}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            {selectedFoods.map((food) => (
              <TextField
                key={food}
                label={`Poids pour ${food} (g)`}
                type="number"
                value={foodWeights[food] || ''}
                onChange={(e) => handleWeightChange(food, parseFloat(e.target.value))}
                fullWidth
              />
            ))}
  
            <Typography variant="subtitle1">
              Poids total estimé : {calculateTotalWeight()} g
            </Typography>
  
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Enregistrer
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    );
  };
  
