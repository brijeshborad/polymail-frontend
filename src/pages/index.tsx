import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Projects, Mails, Mail} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {
    Grid,
    GridItem,
} from "@chakra-ui/react";

export default function Home() {
    const {projects} = useSelector((state: StateType) => state.projects);
    return (
        <div>
            <Projects/>
            <div className={styles.mailBg}>
                <Grid templateColumns='30% 70%' gap={10}>
                    <GridItem w='100%'>
                        <Mails/>
                    </GridItem>
                    <GridItem w='100%'>
                        <Mail/>
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}
