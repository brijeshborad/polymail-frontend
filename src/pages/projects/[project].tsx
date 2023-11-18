import styles from "@/styles/project.module.css";
import {
    Flex,
    Grid, GridItem,
} from "@chakra-ui/react";
import dynamic from 'next/dynamic';
import {useRouter} from "next/router";
import {ProjectHeader} from "@/components/project/project-header";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {getProjectById} from "@/redux/projects/action-reducer";

const ThreadsSideBar = dynamic(
    () => import('@/components/threads').then((mod) => mod.ThreadsSideBar)
)
const Message = dynamic(
    () => import('@/components/messages').then((mod) => mod.Message)
)

function ProjectInbox() {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (router.query.project) {
            dispatch(getProjectById({body: {id: router.query.project}}));
        }
    }, [dispatch, router.query.project])

    return (
        <>
            <Flex direction={'column'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'} flex={1}>

                <ProjectHeader/>

                <Grid className={styles.mailGrid} templateColumns='30% auto' padding={'16px 20px 16px'} gap={4}
                      flex={1}>
                    <GridItem w='100%' flex={1} className={'threadSideBar'} id={'inbox-thread-side-bar'}>
                        <ThreadsSideBar/>
                    </GridItem>
                    <GridItem w='100%' flex={1} className={'messageSideBar'} id={'inbox-message-side-bar'}>
                        <Message isProjectView={true}/>
                    </GridItem>
                </Grid>
            </Flex>
        </>
    )
}

export default ProjectInbox;
