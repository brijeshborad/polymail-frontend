import { InitialKeyNavigationStateType } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: InitialKeyNavigationStateType = {
    action: 'idle',
    target: 'threads',
};

const keyNavigationSlice = createSlice({
    name: 'key-navigation',
    initialState,
    reducers: {
        keyPress: (state: InitialKeyNavigationStateType, action: PayloadAction<InitialKeyNavigationStateType>) => {
            return {...state, ...action.payload}
        },
    },
});

export const {
	keyPress
} = keyNavigationSlice.actions;
export default keyNavigationSlice.reducer;