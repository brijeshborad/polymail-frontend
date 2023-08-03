import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect, useState} from "react";
import {Mail, Mails, Projects} from "@/components/inbox";
import styles from "@/styles/Home.module.css";
import {Grid, GridItem, useDisclosure} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {getAllOrganizations} from "@/redux/organizations/action-reducer";
import {AddOrganization} from "@/components/custom-model/add-organization";

function Inbox() {
    // const {projects} = useSelector((state: StateType) => state.projects);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [size, setSize] = useState<number>(0);

    const [content, setContent] = useState([]);
    const [threadId, setThreadId] = useState('');
    const [tab, setTab] = useState('INBOX');
    const {threads, error} = useSelector((state: StateType) => state.threads);
    const {organizations} = useSelector((state: StateType) => state.organizations);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isModelShow, setIsModelShow] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        getAllThread();
    },[])

    useEffect(() => {
        getAllThread();
    },[tab])

    const handleTab = (e) => {
        setTab(e);
    }

    const getAllThread = () => {
        dispatch(getAllThreads({mailbox: tab}));
    }

    useEffect(() => {
        setContent(threads);
        if (threads && threads.length) {
            handleContent(threads[0]);
        }
    }, [threads])

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

    const handleContent = (e) => {
        setThreadId(e.id);
    }

    useEffect(() => {
        getOrganizations();
    }, []);

    const getOrganizations = () => {
        dispatch(getAllOrganizations({organization: null}, null));
    }

    useEffect(() => {
        if (organizations && organizations.length) {
            setIsModelShow(false)
        } else {
            setIsModelShow(true)
        }
    }, [organizations]);
    return (
        <div>
            {isModelShow && <AddOrganization onOpen={onOpen} onClose={onClose}/> }

            <Projects/>
            <div className={styles.mailBg}>

                <Grid className={styles.mailGrid} templateColumns='30% auto' gap={10}>
                    <GridItem w='100%'>
                        {((size < 991 && !isShow) || size > 991) && <Mails show={setIsShow} content={content} handleContent={handleContent} handleTab={handleTab}/>}
                    </GridItem>
                    <GridItem w='100%'>
                        {((size < 991 && isShow) || size > 991) && <Mail show={setIsShow} id={threadId}/>}
                    </GridItem>
                </Grid>
            </div>
        </div>
    )
}

export default withAuth(Inbox);
