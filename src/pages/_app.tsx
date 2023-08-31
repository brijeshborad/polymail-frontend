import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraBaseProvider, extendBaseTheme, ThemeConfig} from "@chakra-ui/react";
import {wrapper} from "@/redux/store";
import {Provider} from "react-redux";
import chakraTheme from '@chakra-ui/theme'
import {Inter} from "next/font/google";
import Head from 'next/head'
import {Header} from "@/components/common";
import React from "react";

const {Button, Input, Menu, Checkbox, Heading, Divider, Alert, Modal, Popover, Tooltip, Textarea, Spinner, List, Select, Table} = chakraTheme.components
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
        Spinner,
        List,
        Select,
        Table
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
                    {store.getState().auth?.user?.token && <Header/> }
                    <Component {...pageProps} />
                </main>
            </ChakraBaseProvider>
        </Provider>
    )
}
