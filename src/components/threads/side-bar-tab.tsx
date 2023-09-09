import {Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {StateType, TabProps} from "@/types";
import React, {useState} from "react";
import {ThreadsSideBarList} from "@/components/threads";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {useRouter} from "next/router";

export function ThreadsSideBarTab(props: TabProps) {
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [tabName, setTabName] = useState<string>('every-thing');
    const router = useRouter();
    const dispatch = useDispatch();

    const changeThread = (type: string) => {
         setTabName(type);
         if (type === 'every-thing') {
             if (selectedAccount && selectedAccount.id) {
                 dispatch(getAllThreads({mailbox: props.tab, account: selectedAccount.id}));
             }
         } else if (type === 'just-mine') {
            if (router.query.project) {
                dispatch(getAllThreads({mailbox: props.tab, project: router.query.project as string, mine: true}));
            } else {
                dispatch(getAllThreads({mailbox: props.tab}));
            }
         } else if (type === 'projects') {
             dispatch(getAllThreads({project: "ALL", mailbox: props.tab}));
         }
    }
    return (
        <>
            <div>
                <Flex overflowX={'auto'} align={'center'}>
                    <div className={styles.checkBoxLabel}>
                        <Checkbox defaultChecked>Select All</Checkbox>
                    </div>

                    <div className={styles.mailOtherOption}>
                        <Flex align={'center'} gap={2}>
                            { router.query.project && (
                            <div className={tabName === 'every-thing' ? styles.active : ''}>
                                <Button colorScheme='white' onClick={() => changeThread('every-thing')}>Everything</Button>
                            </div>
                            )}
                            <div className={tabName === 'just-mine' ? styles.active : ''}>
                                <Button colorScheme='white' onClick={() => changeThread('just-mine')}>Just mine</Button>
                            </div>
                            { !router.query.project &&
                            <div className={tabName === 'projects' ? styles.active : ''}>
                                <Button colorScheme='white' onClick={() => changeThread('projects')}>Projects</Button>
                            </div>
                            }
                        </Flex>
                    </div>
                </Flex>
            </div>


            {props.showLoader && (
                <Flex direction={'column'} gap={2} mt={5}>
                    <SkeletonLoader skeletonLength={15} />
                </Flex>
            )}

            <ThreadsSideBarList tab={props.tab} />
        </>
    )
}
