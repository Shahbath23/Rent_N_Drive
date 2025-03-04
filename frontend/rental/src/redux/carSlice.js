import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async action to fetch cars
export const fetchCars = createAsyncThunk(
    'cars/fetchCars',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:3020/cars', {
                headers: {
                    Authorization: `${localStorage.getItem('token')}`,
                },
            });

            // Ensure that an empty response doesn't trigger an error
            return response.data.length > 0 ? response.data : [];
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // If 404, return an empty array instead of rejecting
                return [];
            }
            return rejectWithValue('Failed to fetch cars. Please try again later.');
        }
    }
);


// Async action to fetch bookings for a car
export const fetchBookings = createAsyncThunk(
    'cars/fetchBookings',
    async (carId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:3020/reservations/car/${carId}`, {
                headers: {
                    Authorization: `${localStorage.getItem('token')}`,
                },
            });

            return { carId, bookings: response.data || [] };
        } catch (err) {
            if (err.response && (err.response.status === 400 || err.response.status === 404)) {
                return { carId, bookings: [] }; // Treat as no bookings for this car
            }
            return rejectWithValue('Failed to fetch bookings. Please try again later.');
        }
    }
);

const carsSlice = createSlice({
    name: 'cars',
    initialState: {
        cars: [],
        bookings: {}, // Store bookings as a map: { carId: [bookings] }
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle cars fetching
            .addCase(fetchCars.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCars.fulfilled, (state, action) => {
                state.loading = false;
                state.cars = action.payload;
            })
            .addCase(fetchCars.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Handle bookings fetching
            .addCase(fetchBookings.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                const { carId, bookings } = action.payload;
                state.bookings[carId] = bookings;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default carsSlice.reducer;
