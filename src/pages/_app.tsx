import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraBaseProvider, extendBaseTheme, ThemeConfig } from '@chakra-ui/react';
import { wrapper } from '@/redux/store';
import { Provider } from 'react-redux';
import chakraTheme from '@chakra-ui/theme';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import dynamic from 'next/dynamic'
const Header = dynamic(
    () => import('@/components/common').then((mod) => mod.Header)
)
import React from 'react';
import { useRouter } from 'next/router';
import { HEADER_NOT_ALLOWED_PATHS } from '@/utils/constants';
import {setGlobalStore} from "@/utils/common.functions";
import { HighlightInit } from '@highlight-run/next/client';
import {GlobalComponent} from "@/components/common/global-component";

const { Button, Input, Menu, Checkbox, Heading, Divider, Alert, Modal, Popover, Tooltip, Textarea, Spinner, List, Select, Table, Progress, Skeleton, Radio, Drawer, Badge } =
    chakraTheme.components;
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
        Table,
        Progress,
        Skeleton,
        Radio,
        Drawer,
        Badge
    },
});

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, ...rest }: AppProps) {
    const { store, props } = wrapper.useWrappedStore(rest);
    setGlobalStore(store);
    const { pageProps } = props;
    const router = useRouter();
    return (

        <Provider store={store}>
            <HighlightInit
				projectId={'kgr5qxne'}
				serviceName="polymail-teams"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [],
				}}
		    />
            <ChakraBaseProvider theme={theme}>
                <Head>
                    <title>Polymail</title>
                    <meta name="description" content="All in one inbox" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <main className={`main ${inter.className}`}>
                    {store.getState().auth?.user?.token && !HEADER_NOT_ALLOWED_PATHS.includes(router.pathname) &&
                    <>
                        <GlobalComponent/>
                        <Header/>
                    </>}
                    <Component {...pageProps} />
                </main>
            </ChakraBaseProvider>
        </Provider>
    );
}
