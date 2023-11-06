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
        <div>
            <Flex padding={'16px 40px 15px'} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'} gap={3}
                  overflowX={'auto'} height={'69px'}>
                <InboxHeaderProjectsList/>
            </Flex>

            <div className={styles.mailBg}>
                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={4} height={'100%'}>
                    <GridItem w='100%'>
                        <ThreadsSideBar cachePrefix={'inbox-page'}/>
                    </GridItem>
                    <GridItem w='100%'>
                        <Message/>
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(InboxPage);
