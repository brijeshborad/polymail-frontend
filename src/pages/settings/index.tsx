import React, {useCallback, useEffect, useState} from "react";
import withAuth from "@/components/withAuth";
import {
    Grid,
    GridItem,
    Heading,
    Flex,
    UnorderedList,
    ListItem,
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon} from "@/icons";
import Router, { useRouter } from "next/router";

let activeTab = ''

function Index() {
    const router = useRouter()

    let currentRoute = router.pathname.split('/');
    const openTabs = useCallback((type: string) => {
        if (type === 'profile') {
            activeTab = 'Profile'
            Router.push('/settings/profile');
        } else if (type === 'signature') {
            activeTab = 'Signature'
            Router.push('/settings/signature');
        } else if (type === 'email_address' ) {
            activeTab = 'Email Address'
            Router.push('/settings/email-address');
        } else if (type === 'billing') {
            activeTab = 'Billing'
            Router.push('/settings/billing');
        } else if (type === 'members') {
            Router.push('/settings/members');
            activeTab = 'Members'
        }
    }, []);

    useEffect(() => {
        console.log('currentRoute' , currentRoute[currentRoute.length - 1])
        if (currentRoute[currentRoute.length - 1] === 'profile') {
            activeTab = 'Profile'
        } else if (currentRoute[currentRoute.length - 1] === 'signature') {
            activeTab = 'Signature'
        } else if (currentRoute[currentRoute.length - 1] === 'email-address') {
            activeTab = 'Email Address'
        } else if (currentRoute[currentRoute.length - 1] === 'billing') {
            activeTab = 'Billing'
        } else if (currentRoute[currentRoute.length - 1] === 'members') {
            activeTab = 'Members'
        }
    }, [currentRoute])


    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>

                    <Heading as='h4' mb={8} className={styles.settingTitle}> Settings </Heading>

                    <Flex direction={'column'} mb={8}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                 className={styles.settingListTitle} textTransform={'uppercase'}><UserIcon/> My Account</Heading>

                        <UnorderedList display={'flex'} gap={1} className={styles.settingList}>
                            <ListItem onClick={() => openTabs('profile')}
                                      className={activeTab === 'Profile' ? styles.active : ''}>Profile</ListItem>
                            <ListItem onClick={() => openTabs('signature')}
                                      className={activeTab === 'Signature' ? styles.active : ''}>Signature</ListItem>
                            <ListItem onClick={() => openTabs('email_address')}
                                      className={activeTab === 'Email Address' ? styles.active : ''}>Email
                                Addresses</ListItem>
                            <ListItem onClick={() => openTabs('billing')}
                                      className={activeTab === 'Billing' ? styles.active : ''}>Billing</ListItem>
                        </UnorderedList>
                    </Flex>

                    <Flex direction={'column'}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                 className={styles.settingListTitle}
                                 textTransform={'uppercase'}><UserIcon/> Workspace</Heading>

                        <UnorderedList className={styles.settingList}>
                            <ListItem onClick={() => openTabs('members')}
                                      className={activeTab === 'Members' ? styles.active : ''}>Members</ListItem>
                        </UnorderedList>
                    </Flex>
                </GridItem>
            </Grid>
        </div>
    )
}

export default withAuth(Index);
