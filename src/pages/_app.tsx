import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraBaseProvider, extendBaseTheme, ThemeConfig} from "@chakra-ui/react";
import {wrapper} from "@/redux/store";
import {Provider} from "react-redux";
import chakraTheme from '@chakra-ui/theme'
import {Inter} from "next/font/google";
import Head from 'next/head'

const {Button, Input, Menu, Checkbox, Heading, Divider, Alert, Modal, Popover, Tooltip, Textarea, Spinner} = chakraTheme.components
const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};
const theme = extendBaseTheme({
    config,
    components: {
        Button,
        Input,
        Menu,
        Checkbox,
        Heading,
        Divider,
        Alert,
        Modal,
        Tooltip,
        Textarea,
        Popover,
        Spinner
    },
})


const inter = Inter({subsets: ['latin']})

export default function App({Component, ...rest}: AppProps) {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;
    return (
        <Provider store={store}>
            <ChakraBaseProvider theme={theme}>
                <Head>
                    <title>Polymail</title>
                    <meta name="description" content="All in one inbox"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className={`main ${inter.className}`}>
                    <Component {...pageProps} />
                </main>
            </ChakraBaseProvider>
        </Provider>
    )
}
