import {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Grid, GridItem} from "@chakra-ui/react";
import {DisneyIcon, FolderIcon} from "@/icons";
import {ProjectButton} from "@/components/common";
import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {StateType} from "@/types";

export function Projects() {
    const dispatch = useDispatch();

    const {projects} = useSelector((state: StateType) => state.projects);

    const getProjects = useCallback(() => {
        dispatch(getAllProjects());
    }, [dispatch])

    useEffect(() => {
        getProjects();
    }, [getProjects])

    return (
        <div className={styles.filterTabs}>
            <Grid templateColumns='repeat(6, 1fr)' gap={3} overflowX={'auto'}>
                {projects && !!projects.length && projects.map((project, i) => (
                    <GridItem w='100%' key={i + 1}>
                        <ProjectButton text={project?.name} iconStart={<DisneyIcon className={styles2.icon}/>}/>
                    </GridItem>
                ))}
                <GridItem w='100%'>
                    <ProjectButton text="Show all projects (7)" buttonClass={styles2.textBlue}
                                   iconStart={<FolderIcon stroke={'#266DF0'} className={styles2.icon}/>}/>
                </GridItem>
            </Grid>
        </div>
    )
}
