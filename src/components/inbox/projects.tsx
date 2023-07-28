import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Grid, GridItem} from "@chakra-ui/react";
import {ProjectButton} from "@/components";
import {DisneyIcon, DotIcon, FolderIcon} from "@/icons";

export function Projects() {
    return (
        <div className={styles.filterTabs}>
            <Grid templateColumns='repeat(6, 1fr)' gap={3}>
                <GridItem w='100%'>
                    <ProjectButton text="Disney Launch" iconStart={<DisneyIcon className={styles2.icon}/>}/>
                </GridItem>
                <GridItem w='100%'>
                    <ProjectButton text="Handcrafted Frozen Mouse" imageStart={'/image/handcraft.png'}
                                   iconEnd={<DotIcon/>}/>
                </GridItem>
                <GridItem w='100%'>
                    <ProjectButton text="Generic Plastic Car" imageStart={'/image/car.png'}
                                   iconEnd={<DotIcon/>}/>
                </GridItem>
                <GridItem w='100%'>
                    <ProjectButton text="Disney Launch" iconStart={<DisneyIcon className={styles2.icon}/>}/>
                </GridItem>
                <GridItem w='100%'>
                    <ProjectButton text="Generic Plastic Car" imageStart={'/image/car.png'}/>
                </GridItem>
                <GridItem w='100%'>
                    <ProjectButton text="Show all projects (7)" buttonClass={styles2.textBlue}
                                   iconStart={<FolderIcon stroke={'#266DF0'} className={styles2.icon}/>}/>
                </GridItem>
            </Grid>
        </div>
    )
}
