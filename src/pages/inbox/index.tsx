import React, {useEffect, useState} from "react";
import {Message, Threads} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {Grid, GridItem,} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {User} from "@/models";

function Inbox() {
    const [size, setSize] = useState<number>(0);
    const [userData, setUserData] = useState<User | null | undefined>(null);
    const {user} = useSelector((state: StateType) => state.auth);
    const {selectedThread} = useSelector((state: StateType) => state.threads);

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
            <div className={styles.mailBg}>

                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={6} height={'100%'}>
                    <GridItem w='100%'>
                        {((size < 991 && !selectedThread) || size > 991) &&
                        <Threads/>}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && selectedThread) || size > 991) && <Message/>}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(Inbox);
