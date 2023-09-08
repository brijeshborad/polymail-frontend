import React, {useEffect, useState} from "react";
import {ThreadsSideBar} from "@/components/threads";
import styles from "@/styles/Home.module.css";
import {Flex, Grid, GridItem,} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project, User} from "@/models";
import {InboxHeaderProjectsList} from "@/components/project/inbox-header-projects-list";
import {Message} from "@/components/messages";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";

function InboxPage() {
    const [size, setSize] = useState<number>(0);
    const [userData, setUserData] = useState<User | null | undefined>(null);
    const {user} = useSelector((state: StateType) => state.auth);
    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const {projects} = useSelector((state: StateType) => state.projects);
    const [projectData, setProjectData] = useState<Project[]>([]);
    const dispatch = useDispatch();

    useEffect(() => {
        setUserData(user);
    }, [user]);

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch])

    useEffect(() => {
        if (projects && projects.length > 0) {
            let favoriteData = projects.filter((item: Project) => item.projectMeta?.favorite);
            setProjectData(favoriteData)
        }
    }, [projects])

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
            {!!projectData.length ? <InboxHeaderProjectsList/> : <Flex gap={2} py={4} px={10} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'}>
                <SkeletonLoader height={'36px'} skeletonLength={4} />
            </Flex>}

            <div className={styles.mailBg}>
                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={6} height={'100%'}>
                    <GridItem w='100%'>
                        {((size < 991 && !selectedThread) || size > 991) &&
                        <ThreadsSideBar cachePrefix={'inbox-page'}/>}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && selectedThread) || size > 991) && <Message/>}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(InboxPage);
