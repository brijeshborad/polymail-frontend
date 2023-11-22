import styles from "@/styles/Inbox.module.css";
import {
    Flex,
    TabPanels,
    Tabs
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {UrlManager} from "@/components/threads/url-manager";
import {SideBarHeader} from "@/components/threads/side-bar-header";

const ThreadsSideBarTab = dynamic(() => import("@/components/threads").then(mod => mod.ThreadsSideBarTab));

export function ThreadsSideBar() {
    return (
        <>
            <UrlManager/>
            <Flex direction={'column'} gap={5} className={styles.mailListTabs}>
                <Tabs>
                    <SideBarHeader/>
                    <TabPanels marginTop={5}>
                        <ThreadsSideBarTab/>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
