import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { InitialUndoBodyType} from "@/types";

const initialState: any = {
  undoBody: null,
} as InitialUndoBodyType

const undoBodySlice = createSlice({
  name: 'undo-body',
  initialState,
  reducers: {
    undoBodyData: (state: InitialUndoBodyType, {payload: undoBody}: PayloadAction<any | null>) => {
      return {undoBody};
    }
  }
})

export const {undoBodyData} = undoBodySlice.actions
export default undoBodySlice.reducer
