import React from "react";
import {ThreadsSideBar} from "@/components/threads";
import styles from "@/styles/Home.module.css";
import {Flex, Grid, GridItem,} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import dynamic from 'next/dynamic'

const InboxHeaderProjectsList = dynamic(
    () => import('@/components/project/inbox-header-projects-list').then((mod) => mod.InboxHeaderProjectsList)
)
const Message = dynamic(
    () => import('@/components/messages').then((mod) => mod.Message)
)

function InboxPage() {
    return (
        <div className={'mail-box-main'}>
            <Flex padding={'16px 40px 15px'} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'} gap={3}
                  overflow={'auto hidden'} height={'69px'} className={'mail-box-subheader'}>
                <InboxHeaderProjectsList/>
            </Flex>

            <div className={styles.mailBg}>
                <Grid className={styles.mailGrid} templateColumns='calc(30% - 8px) calc(70% - 8px)' gap={4} height={'100%'}>
                    <GridItem w='100%' className={'threadSideBar'} id={'inbox-thread-side-bar'}>
                        <ThreadsSideBar/>
                    </GridItem>
                    <GridItem w='100%' className={'messageSideBar'} id={'inbox-message-side-bar'}>
                        <Message/>
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(InboxPage);
