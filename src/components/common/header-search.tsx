import styles from "@/styles/Home.module.css";
import {Badge, Button, Flex, Input, InputGroup, InputRightElement} from "@chakra-ui/react";
import {CloseIcon, SearchIcon} from "@chakra-ui/icons";
import {FolderIcon, InboxIcon, UserIcon} from "@/icons";
import React, {useEffect, useRef, useState} from "react";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useRouter} from "next/router";
import {keyNavigationService, projectService, socketService, threadService} from "@/services";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

export function HeaderSearch() {
    const dispatch = useDispatch();
    const {tabValue, isThreadSearched} = useSelector((state: StateType) => state.threads);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {project} = useSelector((state: StateType) => state.projects);
    const [showCloseIcon, setShowCloseIcon] = useState(false);
    const [searchString, setSearchString] = useState<string>('');
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [badges, setBadges] = useState<string[]>([]);
    const [isProjectRoute, setIsProjectRoute] = useState<boolean>(false);
    const router = useRouter();

    // keyboard shortcuts
    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);

    useEffect(() => {
        if (!isThreadSearched) {
            setSearchString('');
        }
    }, [isThreadSearched]);

    useEffect(() => {
        if (router.pathname.includes('/projects')) {
            let currentBadges = ['Projects'];
            setIsProjectRoute(true);
            if (router.query.project && project) {
                currentBadges = [`Project: ${project.name || ''}`];
            }
            setBadges(currentBadges);
        } else {
            setIsProjectRoute(false);
            setBadges([]);
        }
    }, [router.pathname, router.query, project]);

    useEffect(() => {
        if (isProjectRoute) {
            projectService.setProjectSearchString(searchString);
        }
    }, [searchString, isProjectRoute])

    const searchCancel = (callAPI: boolean = false) => {
        if (isProjectRoute && !project) {
            if (callAPI) {
                setSearchString('');
                projectService.setProjectSearchString('');
            }
            return;
        }
        socketService.cancelThreadSearch(userDetails?.id);
        if (selectedAccount && selectedAccount.id && callAPI) {
            if (searchString) {
                threadService.cancelThreadSearch(true);
            }
            setSearchString('');
            dispatch(getAllThreads({
                body: {
                    mailbox: tabValue,
                    ...(isProjectRoute && project ? {project: project.id}: {account: selectedAccount.id}),
                    pagination: {
                        cutoff: dayjs().add(5, "day").format('YYYY-MM-DD'),
                        count: 100,
                        page: 1
                    }
                }
            }));
        }
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            searchCancel(false);
            if (searchString) {
                let finalSearchString = searchString;
                if (isProjectRoute && project) {
                    finalSearchString = `project:${project.id} ${searchString}`;
                }
                threadService.searchThread();
                socketService.searchThreads(userDetails?.id, finalSearchString);
                return;
            }
        }
    };

    const handleFocus = () => {
        keyNavigationService.toggleKeyNavigation(false);
        setShowCloseIcon(true);
    }

    const handleBlur = () => {
        keyNavigationService.toggleKeyNavigation(true);
        setTimeout(() => {
            setShowCloseIcon(false);
        }, 300)
    };

    return (
        <div className={`${styles.headerSearch} ${showCloseIcon && !isProjectRoute ? styles.headerSearchPopup : ''}`}
             onFocus={() => handleFocus()}
             onBlur={() => handleBlur()}>
            <InputGroup className={styles.inputGroup}>
                <Flex className={styles.headerSearchInput}>
                    <SearchIcon/>
                    {badges.map((badge: string, index: number) => (
                        <Badge key={index} textTransform={'none'} backgroundColor={'#ffffff'} color={'#08162F'}
                               borderRadius={'4px'}
                               fontSize={'12px'} fontWeight={'500'} padding={'4px 10px'} lineHeight={1}>{badge}</Badge>
                    ))}
                    <Input
                        type="text"
                        placeholder={isProjectRoute ? (project ? `Search in ${project.name}` :'Search projects') : 'Search'}
                        onChange={event => {
                            setSearchString(event.target.value);
                        }}
                        ref={searchInputRef}
                        value={searchString}
                        onKeyPress={e => handleKeyPress(e)}
                    />
                    <InputRightElement>
                        {showCloseIcon ? <div className={styles.inputRight} style={{background: "transparent"}}
                                              onClick={() => searchCancel(true)}>
                            <CloseIcon cursor={'pointer'} fontSize={'10'}/>
                        </div> : <div className={styles.inputRight}>⌘K</div>
                        }
                    </InputRightElement>

                </Flex>
            </InputGroup>

            {showCloseIcon && !isProjectRoute && <div className={styles.headerSearchPopupBox}>
                <Flex gap={2} align={'center'} pb={2}>
                    <Button className={styles.headerSearchPopupBoxButton} variant='outline' leftIcon={<InboxIcon/>}>
                        Message
                    </Button>
                    <Button className={styles.headerSearchPopupBoxButton} variant='outline'
                            leftIcon={<FolderIcon/>}>
                        Projects
                    </Button>
                    <Button className={styles.headerSearchPopupBoxButton} variant='outline' leftIcon={<UserIcon/>}>
                        People
                    </Button>
                </Flex>
            </div>}
        </div>
    )
}
