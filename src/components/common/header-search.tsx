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

export function HeaderSearch() {
    const dispatch = useDispatch();
    const {tabValue, isThreadSearched} = useSelector((state: StateType) => state.threads);
    const {userDetails} = useSelector((state: StateType) => state.users);
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
        if (router.pathname === '/projects') {
            setIsProjectRoute(true);
            setBadges(['Projects']);
        } else {
            setIsProjectRoute(false);
            setBadges([]);
        }
    }, [router.pathname]);

    useEffect(() => {
        if (isProjectRoute) {
            projectService.setProjectSearchString(searchString);
        }
    }, [searchString, isProjectRoute])

    const searchCancel = (callAPI: boolean = false) => {
        if (isProjectRoute) {
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
            dispatch(getAllThreads({body: {mailbox: tabValue, account: selectedAccount.id}}));
        }
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            searchCancel(false);
            if (searchString) {
                threadService.searchThread();
                socketService.searchThreads(userDetails?.id, searchString);
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
                        placeholder={isProjectRoute ? 'Search projects' : 'Search'}
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
