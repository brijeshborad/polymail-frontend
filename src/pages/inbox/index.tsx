import React, {useEffect, useState} from "react";
import {ThreadsSideBar} from "@/components/threads";
import styles from "@/styles/Home.module.css";
import {Flex, Grid, GridItem,} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {User} from "@/models";
import {InboxHeaderProjectsList} from "@/components/project/inbox-header-projects-list";
import {Message} from "@/components/messages";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import SelectedThreads from "@/components/threads/selected-threads";

function InboxPage() {
    const [size, setSize] = useState<number>(0);
    const [userData, setUserData] = useState<User | null | undefined>(null);
    const {user} = useSelector((state: StateType) => state.auth);
    const {selectedThread, isThreadSearched, multiSelection} = useSelector((state: StateType) => state.threads);
    const {isLoading} = useSelector((state: StateType) => state.projects);
    const dispatch = useDispatch();

    const isMultiItemsSelected = isThreadSearched && multiSelection && multiSelection.length > 0

    useEffect(() => {
        setUserData(user);
    }, [user]);

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch])

    function updateSize() {
        setSize(window.innerWidth);
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener('resize', updateSize);
            updateSize();
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener('resize', updateSize)
            }
        };
    }, []);

    if (!userData) {
        return <></>;
    }

    return (
        <div>
            <Flex padding={'16px 40px 15px'} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'} gap={3}
                                 overflowX={'auto'}>
                {isLoading && <SkeletonLoader height={'36px'} skeletonLength={6} width={'216px'}/>}
                <InboxHeaderProjectsList/> 
            </Flex>

            <div className={styles.mailBg}>
                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={4} height={'100%'}>
                    <GridItem w='100%'>
                        {((size < 991 && !selectedThread) || size > 991) &&
                        <ThreadsSideBar cachePrefix={'inbox-page'} />}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && selectedThread) || size > 991) && (
                          <>
                            {isMultiItemsSelected ? (
                              <SelectedThreads />
                            ) : (
                              <Message/>
                            )}
                          </>
                        )}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(InboxPage);
