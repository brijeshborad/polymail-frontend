import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect, useState} from "react";
import {Mail, Mails, Projects} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {Grid, GridItem} from "@chakra-ui/react";

export default function Inbox() {
    const {projects} = useSelector((state: StateType) => state.projects);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [size, setSize] = useState<number>(0);

    function updateSize() {
        setSize(window.innerWidth);
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize);
        }
    }, []);

    return (
        <div>
            <Projects/>
            <div className={styles.mailBg}>

                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={10}>
                    <GridItem w='100%'>
                        {((size < 991 && !isShow) || size > 991) && <Mails show={setIsShow}/>}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && isShow) || size > 991) && <Mail show={setIsShow}/>}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}
