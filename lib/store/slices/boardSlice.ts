import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BoardState {
  searchQuery: string;
  statusFilter: string | null;
  // You'll eventually store the active drag-and-drop column state here
}

const initialState: BoardState = {
  searchQuery: '',
  statusFilter: null,
};

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.statusFilter = action.payload;
    },
  },
});

export const { setSearchQuery, setStatusFilter } = boardSlice.actions;
export default boardSlice.reducer;