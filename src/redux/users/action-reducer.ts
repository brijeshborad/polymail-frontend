import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialUserState, ReducerActionType} from "@/types";

const initialState: any = {
    userDetails: null,
    isLoading: false,
    error: null,
    profilePicture: {},
    profilePictureUpdated: false,
    userDetailsUpdateSuccess: false,
    profilePictureRemoved: false
} as InitialUserState;

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUsersDetails: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, userDetailsUpdateSuccess: false}
        },
        updateUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, isLoading: false, userDetailsUpdateSuccess: true}
        },
        updateUsersDetailsError: (state: InitialUserState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, userDetailsUpdateSuccess: false}
        },

        getUsersDetails: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, userDetails: {}, profilePictureUpdated: false, isLoading: false}
        },
        getUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, isLoading: false}
        },
        getUsersDetailsError: (state: InitialUserState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        uploadProfilePicture: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, profilePictureUpdated: false, isLoading: false}
        },
        uploadProfilePictureSuccess: (state: InitialUserState, {payload: profilePicture}: PayloadAction<{}>) => {
            return {...state, profilePicture, profilePictureUpdated: true, isLoading: false}
        },
        uploadProfilePictureError: (state: InitialUserState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        getProfilePicture: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, profilePicture: null, isLoading: true, profilePictureUpdated: false}
        },
        getProfilePictureSuccess: (state: InitialUserState, {payload: profilePicture}: PayloadAction<{}>) => {
            return {...state, profilePicture, isLoading: false}
        },
        getProfilePictureError: (state: InitialUserState,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false, success: false}
        },

        removeProfilePicture: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, profilePicture: null, isLoading: false, profilePictureRemoved: false}
        },
        removeProfilePictureSuccess: (state: InitialUserState, _action: PayloadAction<{}>) => {
            return {...state, profilePicture: null, isLoading: false, profilePictureRemoved: true}
        },
        removeProfilePictureError: (state: InitialUserState,  _action: PayloadAction<any>) => {
            return {...state, profilePicture: null, isLoading: false, profilePictureRemoved: false}
        },

        removeProfileData: (state: InitialUserState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        removeProfileDataSuccess: (state: InitialUserState, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false}
        },
        removeProfileDataError: (state: InitialUserState,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },


        updateUserState: (state: InitialUserState, action: PayloadAction<InitialUserState>) => {
            return {...state, ...action.payload}
        }
    }
})


export const {
    updateUsersDetails,
    updateUsersDetailsSuccess,
    updateUsersDetailsError,
    getUsersDetails,
    getUsersDetailsSuccess,
    getUsersDetailsError,
    uploadProfilePicture,
    uploadProfilePictureSuccess,
    uploadProfilePictureError,
    getProfilePicture,
    getProfilePictureSuccess,
    getProfilePictureError,
    removeProfilePicture,
    removeProfilePictureSuccess,
    removeProfilePictureError,
    removeProfileData,
    removeProfileDataSuccess,
    removeProfileDataError,
    updateUserState
} = userSlice.actions
export default userSlice.reducer
