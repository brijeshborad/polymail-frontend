import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraBaseProvider, extendBaseTheme} from "@chakra-ui/react";
import {wrapper} from "../redux/store";
import {Provider} from "react-redux";

import chakraTheme from '@chakra-ui/theme'

const { Button, Input, Menu } = chakraTheme.components

const theme = extendBaseTheme({
    components: {
        Button,
        Input,
        Menu
    },
})

export default function App({Component, ...rest}: AppProps) {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;
    return (
        <Provider store={store}>
            <ChakraBaseProvider theme={theme}>
                <Component {...pageProps} />
            </ChakraBaseProvider>
        </Provider>
    )
}
