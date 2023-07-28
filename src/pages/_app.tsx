import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraBaseProvider, extendBaseTheme} from "@chakra-ui/react";
import {wrapper} from "@/redux/store";
import {Provider} from "react-redux";
import {Header} from "@/components";
import chakraTheme from '@chakra-ui/theme'
import {Inter} from "next/font/google";
import Head from 'next/head'

const {Button, Input, Menu, Checkbox, Heading} = chakraTheme.components

const theme = extendBaseTheme({
    components: {
        Button,
        Input,
        Menu,
        Checkbox,
        Heading
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
                    <Header/>
                    <Component {...pageProps} />
                </main>
            </ChakraBaseProvider>
        </Provider>
    )
}
