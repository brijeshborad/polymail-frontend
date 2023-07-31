import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Projects, Mails, Mail} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {
    Grid,
    GridItem,
} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";

export default function Home() {
    const {projects} = useSelector((state: StateType) => state.projects);
    const [isShow, setIsShow] = useState(false);
    const [size, setSize] = useState();

    useEffect(() => {
        if (typeof window !== "undefined") {
            console.log('=====', window.innerWidth)
        }
        function updateSize() {
            setSize(window.innerWidth);
        }

        console.log(size)
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
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
