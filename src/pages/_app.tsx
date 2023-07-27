import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraBaseProvider, extendBaseTheme} from "@chakra-ui/react";
import {wrapper} from "../redux/store";
import {Provider} from "react-redux";
import {Header} from "../components";
import chakraTheme from '@chakra-ui/theme'
import {Inter} from "next/font/google";

const {Button, Input, Menu, Checkbox} = chakraTheme.components

const theme = extendBaseTheme({
    components: {
        Button,
        Input,
        Menu,
        Checkbox
    },
})


const inter = Inter({subsets: ['latin']})

export default function App({Component, ...rest}: AppProps) {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;
    return (
        <Provider store={store}>
            <ChakraBaseProvider theme={theme}>
                <main className={`main ${inter.className}`}>
                    <Header/>
                    <Component {...pageProps} />
                </main>
            </ChakraBaseProvider>
        </Provider>
    )
}
