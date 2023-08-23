import React, {useCallback, useEffect, useState} from "react";
import withAuth from "@/components/withAuth";
import {
    Grid,
    GridItem,
    Heading,
    Flex,
    Text,
    UnorderedList,
    ListItem,
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {UserIcon} from "@/icons";
import {Billing, EmailAddress, Members, Profile, Signature} from "@/components/settings";
import Router from "next/router";


function Index() {
    const [currentTab, setCurrentTab] = useState<any>(null);
    const [tabTitle, setTabTitle] = useState<any>(null);

    const openTabs = useCallback((type: string = 'profile') => {
        if (type === 'profile') {
            setTabTitle('Profile');
            Router.push('/settings/profile');
        } else if (type === 'signature') {
            setTabTitle('Signature');
            Router.push('/settings/signature');
        } else if (type === 'email_address') {
            setTabTitle('Email Address');
            Router.push('/settings/emailAddress');
        } else if (type === 'billing') {
            setTabTitle('Billing');
            Router.push('/settings/billing');
        } else if (type === 'members') {
            Router.push('/settings/members');
            setTabTitle('Members');
        }
    }, []);

    useEffect(() => {
        openTabs()
    }, [openTabs])


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
                                      className={tabTitle === 'Profile' ? styles.active : ''}>Profile</ListItem>
                            <ListItem onClick={() => openTabs('signature')}
                                      className={tabTitle === 'Signature' ? styles.active : ''}>Signature</ListItem>
                            <ListItem onClick={() => openTabs('email_address')}
                                      className={tabTitle === 'Email Address' ? styles.active : ''}>Email
                                Addresses</ListItem>
                            <ListItem onClick={() => openTabs('billing')}
                                      className={tabTitle === 'Billing' ? styles.active : ''}>Billing</ListItem>
                        </UnorderedList>
                    </Flex>

                    <Flex direction={'column'}>
                        <Heading display={'flex'} alignItems={'center'} mb={2} as='h5' size='sm'
                                 className={styles.settingListTitle}
                                 textTransform={'uppercase'}><UserIcon/> Workspace</Heading>

                        <UnorderedList className={styles.settingList}>
                            <ListItem onClick={() => openTabs('members')}
                                      className={tabTitle === 'Members' ? styles.active : ''}>Members</ListItem>
                        </UnorderedList>
                    </Flex>
                </GridItem>

                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> {tabTitle} </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            {currentTab}
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>
        </div>
    )
}

export default withAuth(Index);
