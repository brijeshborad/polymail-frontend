import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialUserState} from "@/types";
import {UserDetails} from "@/models";

const initialState: any = {
    userDetails: {},
    isLoading: false,
    error: null,
    profilePicture: {},
    profilePictureUpdated: false,
    userDetailsUpdateSuccess: false
} as InitialUserState;

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUsersDetails: (state: InitialUserState, _action: PayloadAction<UserDetails>) => {
            return {...state, error: null, isLoading: false, userDetailsUpdateSuccess: false}
        },
        updateUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false, userDetailsUpdateSuccess: true}
        },
        updateUsersDetailsError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, userDetailsUpdateSuccess: false}
        },

        getUsersDetails: (state: InitialUserState, _action: PayloadAction<UserDetails>) => {
            return {...state, userDetails: {}, profilePictureUpdated: false, error: null, isLoading: false}
        },
        getUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false}
        },
        getUsersDetailsError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },

        uploadProfilePicture: (state: InitialUserState, _action: PayloadAction<{ file?: File }>) => {
            return {...state, error: null, profilePictureUpdated: false, isLoading: false, success: false}
        },
        uploadProfilePictureSuccess: (state: InitialUserState, {payload: profilePicture}: PayloadAction<{}>) => {
            return {...state, profilePicture, profilePictureUpdated: true,  error: null, isLoading: false, success: true}
        },
        uploadProfilePictureError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
        },

        getProfilePicture: (state: InitialUserState, _action: PayloadAction<{}>) => {
            return {...state, profilePicture: null, error: null, isLoading: true, success: false}
        },
        getProfilePictureSuccess: (state: InitialUserState, {payload: profilePicture}: PayloadAction<{}>) => {
            return {...state, profilePicture, error: null, isLoading: false, success: true}
        },
        getProfilePictureError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
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
    updateUserState
} = userSlice.actions
export default userSlice.reducer
