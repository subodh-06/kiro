import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isIssueDialogOpen: boolean;
  selectedIssueId: string | null;
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  isIssueDialogOpen: false,
  selectedIssueId: null,
  isSidebarOpen: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openIssueDialog: (state, action: PayloadAction<string>) => {
      state.isIssueDialogOpen = true;
      state.selectedIssueId = action.payload;
    },
    closeIssueDialog: (state) => {
      state.isIssueDialogOpen = false;
      state.selectedIssueId = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    }
  },
});

export const { openIssueDialog, closeIssueDialog, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;