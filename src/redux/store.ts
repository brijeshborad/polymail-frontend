import {configureStore} from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
import {createWrapper} from "next-redux-wrapper";

import rootReducer from './reducer';
import rootSaga from './saga';

const sagaMiddleware = createSagaMiddleware();

export function makeStore(initialState: any) {
    const store = configureStore({
        reducer: rootReducer,
        preloadedState: initialState,
        middleware: (getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware))
    });
    sagaMiddleware.run(rootSaga);

    if (process.env.NODE_ENV !== 'production' && module.hot) {
        module.hot.accept('./reducer', () => store.replaceReducer(rootReducer))
    }
    return store;
}

export const wrapper = createWrapper(makeStore, {debug: true});
