import { InitialGlobalEventsStateType } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: InitialGlobalEventsStateType = {
    event: 'idle',
};

const globalEventsSlice = createSlice({
    name: 'event-handler',
    initialState,
    reducers: {
        fireEvent: (state: InitialGlobalEventsStateType, action: PayloadAction<InitialGlobalEventsStateType>) => {
            return {...state, ...action.payload}
        },
    },
});

export const {
	fireEvent
} = globalEventsSlice.actions;
export default globalEventsSlice.reducer;
