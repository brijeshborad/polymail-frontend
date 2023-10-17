import styles from "@/styles/project.module.css";
import {
    Flex,
    Grid, GridItem,
} from "@chakra-ui/react";
import dynamic from 'next/dynamic';
import {useRouter} from "next/router";
import {ProjectHeader} from "@/components/project/project-header";

const ThreadsSideBar = dynamic(
    () => import('@/components/threads').then((mod) => mod.ThreadsSideBar)
)
const Message = dynamic(
    () => import('@/components/messages').then((mod) => mod.Message)
)

function ProjectInbox() {
    const router = useRouter();

    return (
        <>
            <Flex direction={'column'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'} flex={1}>

                <ProjectHeader/>

                <Grid className={styles.mailGrid} templateColumns='30% auto' padding={'16px 20px 16px'} gap={4}
                      flex={1}>
                    <GridItem w='100%' flex={1}>
                        <ThreadsSideBar cachePrefix={`project-${router.query.project}`}/>
                    </GridItem>
                    <GridItem w='100%' flex={1}>
                        <Message isProjectView={true}/>
                    </GridItem>
                </Grid>
            </Flex>
        </>
    )
}

export default ProjectInbox;
