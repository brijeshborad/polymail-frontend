import React, {useEffect, useState} from "react";
import {Mail, Mails, Projects} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {Grid, GridItem,} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Thread} from "@/models";

function Inbox() {
    const [isShow, setIsShow] = useState<boolean>(false);
    const [size, setSize] = useState<number>(0);
    const [thread, setThread] = useState<Thread>(null);
    const [userData, setUserData] = useState<any>(null);

    const {user} = useSelector((state: StateType) => state.auth);

    useEffect(() => {
        setUserData(user);
    }, [user]);

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

    const handleContent = (selectedThread: Thread) => {
        setThread(selectedThread);
    }

    if (!userData) {
        return <></>;
    }

    return (
        <div>
            {/*<Projects/>*/}
            <div className={styles.mailBg}>

                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={6}>
                    <GridItem w='100%'>
                        {((size < 991 && !isShow) || size > 991) &&
                        <Mails show={setIsShow} handleContent={handleContent}/>}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && isShow) || size > 991) && <Mail show={setIsShow} thread={thread}/>}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(Inbox);
